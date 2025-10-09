<template>
  <div ref="editContainer" class="editContainer" v-loading="loading">
    <div
      class="mindMapContainer"
      id="mindMapContainer"
      ref="mindMapContainer"
      @dragover.prevent
      @dragenter="onDragEnter"
      @drop="onDrop"
    ></div>
    <Navigator v-if="mindMap" :mindMap="mindMap"></Navigator>
    <NavigatorToolbar
      :mindMap="mindMap"
      v-if="!isZenMode && isShowBottomToolbar"
    ></NavigatorToolbar>
    <OutlineSidebar v-if="mindMap" :mindMap="mindMap"></OutlineSidebar>
    <Style v-if="mindMap && !isZenMode" :mindMap="mindMap"></Style>
    <BaseStyle
      v-if="mindMap"
      :data="mindMapData"
      :configData="mindMapConfig"
      :mindMap="mindMap"
    ></BaseStyle>
    <AssociativeLineStyle
      v-if="mindMap"
      :mindMap="mindMap"
    ></AssociativeLineStyle>
    <Theme v-if="mindMap" :data="mindMapData" :mindMap="mindMap"></Theme>
    <Structure v-if="mindMap" :mindMap="mindMap"></Structure>
    <ShortcutKey v-if="mindMap"></ShortcutKey>
    <Contextmenu v-if="mindMap" :mindMap="mindMap"></Contextmenu>
    <RichTextToolbar v-if="mindMap" :mindMap="mindMap"></RichTextToolbar>
    <NodeNoteContentShow
      v-if="mindMap"
      :mindMap="mindMap"
    ></NodeNoteContentShow>
    <NodeImgPreview v-if="mindMap" :mindMap="mindMap"></NodeImgPreview>
    <SidebarTrigger
      v-if="!isZenMode && mindMap"
      :mindMap="mindMap"
    ></SidebarTrigger>
    <Search v-if="mindMap" :mindMap="mindMap"></Search>
    <NodeIconSidebar v-if="mindMap" :mindMap="mindMap"></NodeIconSidebar>
    <NodeIconToolbar v-if="mindMap" :mindMap="mindMap"></NodeIconToolbar>
    <Scrollbar v-if="isShowScrollbar && mindMap" :mindMap="mindMap"></Scrollbar>
    <FormulaSidebar v-if="mindMap" :mindMap="mindMap"></FormulaSidebar>
    <NodeOuterFrame v-if="mindMap" :mindMap="mindMap"></NodeOuterFrame>
    <NodeTagStyle v-if="mindMap" :mindMap="mindMap"></NodeTagStyle>
    <Setting
      v-if="mindMap"
      :configData="mindMapConfig"
      :mindMap="mindMap"
    ></Setting>
    <NodeImgPlacementToolbar
      v-if="mindMap"
      :mindMap="mindMap"
    ></NodeImgPlacementToolbar>
    <NodeNoteSidebar v-if="mindMap" :mindMap="mindMap"></NodeNoteSidebar>
    <Demonstrate v-if="mindMap" :mindMap="mindMap"></Demonstrate>
  </div>
</template>

