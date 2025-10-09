import { PluginSettingTab, Setting, Notice } from 'obsidian'
import themeList from 'simple-mind-map-plugin-themes/themeList'
import { layoutGroupList } from '../src/config'
import { GITHUB_ICON, DEFAULT_SETTINGS, COMMUNITY_ICON } from './constant'
import { SuggestionModal } from './SuggestionModal'
import { checkVersion } from './utils'

const validateInteger = (value, defaultValue = 0, errorTip) => {
  value = Number(value)
  if (!Number.isNaN(value) && value > 0) {
    return value
  } else {
    // 请输入大于0的数字
    new Notice(errorTip)
    return defaultValue
  }
}

export default class SmmSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin)
    this.plugin = plugin
    this.filePathSettings = null
    this.imagePathSettings = null
    this.imageSubPathSettings = null
    this.attachmentPathSettings = null
    this.attachmentSubPathSettings = null
    this.compressImageOptionsMaxWidthSettings = null
    this.compressImageOptionsMaxHeightSettings = null
    this.compressImageOptionsQualitySettings = null
  }

  display() {
    const { containerEl } = this
    containerEl.empty()

    this._addBaseSetting()

    this._addFileSaveSetting()

    this._addCompressSetting()

    this._addEmbedSetting()

    this._addOtherSetting()

    this._addHelpInfo()
  }

  // 基本设置
  _addBaseSetting() {
    const { containerEl } = this

    containerEl.createEl('h2', { text: this.plugin._t('setting.title.title1') })

    // 自动保存时间设置
    new Setting(containerEl)
      .setName(this.plugin._t('setting.autoSave.title')) // 自动保存时间
      .setDesc(this.plugin._t('setting.autoSave.desc')) // 无操作自动保存时间，单位：秒
      .addText(text => {
        text
          .setValue(String(this.plugin.settings.autoSaveTime))
          .onChange(async value => {
            value = validateInteger(
              value,
              DEFAULT_SETTINGS.autoSaveTime,
              this.plugin._t('tip.integerInputError')
            )
            this.plugin.settings.autoSaveTime = value
            await this.plugin._saveSettings()
          })
      })

    // 主题模式设置
    new Setting(containerEl)
      .setName(this.plugin._t('setting.themeMode.title')) // 主题模式
      .setDesc(this.plugin._t('setting.themeMode.desc')) // '设置深色、浅色模式'
      .addDropdown(dropdown => {
        ;[
          {
            name: this.plugin._t('setting.themeMode.option1'), // 跟随obsidian
            value: 'follow'
          },
          {
            name: this.plugin._t('setting.themeMode.option2'), // 浅色模式
            value: 'light'
          },
          {
            name: this.plugin._t('setting.themeMode.option3'), // 深色模式
            value: 'dark'
          }
        ].forEach(item => {
          dropdown.addOption(item.value, item.name)
        })
        dropdown
          .setValue(this.plugin.settings.themeMode)
          .onChange(async value => {
            this.plugin.settings.themeMode = value
            await this.plugin._saveSettings()
          })
      })

    // 默认主题设置
    const allThemeList = [
      {
        name: this.plugin._t('setting.theme.title'), // 默认主题
        value: 'default',
        dark: false
      },
      ...themeList
    ].reverse()
    // 浅色模式的默认主题
    new Setting(containerEl)
      .setName(this.plugin._t('setting.theme.title'))
      .setDesc(this.plugin._t('setting.theme.desc')) // '设置默认主题'
      .addDropdown(dropdown => {
        allThemeList.forEach(item => {
          dropdown.addOption(item.value, item.name)
        })
        dropdown
          .setValue(this.plugin.settings.defaultTheme)
          .onChange(async value => {
            this.plugin.settings.defaultTheme = value
            await this.plugin._saveSettings()
          })
      })
    // 深色模式的默认主题
    new Setting(containerEl)
      .setName(this.plugin._t('setting.theme.title2'))
      .setDesc(this.plugin._t('setting.theme.desc2')) // '设置默认主题'
      .addDropdown(dropdown => {
        allThemeList.forEach(item => {
          dropdown.addOption(item.value, item.name)
        })
        dropdown
          .setValue(this.plugin.settings.defaultThemeDark)
          .onChange(async value => {
            this.plugin.settings.defaultThemeDark = value
            await this.plugin._saveSettings()
          })
      })

    // 默认结构设置
    const allLayoutList = []
    ;(layoutGroupList[this.plugin.settings.lang] || layoutGroupList.en).forEach(
      item => {
        allLayoutList.push(
          ...item.list.map((item2, index) => {
            return {
              name: item.name + (item.list.length > 1 ? index + 1 : ''),
              value: item2
            }
          })
        )
      }
    )
    // 默认结构
    new Setting(containerEl)
      .setName(this.plugin._t('setting.layout.title'))
      .setDesc(this.plugin._t('setting.layout.desc')) // '设置默认结构'
      .addDropdown(dropdown => {
        allLayoutList.forEach(item => {
          dropdown.addOption(item.value, item.name)
        })
        dropdown
          .setValue(this.plugin.settings.defaultLayout)
          .onChange(async value => {
            this.plugin.settings.defaultLayout = value
            await this.plugin._saveSettings()
          })
      })
  }

  // 文件创建、保存相关设置
  _addFileSaveSetting() {
    const { containerEl } = this

    containerEl.createEl('h2', { text: this.plugin._t('setting.title.title2') })

    // 新建文件名的前缀
    new Setting(containerEl)
      .setName(this.plugin._t('setting.file.title1')) // 新建思维导图的文件名前缀
      .setDesc(this.plugin._t('setting.file.desc1')) // 新建思维导图文件名默认的命名格式为：前缀 + 空格 + 日期时间戳
      .addText(text => {
        text
          .setValue(this.plugin.settings.fileNamePrefix)
          .onChange(async value => {
            this.plugin.settings.fileNamePrefix = value
            await this.plugin._saveSettings()
          })
      })

    // 新建文件名的日期时间戳格式
    const fileNameDateFormatSetting = new Setting(containerEl)
      .setName(this.plugin._t('setting.file.title2')) // 新建思维导图的文件名日期时间戳格式
      .setDesc(this.plugin._t('setting.file.desc2')) // 默认为：YYYY-MM-DD HH.mm.ss，实际示例：2025-01-01 23.59.59，如你不清楚该格式的具体含义及如何修改，请参考：https://day.js.org/docs/en/parse/string-format
      .addText(text => {
        text
          .setValue(this.plugin.settings.fileNameDateFormat)
          .onChange(async value => {
            this.plugin.settings.fileNameDateFormat = value
            await this.plugin._saveSettings()
          })
      })
    fileNameDateFormatSetting.settingEl.className +=
      ' smm-setting-item-enable-select'

    // 文件存储位置
    new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title4')) // 文件存储位置
      .setDesc(this.plugin._t('setting.folder.desc4')) // 设置SimpleMindMap文件存储位置，默认为仓库根路径
      .addDropdown(dropdown => {
        this._getFilePathOptions().forEach(item => {
          dropdown.addOption(item.value, item.name)
        })
        dropdown
          .setValue(this.plugin.settings.filePathType)
          .onChange(async value => {
            this.plugin.settings.filePathType = value
            await this.plugin._saveSettings()
            this._updateFilePathSettingsVisibility()
          })
      })
    // 文件存储路径设置
    this.filePathSettings = new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title1')) // 文件存储路径
      .setDesc(this.plugin._t('setting.folder.desc1')) // 设置SimpleMindMap文件存储路径，默认为仓库根路径
      .addText(text => {
        text.setValue(this.plugin.settings.filePath).onChange(async value => {
          this.plugin.settings.filePath = value
          await this.plugin._saveSettings()
        })
        this._addFolderSelectBtn(text, selected => {
          this.plugin.settings.filePath = selected
          this.plugin._saveSettings()
        })
      })
    this.filePathSettings.settingEl.className += ' smm-setting-sub-item'
    this._updateFilePathSettingsVisibility()

    // 图片存储位置
    new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title5')) // 图片存储位置
      .setDesc(this.plugin._t('setting.folder.desc5')) // 图片存储位置
      .addDropdown(dropdown => {
        this._getFilePathOptions(true).forEach(item => {
          dropdown.addOption(item.value, item.name)
        })
        dropdown
          .setValue(this.plugin.settings.imagePathType)
          .onChange(async value => {
            this.plugin.settings.imagePathType = value
            await this.plugin._saveSettings()
            this._updateImagePathSettingsVisibility()
          })
      })
    // 自定义图片存储目录
    this.imagePathSettings = new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title2')) // 图片存储路径
      .setDesc(this.plugin._t('setting.folder.desc2')) // 设置上传的图片文件（节点图片、背景图片）存储路径
      .addText(text => {
        text.setValue(this.plugin.settings.imagePath).onChange(async value => {
          this.plugin.settings.imagePath = value
          await this.plugin._saveSettings()
        })
        this._addFolderSelectBtn(text, selected => {
          this.plugin.settings.imagePath = selected
          this.plugin._saveSettings()
        })
      })
    this.imagePathSettings.settingEl.className += ' smm-setting-sub-item'
    // 自定义子文件夹
    this.imageSubPathSettings = new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title6')) // 图片存储路径
      .setDesc(this.plugin._t('setting.folder.desc6')) // 设置上传的图片文件（节点图片、背景图片）存储路径
      .addText(text => {
        text
          .setValue(this.plugin.settings.imageSubPath)
          .onChange(async value => {
            this.plugin.settings.imageSubPath = value
            await this.plugin._saveSettings()
          })
        this._addFolderSelectBtn(text, selected => {
          this.plugin.settings.imageSubPath = selected
          this.plugin._saveSettings()
        })
      })
    this.imageSubPathSettings.settingEl.className += ' smm-setting-sub-item'
    this._updateImagePathSettingsVisibility()

    // 附件存储位置
    new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title7'))
      .setDesc(this.plugin._t('setting.folder.desc7'))
      .addDropdown(dropdown => {
        this._getFilePathOptions(true).forEach(item => {
          dropdown.addOption(item.value, item.name)
        })
        dropdown
          .setValue(this.plugin.settings.attachmentPathType)
          .onChange(async value => {
            this.plugin.settings.attachmentPathType = value
            await this.plugin._saveSettings()
            this._updateAttachmentPathSettingsVisibility()
          })
      })
    // 附件存储路径设置
    this.attachmentPathSettings = new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title3'))
      .setDesc(this.plugin._t('setting.folder.desc3'))
      .addText(text => {
        text
          .setValue(this.plugin.settings.attachmentPath)
          .onChange(async value => {
            this.plugin.settings.attachmentPath = value
            await this.plugin._saveSettings()
          })
        this._addFolderSelectBtn(text, selected => {
          this.plugin.settings.attachmentPath = selected
          this.plugin._saveSettings()
        })
      })
    this.attachmentPathSettings.settingEl.className += ' smm-setting-sub-item'
    // 自定义子文件夹
    this.attachmentSubPathSettings = new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title6'))
      .setDesc(this.plugin._t('setting.folder.desc6'))
      .addText(text => {
        text
          .setValue(this.plugin.settings.attachmentSubPath)
          .onChange(async value => {
            this.plugin.settings.attachmentSubPath = value
            await this.plugin._saveSettings()
          })
        this._addFolderSelectBtn(text, selected => {
          this.plugin.settings.attachmentSubPath = selected
          this.plugin._saveSettings()
        })
      })
    this.attachmentSubPathSettings.settingEl.className +=
      ' smm-setting-sub-item'
    this._updateAttachmentPathSettingsVisibility()

    // 是否支持ob搜索
    new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title8'))
      .setDesc(this.plugin._t('setting.folder.desc8'))
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.supportObSearch)
          .onChange(async value => {
            this.plugin.settings.supportObSearch = value
            await this.plugin._saveSettings()
          })
      })

    // 是否存储画布位置和缩放数据
    new Setting(containerEl)
      .setName(this.plugin._t('setting.folder.title9'))
      .setDesc(this.plugin._t('setting.folder.desc9'))
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.saveCanvasViewData)
          .onChange(async value => {
            this.plugin.settings.saveCanvasViewData = value
            await this.plugin._saveSettings()
          })
      })
  }

  // 图片压缩设置
  _addCompressSetting() {
    const { containerEl } = this

    containerEl.createEl('h2', { text: this.plugin._t('setting.title.title3') })

    // 是否压缩图片设置
    new Setting(containerEl)
      .setName(this.plugin._t('setting.compress.title1')) // 是否压缩图片
      .setDesc(this.plugin._t('setting.compress.desc1')) // 设置上传的图片文件（节点图片、背景图片）存储路径
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.compressImage)
          .onChange(async value => {
            this.plugin.settings.compressImage = value
            await this.plugin._saveSettings()
            this._updateCompressImageSettingsVisibility()
          })
      })

    // 压缩参数设置
    this.compressImageOptionsMaxWidthSettings = new Setting(containerEl)
      .setName(this.plugin._t('setting.compress.title2')) // 最大压缩宽度
      .setDesc(this.plugin._t('setting.compress.desc2')) // 设置图片压缩后的最大宽度
      .addText(text => {
        text
          .setValue(String(this.plugin.settings.compressImageOptionsMaxWidth))
          .onChange(async value => {
            value = validateInteger(
              value,
              DEFAULT_SETTINGS.compressImageOptionsMaxWidth,
              this.plugin._t('tip.integerInputError')
            )
            this.plugin.settings.compressImageOptionsMaxWidth = value
            await this.plugin._saveSettings()
          })
      })
    this.compressImageOptionsMaxWidthSettings.settingEl.className +=
      ' smm-setting-sub-item'
    this.compressImageOptionsMaxHeightSettings = new Setting(containerEl)
      .setName(this.plugin._t('setting.compress.title3')) // 最大压缩高度
      .setDesc(this.plugin._t('setting.compress.desc3')) // 设置图片压缩后的最大高度
      .addText(text => {
        text
          .setValue(String(this.plugin.settings.compressImageOptionsMaxHeight))
          .onChange(async value => {
            value = validateInteger(
              value,
              DEFAULT_SETTINGS.compressImageOptionsMaxHeight,
              this.plugin._t('tip.integerInputError')
            )
            this.plugin.settings.compressImageOptionsMaxHeight = value
            await this.plugin._saveSettings()
          })
      })
    this.compressImageOptionsMaxHeightSettings.settingEl.className +=
      ' smm-setting-sub-item'
    this.compressImageOptionsQualitySettings = new Setting(containerEl)
      .setName(this.plugin._t('setting.compress.title4')) // 图片质量
      .setDesc(
        `${this.plugin._t('setting.compress.desc4')}，${this.plugin._t(
          'setting.compress.curValue'
        )}: ${this.plugin.settings.compressImageOptionsQuality}`
      ) // 显示当前值
      .addSlider(slider =>
        slider
          .setLimits(0, 1, 0.1) // 最小值0，最大值1，步长0.1
          .setValue(this.plugin.settings.compressImageOptionsQuality)
          .onChange(async value => {
            this.plugin.settings.compressImageOptionsQuality = value
            this.compressImageOptionsQualitySettings?.setDesc(
              `${this.plugin._t('setting.compress.desc4')}，${this.plugin._t(
                'setting.compress.curValue'
              )}: ${value}`
            )
            await this.plugin._saveSettings()
          })
      )
      .addExtraButton(button =>
        button
          .setIcon('reset')
          .setTooltip(this.plugin._t('setting.compress.reset'))
          .onClick(async () => {
            const defaultValue = DEFAULT_SETTINGS.compressImageOptionsQuality
            this.plugin.settings.compressImageOptionsQuality = defaultValue
            const sliderEl = this.compressImageOptionsQualitySettings
              ?.components[0]
            if (sliderEl) {
              sliderEl.setValue(defaultValue)
              this.plugin.settings.compressImageOptionsQuality = defaultValue
              this.compressImageOptionsQualitySettings?.setDesc(
                `${this.plugin._t(
                  'setting.compress.curValue'
                )}: ${defaultValue}`
              )
            }
            await this.plugin._saveSettings()
          })
      )
    this.compressImageOptionsQualitySettings.settingEl.className +=
      ' smm-setting-sub-item'
    this._updateCompressImageSettingsVisibility()
  }

  // 嵌入设置
  _addEmbedSetting() {
    const { containerEl } = this

    containerEl.createEl('h2', { text: this.plugin._t('setting.title.title4') })

    // 嵌入预览的图像背景是否透明
    new Setting(containerEl)
      .setName(this.plugin._t('setting.embed.title2')) // 嵌入预览的图像背景是否透明
      .setDesc(this.plugin._t('setting.embed.desc2')) // 嵌入预览的图像背景是否透明
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.compressImageIsTransparent)
          .onChange(async value => {
            this.plugin.settings.compressImageIsTransparent = value
            await this.plugin._saveSettings()
          })
      })

    // 嵌入预览双击是否新窗口打开
    new Setting(containerEl)
      .setName(this.plugin._t('setting.embed.title1')) // 嵌入预览双击是否新窗口打开
      .setDesc(this.plugin._t('setting.embed.desc1')) // ![[]]格式嵌入md文档时双击预览图像是否新窗口打开文件
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.embedDblClickNewWindow)
          .onChange(async value => {
            this.plugin.settings.embedDblClickNewWindow = value
            await this.plugin._saveSettings()
          })
      })
  }

  // 给目录输入框控件添加选择按钮
  _addFolderSelectBtn(text, callback = () => {}) {
    const inputEl = text.inputEl
    const suggestionButton = inputEl.parentElement?.createEl('button', {
      text: this.plugin._t('setting.button.select'),
      cls: 'suggestion-button'
    })
    suggestionButton?.addEventListener('click', () => {
      new SuggestionModal({
        plugin: this.plugin,
        type: 'folder',
        app: this.app,
        onSelect: selected => {
          text.setValue(selected)
          inputEl.focus()
          callback(selected)
        }
      }).open()
    })
  }

  // 获取文件路径选项
  _getFilePathOptions(full = false) {
    const res = [
      {
        name: this.plugin._t('setting.folder.option1'), // 仓库的根目录
        value: 'root'
      },
      {
        name: this.plugin._t('setting.folder.option2'), // 指定文件夹
        value: 'custom'
      },
      {
        name: this.plugin._t('setting.folder.option3'), // 当前文件所在的文件夹
        value: 'currentFileFolder'
      }
    ]
    if (full) {
      res.push({
        name: this.plugin._t('setting.folder.option4'), // 当前文件所在的文件夹的子文件夹
        value: 'currentFileFolderSubFolder'
      })
    }
    return res
  }

  // 切换文件路径设置的显示状态
  _updateFilePathSettingsVisibility() {
    const isVisible = this.plugin.settings.filePathType === 'custom'
    if (this.filePathSettings) {
      this.filePathSettings.settingEl.style.display = isVisible ? '' : 'none'
    }
  }

  // 切换图片路径设置的显示状态
  _updateImagePathSettingsVisibility() {
    const isVisible = this.plugin.settings.imagePathType === 'custom'
    if (this.imagePathSettings) {
      this.imagePathSettings.settingEl.style.display = isVisible ? '' : 'none'
    }
    const isVisibleSub =
      this.plugin.settings.imagePathType === 'currentFileFolderSubFolder'
    if (this.imageSubPathSettings) {
      this.imageSubPathSettings.settingEl.style.display = isVisibleSub
        ? ''
        : 'none'
    }
  }

  // 切换附件路径设置的显示状态
  _updateAttachmentPathSettingsVisibility() {
    const isVisible = this.plugin.settings.attachmentPathType === 'custom'
    if (this.attachmentPathSettings) {
      this.attachmentPathSettings.settingEl.style.display = isVisible
        ? ''
        : 'none'
    }
    const isVisibleSub =
      this.plugin.settings.attachmentPathType === 'currentFileFolderSubFolder'
    if (this.attachmentSubPathSettings) {
      this.attachmentSubPathSettings.settingEl.style.display = isVisibleSub
        ? ''
        : 'none'
    }
  }

  // 切换压缩图片设置的显示状态
  _updateCompressImageSettingsVisibility() {
    const isVisible = this.plugin.settings.compressImage
    if (this.compressImageOptionsMaxWidthSettings) {
      this.compressImageOptionsMaxWidthSettings.settingEl.style.display = isVisible
        ? ''
        : 'none'
    }
    if (this.compressImageOptionsMaxHeightSettings) {
      this.compressImageOptionsMaxHeightSettings.settingEl.style.display = isVisible
        ? ''
        : 'none'
    }
    if (this.compressImageOptionsQualitySettings) {
      this.compressImageOptionsQualitySettings.settingEl.style.display = isVisible
        ? ''
        : 'none'
    }
  }

  _addOtherSetting() {
    const { containerEl } = this

    containerEl.createEl('h2', { text: this.plugin._t('setting.title.title5') })

    // 是否开启版本检查
    new Setting(containerEl)
      .setName(this.plugin._t('setting.other.title1')) // 是否开启版本检查
      .setDesc(this.plugin._t('setting.other.desc1')) // 是否开启版本检查
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.openVersionCheck)
          .onChange(async value => {
            this.plugin.settings.openVersionCheck = value
            await this.plugin._saveSettings()
          })
      })
      .addExtraButton(button => {
        button.setIcon('refresh-cw').onClick(async () => {
          checkVersion(
            version => {
              if (version) {
                new Notice(this.plugin._t('tip.pluginNewVersion') + version)
              } else {
                new Notice(this.plugin._t('tip.pluginNoNewVersion'))
              }
            },
            true,
            () => {
              new Notice(this.plugin._t('tip.pluginVersionCheckError'))
            }
          )
        })
      })
  }

  // 添加辅助信息
  _addHelpInfo() {
    const { containerEl } = this
    const linkEl = containerEl.createDiv('setting-item smm-setting-link-list')
    linkEl.innerHTML = `
      <div class="smm-setting-link-item">
        <a href="https://github.com/wanglin2/obsidian-simplemindmap/issues" target="_blank">
          ${GITHUB_ICON}
          <span>${this.plugin._t('setting.linkInfo.issues')}</span>
        </a>
      </div>
      <div class="smm-setting-link-item">
        <a href="https://forum.pkmer.net/" target="_blank">
          ${COMMUNITY_ICON}
          <span>${this.plugin._t('setting.linkInfo.community')}</span>
        </a>
      </div>
    `
  }
}
