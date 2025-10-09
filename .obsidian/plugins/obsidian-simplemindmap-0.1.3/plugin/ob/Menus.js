import { TFile, TFolder, Notice, MarkdownView } from 'obsidian'
import {
  parseMarkdownText,
  assembleMarkdownText
} from './metadataAndMarkdown.js'
import { hideTargetMenu } from './utils.js'
import { PreviewMindMap } from './PreviewMindMap.js'
import LZString from 'lz-string'
import { SMM_VIEW_TYPE, SMM_TAG } from './constant.js'
import { around } from 'monkey-around'
import markdown from 'simple-mind-map/src/parse/markdown.js'

export default class Menus {
  constructor(plugin) {
    this.plugin = plugin
    this.app = plugin.app

    this._addFileMenus()
  }

  _t(key) {
    return this.plugin._t(key)
  }

  // 添加右键菜单
  _addFileMenus() {
    this.plugin.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFolder) {
          // 新建思维导图
          menu.addItem(item => {
            item
              .setTitle(this._t('action.createMindMap'))
              .setIcon('smm-icon')
              .onClick(() => {
                this.plugin._createSmmFile(file.path)
              })
          })
        } else if (file instanceof TFile) {
          if (this.plugin._isSmmFile(file)) {
            hideTargetMenu(menu, '在新窗口中打开')
            hideTargetMenu(menu, '移动至新窗口')
            // 打开为Markdown文档
            menu.addItem(item =>
              item
                .setTitle(this._t('action.openAsMd'))
                .setIcon('document')
                .setSection('open')
                .onClick(async () => {
                  await this.app.workspace.openLinkText(file.path, '')
                  const leaf = this.app.workspace.getLeaf(false)
                  const mdViewType = this.app.viewRegistry.getTypeByExtension(
                    'md'
                  )
                  await leaf.setViewState({
                    type: mdViewType,
                    state: {
                      ...leaf.getViewState().state,
                      isSwitchToMarkdownViewFromSmmView: true
                    },
                    active: true
                  })
                  this.app.workspace.revealLeaf(leaf)
                })
            )
            // 转换为md文档
            menu.addItem(item =>
              item
                .setTitle(this._t('action.changeToMdFile'))
                .setIcon('refresh-cw')
                .setSection('open')
                .onClick(async () => {
                  const content = await this.app.vault.read(file)
                  const result = parseMarkdownText(content)
                  const mindMapData = LZString.decompressFromBase64(
                    result.metadata.content
                  )
                  let mdStr = ''
                  const tags = result.metadata.tags.filter(tag => {
                    return tag !== SMM_TAG
                  })
                  if (tags.length) {
                    mdStr += 'tags:\n'
                    for (const tag of tags) {
                      mdStr += `  - ${tag}\n`
                    }
                  }
                  if (result.metadata.yaml) {
                    mdStr += result.metadata.yaml
                  }
                  if (mdStr) {
                    mdStr = '---\n' + mdStr + '---\n'
                  }
                  const mdMindMap = markdown.transformToMarkdown(
                    JSON.parse(mindMapData).root
                  )
                  mdStr += mdMindMap
                  let newPath = file.path.replace('.smm.md', '.md')
                  newPath = await this.plugin._getAvailableFilaName(newPath)
                  await this.app.vault.rename(file, newPath)
                  const renamedFile = this.app.vault.getAbstractFileByPath(
                    newPath
                  )
                  if (renamedFile) {
                    // 关闭当前标签页
                    const markdownLeafs = this.app.workspace.getLeavesOfType(
                      SMM_VIEW_TYPE
                    )
                    for (const leaf of markdownLeafs) {
                      if (leaf.view.file.path === renamedFile.path) {
                        leaf.view.isActive = false
                        leaf.detach()
                        break
                      }
                    }
                    // 修改文件内容
                    await this.app.vault.modify(renamedFile, mdStr)
                    // 重新打开
                    const ref = this.app.metadataCache.on('changed', () => {
                      this.app.metadataCache.offref(ref)
                      this.app.workspace.openLinkText(
                        renamedFile.path,
                        '',
                        true
                      )
                      new Notice(this._t('tip.changeSuccess'))
                    })
                  }
                })
            )
          }
        }
      })
    )
  }

  addMarkdownFileMenus() {
    const self = this
    // 在md视图下的smm文件右上角菜单增加切换为思维导图菜单
    this.plugin.register(
      around(MarkdownView.prototype, {
        onPaneMenu(next) {
          return function(menu, source) {
            const res = next.apply(this, [menu, source])
            if (self.plugin._isSmmFile(this.file)) {
              if (source === 'more-options') {
                // 打开为思维导图文档
                menu.addItem(item =>
                  item
                    .setTitle(self._t('action.openAsMindMap'))
                    .setIcon('document')
                    .setSection('pane')
                    .onClick(() => {
                      self.plugin._setSmmView(this.leaf)
                    })
                )
              }
            } else {
              if (source === 'more-options') {
                // 预览为思维导图
                menu.addItem(item =>
                  item
                    .setTitle(self._t('action.previewAsMindMap'))
                    .setIcon('smm-icon')
                    .setSection('pane')
                    .onClick(() => {
                      let previewMindMap = new PreviewMindMap({
                        plugin: self.plugin,
                        file: this.file,
                        onClose: () => {
                          previewMindMap = null
                        }
                      })
                    })
                )
                // 转换为思维导图文档
                menu.addItem(item =>
                  item
                    .setTitle(self._t('action.changeToMindMapFile'))
                    .setIcon('refresh-cw')
                    .setSection('pane')
                    .onClick(async () => {
                      let yaml = ''
                      const tagList = []
                      await this.app.fileManager.processFrontMatter(
                        this.file,
                        frontmatter => {
                          if (frontmatter.tags) {
                            tagList.push(...frontmatter.tags)
                            delete frontmatter.tags
                          }
                        }
                      )
                      if (!tagList.includes(SMM_TAG)) {
                        tagList.push(SMM_TAG)
                      }
                      const content = await this.app.vault.read(this.file)
                      if (content.startsWith('---\n')) {
                        yaml = content.split('---\n')[1]
                      }
                      const mindMapData = await self.plugin._mdToMindmapData(
                        content
                      )
                      if (!mindMapData) {
                        new Notice(self._t('tip.mdToMindMapFail'))
                        return
                      }
                      let newPath = this.file.path.replace('.md', '.smm.md')
                      newPath = await self.plugin._getAvailableFilaName(
                        newPath,
                        2
                      )
                      await this.app.vault.rename(this.file, newPath)
                      const renamedFile = this.app.vault.getAbstractFileByPath(
                        newPath
                      )
                      const str = assembleMarkdownText({
                        metadata: {
                          path: `${newPath || ''}`,
                          tags: tagList,
                          yaml: yaml,
                          content: LZString.compressToBase64(
                            JSON.stringify(mindMapData)
                          )
                        },
                        svgdata: '',
                        linkdata: []
                      })
                      if (renamedFile) {
                        // 关闭当前标签页
                        const markdownLeafs = this.app.workspace.getLeavesOfType(
                          'markdown'
                        )
                        for (const leaf of markdownLeafs) {
                          if (leaf.view.file.path === renamedFile.path) {
                            leaf.detach()
                            break
                          }
                        }
                        // 修改文件内容
                        await this.app.vault.modify(renamedFile, str)
                        // 重新打开
                        const ref = this.app.metadataCache.on('changed', () => {
                          this.app.metadataCache.offref(ref)
                          this.app.workspace.openLinkText(
                            renamedFile.path,
                            '',
                            true
                          )
                          new Notice(self._t('tip.changeSuccess'))
                        })
                      }
                    })
                )
              }
            }
            return res
          }
        }
      })
    )
  }
}