<script>
import MindMap from 'simple-mind-map'
import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import Watermark from 'simple-mind-map/src/plugins/Watermark.js'
import KeyboardNavigation from 'simple-mind-map/src/plugins/KeyboardNavigation.js'
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js'
import ExportXMind from 'simple-mind-map/src/plugins/ExportXMind.js'
import Export from 'simple-mind-map/src/plugins/Export.js'
import Drag from 'simple-mind-map/src/plugins/Drag.js'
import Select from 'simple-mind-map/src/plugins/Select.js'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import TouchEvent from 'simple-mind-map/src/plugins/TouchEvent.js'
import NodeImgAdjust from 'simple-mind-map/src/plugins/NodeImgAdjust.js'
import SearchPlugin from 'simple-mind-map/src/plugins/Search.js'
import Painter from 'simple-mind-map/src/plugins/Painter.js'
import ScrollbarPlugin from 'simple-mind-map/src/plugins/Scrollbar.js'
import Formula from 'simple-mind-map/src/plugins/Formula.js'
import RainbowLines from 'simple-mind-map/src/plugins/RainbowLines.js'
import DemonstratePlugin from 'simple-mind-map/src/plugins/Demonstrate.js'
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame.js'
import MindMapLayoutPro from 'simple-mind-map/src/plugins/MindMapLayoutPro.js'
import NodeBase64ImageStorage from 'simple-mind-map/src/plugins/NodeBase64ImageStorage.js'
import Themes from 'simple-mind-map-plugin-themes'
import {
  isSameObject,
  getImageSize,
  nodeRichTextToTextWithWrap
} from 'simple-mind-map/src/utils/index.js'
import OutlineSidebar from './OutlineSidebar.vue'
import Style from './Style.vue'
import BaseStyle from './BaseStyle.vue'
import Theme from './Theme.vue'
import Structure from './Structure.vue'
import NavigatorToolbar from './NavigatorToolbar.vue'
import ShortcutKey from './ShortcutKey.vue'
import Contextmenu from './Contextmenu.vue'
import RichTextToolbar from './RichTextToolbar.vue'
import NodeNoteContentShow from './NodeNoteContentShow.vue'
import Navigator from './Navigator.vue'
import NodeImgPreview from './NodeImgPreview.vue'
import SidebarTrigger from './SidebarTrigger.vue'
import { mapState } from 'vuex'
import icon from '@/config/icon'
import Search from './Search.vue'
import NodeIconSidebar from './NodeIconSidebar.vue'
import NodeIconToolbar from './NodeIconToolbar.vue'
import handleClipboardText from '@/utils/handleClipboardText'
import Scrollbar from './Scrollbar.vue'
import FormulaSidebar from './FormulaSidebar.vue'
import NodeOuterFrame from './NodeOuterFrame.vue'
import NodeTagStyle from './NodeTagStyle.vue'
import Setting from './Setting.vue'
import AssociativeLineStyle from './AssociativeLineStyle.vue'
import NodeImgPlacementToolbar from './NodeImgPlacementToolbar.vue'
import NodeNoteSidebar from './NodeNoteSidebar.vue'
import {
  isHyperlink,
  isObLinkText,
  dfsTraverse,
  isNormalUrl,
  getFilenameWithExtension,
  checkMindTreeHasImg
} from '@/utils'
import Demonstrate from './Demonstrate.vue'
import { imgFail, obFileHyperlinkIcon, hyperlinkIcon } from '@/config/icons'

// 注册插件
MindMap.usePlugin(MiniMap)
  .usePlugin(Watermark)
  .usePlugin(Drag)
  .usePlugin(KeyboardNavigation)
  .usePlugin(ExportPDF)
  .usePlugin(ExportXMind)
  .usePlugin(Export)
  .usePlugin(Select)
  .usePlugin(AssociativeLine)
  .usePlugin(NodeImgAdjust)
  .usePlugin(TouchEvent)
  .usePlugin(SearchPlugin)
  .usePlugin(Painter)
  .usePlugin(Formula)
  .usePlugin(RainbowLines)
  .usePlugin(DemonstratePlugin)
  .usePlugin(OuterFrame)
  .usePlugin(MindMapLayoutPro)
  .usePlugin(NodeBase64ImageStorage)
  .usePlugin(RichText)

// 注册主题
Themes.init(MindMap)

