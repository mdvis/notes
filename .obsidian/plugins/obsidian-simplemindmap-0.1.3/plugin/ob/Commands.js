import { Notice } from 'obsidian'
import { IGNORE_CHECK_SMM } from './constant.js'
import SmmEditView from '../SmmEditView.js'

export default class Commands {
  constructor(plugin) {
    this.plugin = plugin
    this.app = plugin.app
    this.popScope = null

    this._initHotkeyOverrides()
    this._addCreatesCommand()
    this._addActionsCommand()
  }

  clear() {
    if (this.popScope) this.popScope()
  }

  _initHotkeyOverrides() {
    this._registerHotkeyOverrides()

    // 监听视图切换事件
    this.plugin.registerEvent(
      this.app.workspace.on('active-leaf-change', leaf => {
        this._registerHotkeyOverrides()
      })
    )
  }

  _registerHotkeyOverrides() {
    // 清理之前的覆盖
    if (this.popScope) {
      this.popScope()
      this.popScope = null
    }
    const activeView = this.app.workspace.activeLeaf?.view
    if (!(activeView instanceof SmmEditView)) {
      return
    }

    const scope = this.app.keymap.getRootScope()

    // 1. 覆盖 Ctrl+F
    const ctrlFHandler = scope.register(['Mod'], 'f', evt => {
      evt.preventDefault() // 阻止浏览器默认查找
      return true // 表示已处理
    })

    // 2. 覆盖 Ctrl+S
    const ctrlSHandler = scope.register(['Mod'], 's', evt => {
      evt.preventDefault() // 阻止浏览器保存对话框
      const view = this._getActiveSmmView()
      if (view) {
        view.forceSave()
      }
      return true
    })

    // 提升处理器优先级
    scope.keys.unshift(scope.keys.pop()) // 移动 Ctrl+S
    scope.keys.unshift(scope.keys.pop()) // 移动 Ctrl+F

    // 设置清理函数
    this.popScope = () => {
      scope.unregister(ctrlFHandler)
      scope.unregister(ctrlSHandler)
    }
  }

  addCommand(command) {
    this.plugin.addCommand(command)
  }

  _t(key) {
    return this.plugin._t(key)
  }

  _addCreatesCommand() {
    // 新建思维导图
    this.addCommand({
      id: 'create-smm-mindmap',
      name: this._t('action.createMindMap'),
      callback: async () => {
        this.plugin._createSmmFile()
      }
    })
    // 新建思维导图并插入当前文档
    this.addCommand({
      id: 'create-smm-mindmap-insert-markdown',
      name: this._t('action.createMindMapInsertToMd'),
      editorCallback: editor => {
        this.plugin._createSmmFile('', fileName => {
          try {
            const file = this.app.vault.getAbstractFileByPath(fileName)
            const currentFile = this.app.workspace.getActiveFile()
            if (currentFile?.extension !== 'md') {
              // 当前文件不是markdown文件
              new Notice(this._t('tip.fileIsNotMd'))
              return
            }
            const linkText = this.app.fileManager.generateMarkdownLink(
              file,
              currentFile?.path || ''
            )
            editor.replaceSelection('!' + linkText)
          } catch (error) {
            console.error(error)
            // 新建思维导图失败
            new Notice(this._t('tip.createMindMapFail'))
          }
        })
      }
    })
  }

  _addActionsCommand() {
    // 演示模式
    this.addCommand({
      id: 'enter-smm-mindmap-demonstrate',
      name: this._t('action.enterDemonstrate'),
      checkCallback: checking => {
        const view = this._getActiveSmmView()
        if (view) {
          if (!checking) {
            view.mindMapAPP.$bus.$emit('enter_demonstrate')
          }
          return true
        }
        return false
      }
    })
    // 保存并更新图像
    this.addCommand({
      id: 'save-smm-mindmap-and-update-image',
      name: this._t('action.saveAndUpdateImage'),
      hotkeys: [
        {
          modifiers: ['Mod', 'Shift'],
          key: 's'
        }
      ],
      checkCallback: checking => {
        const view = this._getActiveSmmView()
        if (view) {
          if (!checking) {
            view.forceSaveAndUpdateImage()
          }
          return true
        }
        return false
      }
    })
  }

  _getActiveSmmView() {
    return this.app.workspace.getActiveViewOfType(SmmEditView, IGNORE_CHECK_SMM)
  }
}
