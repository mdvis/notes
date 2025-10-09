import { Notice, TextFileView, TFile, setIcon, Platform } from 'obsidian'
import {
  SMM_VIEW_TYPE,
  SAVE_ICON,
  IMPORT_ICON,
  EXPORT_ICON,
  SMM_TAG,
  OUTLINE_ICON,
  MINDMAP_ICON,
  PRINT_ICON
} from './ob/constant.js'
import { initApp } from './src/main.js'
import {
  assembleMarkdownText,
  parseMarkdownText,
  createDefaultText
} from './ob/metadataAndMarkdown.js'
import { hideTargetMenu, checkVersion } from './ob/utils.js'
import LZString from 'lz-string'

// 自定义视图类
class SmmEditView extends TextFileView {
  constructor(leaf, plugin) {
    super(leaf)
    this.plugin = plugin
    this.contentEl.style.padding = 0
    this.warpEl = this.contentEl.createDiv('smmMindmapEditContainer')
    this.warpEl.style.cssText = `
      width: 100%;
      height: 100%;
      overflow: hidden;
    `
    // 字符串类型的文件数据
    this.mindMapData = ''
    // 解析后的文件数据
    this.parsedMindMapData = null
    // Vue实例
    this.mindMapAPP = null

    // 当前视图是否处于激活状态
    this.isActive = true
    // 监听容器元素的尺寸变化
    this.resizeObserver = null
    // 当前文件是否存在未保存的内容
    this.isUnSave = false
    // 是否外部修改了当前文件
    this.isOuterChange = false
    // 是否不要触发data_change事件，当外部修改数据时进行同步使用
    this.isNotTriggerDataChange = false
    // 标签页是否处于隐藏状态
    this.isHidden = false
    // 标签页激活时是否需要通知思维导图刷新尺寸
    this.needResize = false
    // 按钮元素
    this.isOutlineEditMode = false
    this.saveButton = null
    this.exportButton = null
    this.importButton = null
    this.printOutlineButton = null
    this.changeToOutlineButton = null
    this.changeToMindmapButton = null
    this.savingTipEl = null
    this.isReadonlyMode = false
    this.toggleReadonlyButton = null
  }

  // 获取视图类型
  getViewType() {
    return SMM_VIEW_TYPE
  }

  // 获取图标名称
  getIcon() {
    return 'smm-icon'
  }

  // 右上角更多菜单扩展
  onPaneMenu(menu, source) {
    super.onPaneMenu(menu, source)
    // 隐藏特定默认菜单项
    hideTargetMenu(menu, '在新窗口中打开')
    hideTargetMenu(menu, '移动至新窗口')
  }

  // 切换到Markdown视图
  async switchToMarkdownView() {
    if (!this.file || !this.leaf) return
    // 获取默认的Markdown视图类型
    const mdViewType = this.app.viewRegistry.getTypeByExtension('md')
    // 切换到Markdown视图
    await this.leaf.setViewState({
      type: mdViewType,
      state: {
        ...this.leaf.getViewState().state,
        isSwitchToMarkdownViewFromSmmView: true
      },
      popstate: true // 保持导航历史
    })
  }

  // 打开视图
  async onOpen() {
    // 注册文件修改监听器
    this.registerEvent(
      this.app.vault.on('modify', this._handleExternalChange.bind(this))
    )
    // 注册激活状态监听
    this.registerEvent(
      this.app.workspace.on(
        'active-leaf-change',
        this._handleActiveChange.bind(this)
      )
    )
    // 注册窗口大小变化监听
    this.registerEvent(
      this.app.workspace.on('resize', this._handleResize.bind(this))
    )

    // 在视图头部右侧添加工具按钮
    this._addActionBtns()

    // 监听主题模式改变
    this._initThemeMode()

    // 检查更新
    if (this.plugin.settings.openVersionCheck) {
      checkVersion(version => {
        if (version) {
          new Notice(this.plugin._t('tip.pluginNewVersion') + version)
        }
      })
    }
  }