export default {
  components: {
    OutlineSidebar,
    Style,
    BaseStyle,
    Theme,
    Structure,
    NavigatorToolbar,
    ShortcutKey,
    Contextmenu,
    RichTextToolbar,
    NodeNoteContentShow,
    Navigator,
    NodeImgPreview,
    SidebarTrigger,
    Search,
    NodeIconSidebar,
    NodeIconToolbar,
    Scrollbar,
    FormulaSidebar,
    NodeOuterFrame,
    NodeTagStyle,
    Setting,
    AssociativeLineStyle,
    NodeImgPlacementToolbar,
    NodeNoteSidebar,
    Demonstrate
  },
  data() {
    return {
      enableShowLoading: true,
      tmpMindMap: null,
      mindMap: null,
      mindMapData: null,
      mindMapConfig: {},
      loading: false,
      isFirst: true,
      autoSaveTimer: null,
      isSaving: false,
      savingTimer: null,
      storeConfigTimer: null,
      isNotTriggerDataChange: false,
      dragEnterNode: null
    }
  },
  computed: {
    ...mapState({
      isZenMode: state => state.localConfig.isZenMode,
      isShowScrollbar: state => state.localConfig.isShowScrollbar,
      useLeftKeySelectionRightKeyDrag: state =>
        state.localConfig.useLeftKeySelectionRightKeyDrag,
      extraTextOnExport: state => state.extraTextOnExport,
      autoSaveTime: state => state.localConfig.autoSaveTime,
      isShowBottomToolbar: state => state.localConfig.isShowBottomToolbar
    })
  },
  watch: {
    isShowScrollbar() {
      if (this.isShowScrollbar) {
        this.addScrollbarPlugin()
      } else {
        this.removeScrollbarPlugin()
      }
    }
  },
  mounted() {
    this.showLoading()
    this.getData()
    this.init()
    this.$root.$bus.$on('execCommand', this.execCommand)
    this.$root.$bus.$on('paddingChange', this.onPaddingChange)
    this.$root.$bus.$on('export', this.export)
    this.$root.$bus.$on('setData', this.setData)
    this.$root.$bus.$on('startTextEdit', this.handleStartTextEdit)
    this.$root.$bus.$on('endTextEdit', this.handleEndTextEdit)
    this.$root.$bus.$on(
      'createAssociativeLine',
      this.handleCreateLineFromActiveNode
    )
    this.$root.$bus.$on('startPainter', this.handleStartPainter)
    this.$root.$bus.$on('node_tree_render_end', this.handleHideLoading)
    this.$root.$bus.$on('showLoading', this.handleShowLoading)
    this.$root.$bus.$on('hideLoading', this.hideLoading)
    this.$root.$bus.$on('windowResize', this.handleResize)
    this.$root.$bus.$on('saveToLocal', this.manuallySave)
    this.$root.$bus.$on('storeData', this.updateMindMapData)
    this.$root.$bus.$on(
      'updateMindMapDataFromOb',
      this.onUpdateMindMapDataFromOb
    )
    this.$root.$bus.$on('clearAutoSave', this.clearAutoSave)
    this.$root.$bus.$on('getMindMapCurrentData', this.emitMindMapCurrentData)
    this.$root.$bus.$on('obTabDeactivate', this.onObTabDeactivate)
    this.$root.$bus.$on('toggleReadonly', this.onToggleReadonly)
    this.$root.$bus.$on('jumpToNodeByUid', this.jumpToNodeByUid)
  },
  beforeDestroy() {
    this.$root.$bus.$off('execCommand', this.execCommand)
    this.$root.$bus.$off('paddingChange', this.onPaddingChange)
    this.$root.$bus.$off('export', this.export)
    this.$root.$bus.$off('setData', this.setData)
    this.$root.$bus.$off('startTextEdit', this.handleStartTextEdit)
    this.$root.$bus.$off('endTextEdit', this.handleEndTextEdit)
    this.$root.$bus.$off(
      'createAssociativeLine',
      this.handleCreateLineFromActiveNode
    )
    this.$root.$bus.$off('startPainter', this.handleStartPainter)
    this.$root.$bus.$off('node_tree_render_end', this.handleHideLoading)
    this.$root.$bus.$off('showLoading', this.handleShowLoading)
    this.$root.$bus.$off('hideLoading', this.hideLoading)
    this.$root.$bus.$off('windowResize', this.handleResize)
    this.$root.$bus.$off('saveToLocal', this.manuallySave)
    this.$root.$bus.$off('storeData', this.updateMindMapData)
    this.$root.$bus.$off(
      'updateMindMapDataFromOb',
      this.onUpdateMindMapDataFromOb
    )
    this.$root.$bus.$off('clearAutoSave', this.clearAutoSave)
    this.$root.$bus.$off('getMindMapCurrentData', this.emitMindMapCurrentData)
    this.$root.$bus.$off('obTabDeactivate', this.onObTabDeactivate)
    this.$root.$bus.$off('toggleReadonly', this.onToggleReadonly)
    this.$root.$bus.$off('jumpToNodeByUid', this.jumpToNodeByUid)
    clearTimeout(this.autoSaveTimer)
    clearTimeout(this.savingTimer)
    this.mindMap.destroy()
  },
  methods: {
    onToggleReadonly(isReadonly) {
      if (this.mindMap) {
        this.mindMap.setMode(isReadonly ? 'readonly' : 'edit')
      }
    },

    showLoading() {
      this.loading = true
    },

    hideLoading() {
      this.loading = false
    },

    handleStartTextEdit() {
      this.mindMap.renderer.startTextEdit()
    },

    handleEndTextEdit() {
      this.mindMap.renderer.endTextEdit()
    },

    handleCreateLineFromActiveNode() {
      this.mindMap.associativeLine.createLineFromActiveNode()
      this.$root.$obsidianAPI.showTip(this.$t('edit.createAssociativeLineTip'))
    },

    handleStartPainter() {
      this.mindMap.painter.startPainter()
      this.$root.$obsidianAPI.showTip(this.$t('edit.painterTip'))
    },

    handleResize() {
      if (!this.mindMap) return
      this.mindMap.resize()
    },

    // 显示loading
    handleShowLoading() {
      this.enableShowLoading = true
      this.showLoading()
    },

    // 渲染结束后关闭loading
    handleHideLoading() {
      if (this.enableShowLoading) {
        this.enableShowLoading = false
        this.hideLoading()
      }
    },

    // 获取思维导图数据，实际应该调接口获取
    getData() {
      this.mindMapData = JSON.parse(
        this.$root.$obsidianAPI.getInitMindMapData()
      )
      this.mindMapConfig = this.$root.$obsidianAPI.getMindMapConfig() || {}
    },

    // 初始化
    init() {
      let { root, layout, theme, view } = this.mindMapData
      const config = this.mindMapConfig
      this.tmpMindMap = new MindMap({
        el: this.$refs.mindMapContainer,
        touchEventBindEl: this.$refs.mindMapContainer,
        data: root,
        fit: false,
        layout: layout,
        theme: theme.template,
        themeConfig: theme.config,
        viewData: view,
        nodeTextEditZIndex: 1000,
        nodeNoteTooltipZIndex: 1000,
        customNoteContentShow: {
          show: (...args) => {
            this.$root.$bus.$emit('showNoteContent', ...args)
          },
          hide: () => {
            // this.$root.$bus.$emit('hideNoteContent')
          }
        },
        openRealtimeRenderOnNodeTextEdit: false,
        enableAutoEnterTextEditWhenKeydown: true,
        demonstrateConfig: {
          openBlankMode: false
        },
        ...(config || {}),
        iconList: [...icon],
        useLeftKeySelectionRightKeyDrag: this.useLeftKeySelectionRightKeyDrag,
        customInnerElsAppendTo: this.$refs.editContainer,
        handleElPositionOnCustomInnerElsAppendTo: (left, top) => {
          return {
            left: left - this.mindMap.elRect.left,
            top: top - this.mindMap.elRect.top
          }
        },
        textEidtNoOverCanvas: true,
        customHandleClipboardText: handleClipboardText,
        defaultNodeImage: imgFail,
        initRootNodePosition: ['center', 'center'],
        defaultInsertSecondLevelNodeText: this.$t(
          'edit.defaultInsertSecondLevelNodeText'
        ),
        defaultInsertBelowSecondLevelNodeText: this.$t(
          'edit.defaultInsertBelowSecondLevelNodeText'
        ),
        defaultGeneralizationText: this.$t('edit.defaultGeneralizationText'),
        defaultAssociativeLineText: this.$t('edit.defaultAssociativeLineText'),
        defaultOuterFrameText: this.$t('edit.defaultOuterFrameText'),
        handleIsSplitByWrapOnPasteCreateNewNode: () => {
          return this.$confirm(
            this.$t('edit.splitByWrap'),
            this.$t('edit.tip'),
            {
              confirmButtonText: this.$t('edit.yes'),
              cancelButtonText: this.$t('edit.no'),
              type: 'warning',
              customClass: 'smmCustomElConfirm'
            }
          )
        },
        errorHandler: (code, err) => {
          console.error(err)
          switch (code) {
            case 'export_error':
              this.$root.$obsidianAPI.showTip(this.$t('edit.exportError'))
              break
            default:
              break
          }
        },
        addContentToFooter: () => {
          const text = this.extraTextOnExport.trim()
          if (!text) return null
          const el = document.createElement('div')
          el.className = 'footer'
          el.innerHTML = text
          const cssText = `
            .footer {
              width: 100%;
              height: 30px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 12px;
              color: #979797;
            }
          `
          return {
            el,
            cssText,
            height: 30
          }
        },
        expandBtnNumHandler: num => {
          return num >= 100 ? '…' : num
        },
        beforeDeleteNodeImg: node => {
          return new Promise(resolve => {
            this.$confirm(
              this.$t('edit.deleteNodeImgTip'),
              this.$t('edit.tip'),
              {
                confirmButtonText: this.$t('edit.yes'),
                cancelButtonText: this.$t('edit.no'),
                type: 'warning',
                customClass: 'smmCustomElConfirm'
              }
            )
              .then(() => {
                resolve(false)
              })
              .catch(() => {
                resolve(true)
              })
          })
        },
        customHyperlinkJump: (link, node, e) => {
          const linkTitle = node.getData('hyperlinkTitle') || ''
          if (link) {
            if (!isHyperlink(link) && isObLinkText(linkTitle)) {
              const isNewTab = e.ctrlKey || e.metaKey
              this.$root.$obsidianAPI.openFile(link, isNewTab)
            } else {
              this.$root.$obsidianAPI.openWebLink(link)
            }
          }
        },
        transformImageUrl: url => {
          if (isNormalUrl(url)) {
            return url
          }
          return this.$root.$obsidianAPI.getResourcePath(url)
        },
        handleNodePasteImg: async imgFile => {
          try {
            const file = new File(
              [imgFile],
              getFilenameWithExtension(
                this.$t('edit.pasteImage'),
                imgFile.type
              ),
              {
                type: imgFile.type
              }
            )
            const url = await this.$root.$obsidianAPI.saveFileToVault(file)
            const size = await getImageSize(
              this.$root.$obsidianAPI.getResourcePath(url)
            )
            return {
              url,
              size
            }
          } catch (error) {
            return new Promise((resolve, reject) => {
              let fr = new FileReader()
              fr.readAsDataURL(imgFile)
              fr.onload = async e => {
                let url = e.target.result
                let size = await getImageSize(url)
                resolve({
                  url,
                  size
                })
              }
              fr.onerror = error => {
                reject(error)
              }
            })
          }
        },
        dynamicGetHyperlinkIcon: (node, link, linkTitle) => {
          if (!isHyperlink(link) && isObLinkText(linkTitle)) {
            return {
              icon: obFileHyperlinkIcon,
              style: {}
            }
          } else {
            return {
              icon: hyperlinkIcon,
              style: {}
            }
          }
        }
      })
      this.afterInitMindMap(this.tmpMindMap)
    },

    afterInitMindMap(mindMap) {
      mindMap.on('node_tree_render_end', this.onFirstNodeTreeRenderEnd)

      this.loadPlugins(mindMap)

      // 转发事件
      ;[
        'node_active',
        'data_change',
        'view_data_change',
        'back_forward',
        'node_contextmenu',
        'node_click',
        'draw_click',
        'expand_btn_click',
        'svg_mousedown',
        'mouseup',
        'mode_change',
        'node_tree_render_end',
        'rich_text_selection_change',
        'transforming-dom-to-images',
        'generalization_node_contextmenu',
        'painter_start',
        'painter_end',
        'scrollbar_change',
        'scale',
        'translate',
        'node_attachmentClick',
        'node_attachmentContextmenu',
        'demonstrate_jump',
        'exit_demonstrate',
        'node_note_dblclick',
        'node_mousedown',
        'node_img_dblclick'
      ].forEach(event => {
        mindMap.on(event, (...args) => {
          this.$root.$bus.$emit(event, ...args)
        })
      })
      this.bindSaveEvent()
    },

    // 切换到其他标签页时结束一些状态
    onObTabDeactivate() {
      if (!this.mindMap) return
      this.mindMap.renderer.textEdit.hideEditTextBox()
      if (this.mindMap.associativeLine) {
        this.mindMap.associativeLine.hideEditTextBox()
      }
      if (this.mindMap.outerFrame) {
        this.mindMap.outerFrame.hideEditTextBox()
      }
      this.mindMap.emit('svg_mousedown')
      this.mindMap.emit('draw_click')
    },

    // 首次节点树渲染完毕
    onFirstNodeTreeRenderEnd() {
      this.mindMap = this.tmpMindMap
      this.tmpMindMap = null
      // 判断是否需要定位到某个节点
      let nodeId = this.$root.$obsidianAPI.getInitLocationNodeId()
      if (nodeId) {
        nodeId = nodeId
          .replace(/^#\^/, '')
          .replace(/^#/, '')
          .replace(/^\^/, '')
        this.mindMap.execCommand('GO_TARGET_NODE', nodeId)
      }
      this.mindMap.off('node_tree_render_end', this.onFirstNodeTreeRenderEnd)
      this.hideLoading()
      this.$emit('loadend')
    },

    jumpToNodeByUid(uid) {
      if (!this.mindMap) {
        return
      }
      this.mindMap.execCommand('GO_TARGET_NODE', uid)
    },

    // 加载相关插件
    loadPlugins(mindMap) {
      if (this.isShowScrollbar) this.addScrollbarPlugin(mindMap)
    },

    // 动态设置思维导图数据
    setData(data) {
      this.handleShowLoading()
      let rootNodeData = null
      if (data.root) {
        this.mindMapData = data
        this.mindMap.setFullData(data)
        rootNodeData = data.root
      } else {
        this.updateMindMapData(
          {
            root: data
          },
          false
        )
        this.mindMap.setData(data)
        rootNodeData = data
      }
      this.mindMap.view.reset()
      this.saveToLocal()
    },

    // 从obsidian获取数据后更新思维导图数据
    onUpdateMindMapDataFromOb(data) {
      try {
        this.isNotTriggerDataChange = true
        data = JSON.parse(data)
        this.mindMap.updateData(data.root)
        // 判断结构是否发生改变
        if (data.layout !== this.mindMap.getLayout()) {
          this.mindMap.setLayout(data.layout)
        }
        // 判断主题是否发生改变
        if (data.theme) {
          // 基础主题
          if (
            data.theme.template &&
            data.theme.template !== this.mindMap.getTheme()
          ) {
            this.mindMap.setTheme(data.theme.template)
          }
          // 主题配置
          if (
            data.theme.config &&
            !isSameObject(
              data.theme.config,
              this.mindMap.getCustomThemeConfig()
            )
          ) {
            this.mindMap.setThemeConfig(data.theme.config)
          }
        }
        this.updateMindMapData(data, false)
      } catch (error) {
        console.log(error)
      }
    },

    // 更新思维导图数据
    updateMindMapData(data, isSaveToLocal = true) {
      this.mindMapData = {
        ...this.mindMapData,
        ...data
      }
      if (isSaveToLocal) {
        this.saveToLocal()
      }
    },

    // 存储数据当数据有变时
    bindSaveEvent() {
      this.$root.$bus.$on('data_change', data => {
        if (this.isNotTriggerDataChange) {
          this.isNotTriggerDataChange = false
          return
        }
        if (!this.isFirst) {
          this.autoSave()
        } else {
          this.isFirst = false
        }
        this.updateMindMapData({ root: data }, false)
      })
      this.$root.$bus.$on('view_data_change', data => {
        // this.autoSave()
        clearTimeout(this.storeConfigTimer)
        this.storeConfigTimer = setTimeout(() => {
          this.updateMindMapData({ view: data }, false)
        }, 300)
      })
    },

    // 自动保存
    autoSave() {
      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = setTimeout(() => {
        this.saveToLocal()
      }, this.autoSaveTime * 1000)
    },

    clearAutoSave() {
      clearTimeout(this.autoSaveTimer)
    },

    // 手动触发保存
    manuallySave(...args) {
      clearTimeout(this.autoSaveTimer)
      this.saveToLocal(...args)
    },

    // 保存到本地文件
    async saveToLocal(isShowTip = false, getSvg = false) {
      if (this.isSaving) {
        this.$root.$obsidianAPI.showTip(this.$t('edit.savingTip'))
        return
      }
      clearTimeout(this.savingTimer)
      this.savingTimer = setTimeout(async () => {
        try {
          this.isSaving = true
          const data = this.mindMap.getData(true)
          if (!data.root) {
            this.$root.$obsidianAPI.showTip(this.$t('edit.savingTip2'))
            this.isSaving = false
            return
          }
          const {
            compressImageIsTransparent,
            saveCanvasViewData
          } = this.$root.$obsidianAPI.getSettings()
          if (!saveCanvasViewData) {
            data.view = null
          }
          let svgData = ''
          if (getSvg) {
            const hasImg = checkMindTreeHasImg(data.root)
            svgData = await this.mindMap.export(
              hasImg ? 'png' : 'svg',
              false,
              '',
              compressImageIsTransparent
            )
          }
          await this.$root.$obsidianAPI.saveMindMapData(
            JSON.stringify(data),
            svgData
          )
          if (isShowTip) {
            this.$root.$obsidianAPI.showTip(this.$t('edit.savingTip3'))
          }
          this.isSaving = false
        } catch (error) {
          console.log(error)
          this.$root.$obsidianAPI.showTip(error || this.$t('edit.savingTip4'))
          this.isSaving = false
        }
      }, 200)
    },

    // 更新内链到md文档
    updateInnerLink(data) {
      const obLinkMap = {}
      const textData = []
      const { supportObSearch } = this.$root.$obsidianAPI.getSettings()
      dfsTraverse(data.root, node => {
        if (supportObSearch) {
          textData.push(
            nodeRichTextToTextWithWrap(node.data.text) + ' ^' + node.data.uid
          )
        }
        // 超链接
        const { hyperlink, hyperlinkTitle } = node.data
        if (
          hyperlink &&
          hyperlinkTitle &&
          !isHyperlink(hyperlink) &&
          isObLinkText(hyperlinkTitle)
        ) {
          obLinkMap[hyperlinkTitle] = true
        }
      })
      return {
        linkData: Object.keys(obLinkMap).map(key => {
          return key
        }),
        textData
      }
    },

    // 发送最新数据给ob保存
    emitMindMapCurrentData() {
      try {
        if (!this.mindMap) return
        const data = this.mindMap.getData(true)
        if (!data || !data.root) {
          this.$root.$obsidianAPI.showTip(this.$t('edit.savingTip2'))
          return
        }
        const { saveCanvasViewData } = this.$root.$obsidianAPI.getSettings()
        if (!saveCanvasViewData) {
          data.view = null
        }
        const { linkData, textData } = this.updateInnerLink(data)
        this.$root.$obsidianAPI.getMindMapCurrentData(
          JSON.stringify(data),
          linkData,
          textData
        )
      } catch (error) {
        console.log(error)
      }
    },

    // 重新渲染
    reRender() {
      this.mindMap.reRender()
    },

    // 执行命令
    execCommand(...args) {
      this.mindMap.execCommand(...args)
    },

    // 导出
    async export(...args) {
      try {
        this.showLoading()
        await this.mindMap.export(...args)
        this.hideLoading()
      } catch (error) {
        console.log(error)
        this.hideLoading()
      }
    },

    // 修改导出内边距
    onPaddingChange(data) {
      this.mindMap.updateConfig(data)
    },

    // 加载滚动条插件
    addScrollbarPlugin(mindMap) {
      mindMap = mindMap || this.mindMap
      if (!mindMap) return
      mindMap.addPlugin(ScrollbarPlugin)
    },

    // 移除滚动条插件
    removeScrollbarPlugin() {
      this.mindMap.removePlugin(ScrollbarPlugin)
    },

    // 拖拽进入节点事件
    onDragEnter(e) {
      e.preventDefault()
      const node = this.getDragEnterNode(e)
      if (node) {
        if (this.dragEnterNode && this.dragEnterNode.uid === node.uid) {
          // 和当前移入节点一样，啥也不干
        } else {
          // 否则先取消当前节点的激活状态
          if (this.dragEnterNode) {
            if (this.dragEnterNode.getData('isActive')) {
              this.mindMap.renderer.removeNodeFromActiveList(this.dragEnterNode)
            }
          }
          // 然后激活并存储当前移入节点
          this.mindMap.renderer.addNodeToActiveList(node)
          this.dragEnterNode = node
          this.mindMap.renderer.emitNodeActiveEvent()
        }
      } else {
        // 没有移入节点，取消当前节点的激活状态
        if (this.dragEnterNode) {
          this.mindMap.renderer.removeNodeFromActiveList(this.dragEnterNode)
          this.mindMap.renderer.emitNodeActiveEvent()
          this.dragEnterNode = null
        }
      }
    },

    // 获取拖拽进入的节点
    getDragEnterNode(e) {
      let res = null
      const { x, y } = this.mindMap.toPos(e.clientX, e.clientY)
      const {
        scaleX,
        scaleY,
        translateX,
        translateY
      } = this.mindMap.draw.transform()
      const check = node => {
        let { left, top, width, height } = node
        let right = (left + width) * scaleX + translateX
        let bottom = (top + height) * scaleY + translateY
        left = left * scaleX + translateX
        top = top * scaleY + translateY
        return x > left && x < right && y > top && y < bottom
      }
      const walk = node => {
        if (check(node)) {
          res = node
          return
        }
        // 概要节点
        if (node._generalizationList && node._generalizationList.length > 0) {
          let exist = false
          node._generalizationList.forEach(item => {
            if (check(item.generalizationNode)) {
              res = item.generalizationNode
              exist = true
            }
          })
          if (exist) {
            return
          }
        }
        if (node.children && node.children.length > 0) {
          node.children.forEach(item => {
            walk(item)
          })
        }
      }
      walk(this.mindMap.renderer.root)
      return res
    },

    // 拖拽插入图片或文件到某个节点
    // 支持：ob仓库文件、本地文件、图片、文字
    onDrop(e) {
      e.preventDefault()
      if (!this.dragEnterNode) return
      const textData = e.dataTransfer?.getData('text/plain')
      const files = e.dataTransfer?.files
      if (textData || files.length > 0) {
        this.insertDragDataToNode({ textData, files, node: this.dragEnterNode })
      }
      this.dragEnterNode = null
    },

    // 插入拖拽数据到节点
    async insertDragDataToNode({ textData, files, node }) {
      let err = ''
      let fileUrl = ''
      // 先检查文本数据是否为ob文件
      if (textData) {
        const tFile = this.$root.$obsidianAPI.getFileFromUri(textData)
        // ob文件
        if (tFile) {
          fileUrl = tFile.path
        }
      }
      // 没有文本数据，则检查文件数据
      if (!fileUrl && files.length > 0) {
        const file = files[0]
        // 将文件上传到ob仓库
        const result = await this.$root.$obsidianAPI.saveFileToVault(
          file,
          false
        )
        if (result) {
          fileUrl = result
        } else {
          err = this.$t('nodeHyperlink.tip4')
        }
      }
      if (!fileUrl) {
        this.$root.$obsidianAPI.showTip(err || this.$t('nodeHyperlink.tip5'))
        return
      }
      // if (node.isGeneratorFunction) {
      //   console.log(node)
      //   return
      // }
      // 图片直接以图片形式插入
      if (/\.(jpg|jpeg|png|gif|webp)$/.test(fileUrl)) {
        const viewUrl = this.$root.$obsidianAPI.getResourcePath(fileUrl)
        const { width, height } = await getImageSize(viewUrl)
        node.setImage({
          url: fileUrl,
          title: '',
          width,
          height
        })
      } else {
        // 文件以链接形式插入
        // 获取上传的文件的路径数据
        const result = this.$root.$obsidianAPI.createLinkInfoFromFilePath(
          fileUrl
        )
        if (!result) {
          this.$root.$obsidianAPI.showTip(this.$t('nodeHyperlink.tip2'))
          return
        }
        node.setHyperlink(result.link, result.linkText || '')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.editContainer {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;

  .mindMapContainer {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;

    // left: 100px;
    // top: 100px;
    // right: 100px;
    // bottom: 100px;
  }
}
</style>