  // 获取视图数据（保存到文件）
  getViewData() {
    return this.mindMapData
  }

  // 解析加载的数据
  async setViewData(data, isClear) {
    if (this.isHidden) {
      return
    }
    if (isClear) {
      this.clear()
    }
    let rawData = data.trim()
    try {
      // 空文件处理
      if (!rawData) {
        // 文件内容为空
        throw new Error(this.plugin._t('tip.fileIsEmpty'))
      } else {
        this.parsedMindMapData = parseMarkdownText(rawData)
        const content = this.parsedMindMapData.metadata.content
        if (content) {
          this.parsedMindMapData.metadata.content = LZString.decompressFromBase64(
            content
          )
        } else {
          throw new Error('文件格式错误')
        }
      }
    } catch (error) {
      rawData = createDefaultText(
        '',
        this.plugin._getCreateDefaultMindMapOptions()
      )
    }
    this.mindMapData = rawData
    if (!this.parsedMindMapData) {
      this.parsedMindMapData = parseMarkdownText(rawData)
      this.parsedMindMapData.metadata.content = LZString.decompressFromBase64(
        this.parsedMindMapData.metadata.content
      )
    }
    if (isClear) {
      this._renderMindMap()
    } else if (this.mindMapAPP) {
      this.isNotTriggerDataChange = true
      this.mindMapAPP.$bus.$emit(
        'updateMindMapDataFromOb',
        this.parsedMindMapData.metadata.content
      )
    }
  }

  // 清理观察者
  _clearObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  }

  // 渲染思维导图
  _renderMindMap() {
    this.warpEl.empty()
    const el = this.warpEl.createDiv('smmMindMapEdit')
    el.style.cssText = `
      width: 100%;
      height: 100%;
      overflow: hidden;
    `
    // 清理旧的观察者
    this._clearObserver()
    // 创建新的尺寸观察者
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 10 && height > 10) {
          this._initializeMindMap(el)
          this._clearObserver()
          break
        }
      }
    })
    this.resizeObserver.observe(el)
  }

  // 实际初始化思维导图
  _initializeMindMap(el) {
    // 确保没有重复初始化
    if (this.mindMapAPP) return
    const filePath = this.file?.path
    let initLocationNodeId = ''
    const { fileToSubpathMap } = this.plugin
    if (fileToSubpathMap && fileToSubpathMap[filePath]) {
      initLocationNodeId = fileToSubpathMap[filePath]
      delete fileToSubpathMap[filePath]
    }
    this.mindMapAPP = initApp(el, {
      // 传递初始数据给思维导图渲染
      getInitMindMapData: () => {
        return this.parsedMindMapData.metadata.content
      },
      // 获取思维导图初始化位置的节点ID
      getInitLocationNodeId: () => {
        return initLocationNodeId
      },
      // 从思维导图获取最新数据
      getMindMapCurrentData: (content, linkData, textData) => {
        this.parsedMindMapData.metadata.content = content
        const { metadata, svgdata, linkdata } = this.parsedMindMapData
        this.mindMapData = assembleMarkdownText({
          metadata: {
            path: `${filePath}`,
            tags: Array.from(new Set([SMM_TAG, ...metadata.tags])),
            content: LZString.compressToBase64(content),
            yaml: metadata.yaml
          },
          svgdata,
          linkdata: linkData || linkdata || [],
          textdata: textData || []
        })
      },
      // 思维导图中触发保存
      saveMindMapData: (_, svgData) => {
        if (svgData) {
          this.parsedMindMapData.svgdata = LZString.compressToBase64(svgData)
        }
        this.forceSave()
      },
      // 获取思维导图配置
      getMindMapConfig: () => {
        return this.plugin.settings.mindMapConfig || {}
      },
      // 设置思维导图配置
      saveMindMapConfig: newConfig => {
        this.plugin.settings.mindMapConfig = newConfig
        this.plugin._saveSettings()
      },
      // 获取思维导图本地配置
      getMindMapLocalConfig: () => {
        const { mindMapLocalConfig, themeMode } = this.plugin.settings
        const config = mindMapLocalConfig || {}
        config.isDark =
          themeMode === 'follow'
            ? this.plugin._getObIsDark()
            : themeMode === 'dark'
        return config
      },
      // 设置思维导图本地配置
      saveMindMapLocalConfig: newConfig => {
        this.plugin.settings.mindMapLocalConfig = newConfig
        this.plugin._saveSettings()
      },
      // 获取设置
      getSettings: () => {
        return this.plugin.settings || {}
      },
      updateSettings: data => {
        this.plugin.settings = {
          ...this.plugin.settings,
          ...data
        }
        this.plugin._saveSettings()
      },
      // 获取所有文件
      getObAllFiles: (extraSelf = true) => {
        const fileList = this.app.vault.getFiles()
        if (extraSelf && this.file) {
          return fileList.filter(item => {
            return item.path !== this.file.path
          })
        }
        return fileList
      },
      // 创建内链文件信息
      createLinkInfoFromFilePath: filePath => {
        const file = this.app.vault.getAbstractFileByPath(filePath)
        if (!file) {
          return null
        }
        const linkText = this.app.fileManager.generateMarkdownLink(
          file,
          this.file?.path || ''
        )
        return {
          link: file.path,
          linkText
        }
      },
      // 打开文件
      openFile: (filePath, isNewTab = false) => {
        if (!filePath) return
        // [[xxx#xxx]]、[[xxx^xxx]]、[[xxx|xxx]]
        const arr = filePath.split(/(#|^|\|)/)
        filePath = arr[0]
        let postfix = ''
        if (arr.length > 1 && arr[1] !== '|') {
          postfix = arr.slice(1).join('')
        }
        this.app.vault.getAbstractFileBy
        let file = this.app.vault.getAbstractFileByPath(filePath)
        if (!file) {
          file = this.app.vault.getAbstractFileByPath(filePath + '.md')
        }
        if (file && file instanceof TFile) {
          this.app.workspace.openLinkText(file.path + postfix, '', isNewTab)
        }
      },
      // 核心方法：打开网页链接
      openWebLink: url => {
        if (this.app.openExternal) {
          this.app.openExternal(url)
          return
        }
        // 兼容旧版 Obsidian 和移动端
        try {
          // 桌面端 Electron 环境
          if (window.require) {
            const { shell } = window.require('electron')
            shell.openExternal(url)
            return
          }
        } catch (e) {
          console.error('Electron module not available', e)
        }
        // 通用回退方案
        window.open(url, '_blank', 'noopener,noreferrer')
      },
      // 保存文件到 vault
      saveFileToVault: async (file, isImg = true) => {
        try {
          const folder = isImg
            ? this._getFileSavePath(
                'imagePathType',
                'imagePath',
                'imageSubPath'
              )
            : this._getFileSavePath(
                'attachmentPathType',
                'attachmentPath',
                'attachmentSubPath'
              )
          await this.plugin._ensureDirectoryExists(folder)
          // 处理文件名冲突
          let fileName = file.name
          let counter = 1
          while (
            await this.app.vault.adapter.exists(
              folder ? `${folder}/${fileName}` : fileName
            )
          ) {
            const parts = file.name.split('.')
            const ext = parts.pop()
            fileName = `${parts.join('.')}_${counter}.${ext}`
            counter++
          }
          // 读取文件内容
          const arrayBuffer = await file.arrayBuffer()
          // 在vault中创建路径
          const vaultPath = folder ? `${folder}/${fileName}` : fileName
          // 写入文件
          await this.app.vault.createBinary(vaultPath, arrayBuffer)
          return vaultPath
        } catch (error) {
          return null
        }
      },
      // 获取资源路径
      getResourcePath: vaultPath => {
        return this.app.vault.adapter.getResourcePath(vaultPath)
      },
      // 获取当前文件的链接信息
      getObInternalLink: (...args) => {
        return this.app.fileManager.generateMarkdownLink(this.file, ...args)
      },
      // 显示ob提示
      showTip: tip => {
        new Notice(tip)
      },
      // 从ob://协议的URI中获取文件信息
      getFileFromUri: uri => {
        const params = new URLSearchParams(uri.split('?')[1])
        const vault = decodeURIComponent(params.get('vault') || '')
        const filePath = decodeURIComponent(params.get('file') || '')
        if (!vault || !filePath) return null
        // 检查当前vault是否匹配
        if (this.app.vault.getName() !== vault) {
          // 只允许添加当前仓库的文件
          new Notice(this.plugin._t('tip.onlyEnableSelectCurrentVaultFile'))
          return null
        }
        let res = this.app.vault.getAbstractFileByPath(filePath)
        if (!res) {
          res = this.app.vault.getAbstractFileByPath(filePath + '.md')
        }
        return res
      },
      isMobile: () => {
        return Platform.isMobile
      }
    })

    setTimeout(() => {
      this._listenMindMapEvent()
    }, 100)
  }

  // 根据uid定位到指定节点
  jumpToNodeByUid(uid) {
    if (!this.mindMapAPP) {
      return
    }
    this.mindMapAPP.$bus.$emit('jumpToNodeByUid', uid)
  }

  // 重写保存钩子（最直接的方式）
  async save() {
    if (!this.isActive) {
      return
    }
    // 获取一下最新数据
    // 取消本次自动保存
    if (this.mindMapAPP) {
      this.mindMapAPP.$bus.$emit('getMindMapCurrentData')
      this.mindMapAPP.$bus.$emit('clearAutoSave')
    }
    if (!this.mindMapData) {
      return
    }
    await super.save()
    this._setIsUnSave(false)
    this._hideSavingTip()
  }

  // 强制保存
  forceSave() {
    this._showSavingTip()
    this.save()
  }

  // 强制保存并更新图像数据
  forceSaveAndUpdateImage() {
    this._showSavingTip()
    this.mindMapAPP.$bus.$emit('saveToLocal', true, true)
  }

  // 监听思维导图事件
  _listenMindMapEvent() {
    this._onDataChange = this._onDataChange.bind(this)
    this.mindMapAPP.$bus.$on('data_change', this._onDataChange)
    // this.mindMapAPP.$bus.$on('view_data_change', this._onDataChange)
  }

  // 监听思维导图数据改变
  _onDataChange() {
    if (this.isNotTriggerDataChange) {
      this.isNotTriggerDataChange = false
      return
    }
    this._setIsUnSave(true)
  }

  // 处理窗口大小变化
  _handleResize() {
    if (!this.mindMapAPP || this.needResize) {
      return
    }
    if (this.isHidden) {
      this.needResize = true
      return
    }
    try {
      if (this.mindMapAPP.$updateMindMapSize) {
        const { width, height } = this.warpEl.getBoundingClientRect()
        if (width > 0 && height > 0) {
          this.mindMapAPP.$updateMindMapSize()
        }
      }
    } catch (e) {
      console.error('更新尺寸失败:', e)
    }
  }

  // 处理标签激活状态变化
  async _handleActiveChange(leaf) {
    const nowActive = leaf?.view === this
    if (nowActive && !this.isActive) {
      // 标签被激活
      this.isActive = true
      // 激活后刷新视图
      if (this.mindMapAPP) {
        // 更新外部修改
        if (this.isHidden) {
          this.isHidden = false
          this._checkForExternalChanges()
        }
        // 更新尺寸
        if (this.needResize) {
          this.needResize = false
          this._handleResize()
        }
        if (this.isOuterChange) {
          this.isOuterChange = false
        }
      }
    } else if (!nowActive && this.isActive) {
      // 标签失去激活
      const rect = this.warpEl.getBoundingClientRect()
      this.isHidden = rect.width === 0 || rect.height === 0
      if (this.mindMapAPP) {
        this.mindMapAPP.$bus.$emit('obTabDeactivate')
        this.save()
        this.mindMapAPP.$clearUpdateMindMapSize()
      }
      this.isActive = false
    }
  }

  // 处理外部文件修改
  async _handleExternalChange(file) {
    if (this.isActive) return
    if (file.path === this.file?.path) {
      this.isOuterChange = true
    }
  }

  // 检查外部修改并更新
  async _checkForExternalChanges() {
    if (!this.file) return
    try {
      // 重新加载文件数据
      const data = await this.app.vault.read(this.file)
      await this.setViewData(data, false)
    } catch (e) {
      console.error('处理外部修改失败:', e)
    }
  }

  // 清空视图数据
  clear() {
    // 清理观察者
    this._clearObserver()
    // 销毁应用实例
    if (this.mindMapAPP) {
      try {
        this.mindMapAPP.$destroy()
      } catch (e) {
        console.error('销毁实例时出错:', e)
      }
      this.mindMapAPP = null
    }
    this.warpEl.empty()
    this.mindMapData = ''
    this.parsedMindMapData = null
    this.isUnSave = false
    this.isOuterChange = false
    this.isNotTriggerDataChange = false
    this.isHidden = false
    this.needResize = false
    this._resetOnOutlineEditMode()
  }

  async onClose() {
    await this.save() // 手动保存
    this.clear()
    this.saveButton = null
    this.exportButton = null
    this.importButton = null
    this.printOutlineButton = null
    this.changeToOutlineButton = null
    this.changeToMindmapButton = null
    this.toggleReadonlyButton = null
  }

  // 防抖函数实现
  _debounce(func, wait) {
    let timeout
    return () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        func.call(this)
      }, wait)
    }
  }

  // 在视图头部右侧添加工具按钮
  _addActionBtns() {
    // svg需添加class="svg-icon"
    const viewActions = this.headerEl.querySelector('.view-actions')

    // 切换只读/编辑模式
    this.toggleReadonlyButton = this._createActionBtn(
      this.plugin._t('action.changeToReadonly'),
      'book-open',
      viewActions,
      async () => {
        await this.save()
        if (this.isReadonlyMode) {
          this.isReadonlyMode = false
          this.mindMapAPP.$bus.$emit('toggleReadonly', false)
          setIcon(this.toggleReadonlyButton, 'book-open')
          this.toggleReadonlyButton.setAttribute(
            'aria-label',
            this.plugin._t('action.changeToReadonly')
          )
          this._showButtons([
            this.saveButton,
            this.importButton,
            this.exportButton
          ])
        } else {
          this.isReadonlyMode = true
          this.mindMapAPP.$bus.$emit('toggleReadonly', true)
          setIcon(this.toggleReadonlyButton, 'edit-3')
          this.toggleReadonlyButton.setAttribute(
            'aria-label',
            this.plugin._t('action.changeToEdit')
          )
          this._hideButtons([
            this.saveButton,
            this.importButton,
            this.exportButton
          ])
        }
      },
      true
    )

    // 切换为大纲模式
    this.changeToOutlineButton = this._createActionBtn(
      this.plugin._t('action.changeToOutline'),
      OUTLINE_ICON,
      viewActions,
      async () => {
        await this.save()
        this._hideButtons([this.exportButton, this.changeToOutlineButton])
        this._showButtons([this.printOutlineButton, this.changeToMindmapButton])
        // 保存按钮文案修改
        this.saveButton.setAttribute('aria-label', '保存')
        this.mindMapAPP.$bus.$emit('showOutlineEdit')
        this.isOutlineEditMode = true
      }
    )

    // 切换为思维导图模式
    this.changeToMindmapButton = this._createActionBtn(
      this.plugin._t('action.changeToMindMap'),
      MINDMAP_ICON,
      viewActions,
      async () => {
        await this.save()
        this.mindMapAPP.$bus.$emit('hideOutlineEdit')
        this._resetOnOutlineEditMode()
      }
    )
    this._hideButtons([this.changeToMindmapButton])

    // 打印大纲
    this.printOutlineButton = this._createActionBtn(
      this.plugin._t('action.printOutline'),
      PRINT_ICON,
      viewActions,
      async () => {
        this.mindMapAPP.$bus.$emit('printOutline')
      }
    )
    this._hideButtons([this.printOutlineButton])

    // 导入
    this.importButton = this._createActionBtn(
      this.plugin._t('action.import'),
      IMPORT_ICON,
      viewActions,
      () => {
        this.mindMapAPP.$bus.$emit('showImport')
      }
    )

    // 导出
    if (!Platform.isMobile) {
      this.exportButton = this._createActionBtn(
        this.plugin._t('action.export'),
        EXPORT_ICON,
        viewActions,
        () => {
          this.mindMapAPP.$bus.$emit('showExport')
        }
      )
    }

    // 保存并更新图像数据
    this.saveButton = this._createActionBtn(
      this.plugin._t('action.saveAndUpdateImage'),
      SAVE_ICON,
      viewActions,
      () => {
        this.forceSaveAndUpdateImage()
      }
    )

    // 保存中的提示
    this.savingTipEl = this.headerEl.createEl('div', {
      cls: 'smm-save-tip'
    })
    viewActions.insertBefore(this.savingTipEl, viewActions.firstChild)
  }

  _showSavingTip() {
    if (!this.savingTipEl) return
    // 保存中...
    this.savingTipEl.innerText = this.plugin._t('tip.saving')
  }

  _hideSavingTip() {
    if (!this.savingTipEl) return
    this.savingTipEl.innerText = ''
  }

  // 创建工具按钮
  _createActionBtn(label, icon, parentEl, onClick, isObIcon = false) {
    const el = this.headerEl.createEl('button', {
      cls: 'clickable-icon'
    })
    el.setAttribute('aria-label', label)
    if (isObIcon) {
      setIcon(el, icon, 24)
    } else {
      el.innerHTML = icon
    }
    parentEl.insertBefore(el, parentEl.firstChild)
    el.addEventListener('click', onClick)
    return el
  }

  // 重置大纲编辑模式
  _resetOnOutlineEditMode() {
    if (this.isOutlineEditMode) {
      this.saveButton.setAttribute(
        'aria-label',
        this.plugin._t('action.saveAndUpdateImage')
      )
      this._showButtons([this.exportButton, this.changeToOutlineButton])
      this._hideButtons([this.changeToMindmapButton, this.printOutlineButton])
      this.isOutlineEditMode = false
    }
  }

  _showButtons(list) {
    list.forEach(el => {
      if (!el) return
      el.style.display = 'flex'
    })
  }

  _hideButtons(list) {
    list.forEach(el => {
      if (!el) return
      el.style.display = 'none'
    })
  }

  // 设置是否存在未保存的内容
  _setIsUnSave(isUnSave) {
    if (!this.saveButton) return
    this.isUnSave = isUnSave
    this.saveButton.style.color = isUnSave ? '#ff6600' : 'var(--icon-color)'
  }

  // 检测主题模式
  _initThemeMode() {
    // 初始检查
    this._updateThemeMode()

    // 监听主题变化事件
    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        this._updateThemeMode()
      })
    )
  }

  // 更新主题模式
  _updateThemeMode() {
    if (this.plugin.settings.themeMode === 'follow') {
      const isDarkMode = this.plugin._getObIsDark()
      if (this.mindMapAPP) {
        this.mindMapAPP.$bus.$emit('setIsDark', isDarkMode)
      }
    }
  }

  // 获取图片、文件存储路径
  _getFileSavePath(typeKey, pathKey, subPathKey) {
    const type = this.plugin.settings[typeKey]
    const folder = this.plugin.settings[pathKey] || ''
    const subFolder = this.plugin.settings[subPathKey] || ''
    switch (type) {
      case 'root':
        return ''
      case 'custom':
        return folder
      case 'currentFileFolder':
        return this.plugin._getActiveFileDirectory()
      case 'currentFileFolderSubFolder':
        const activeFileDirectory = this.plugin._getActiveFileDirectory()
        return [activeFileDirectory, subFolder].filter(Boolean).join('/')
      default:
        return ''
    }
  }
}

export default SmmEditView
