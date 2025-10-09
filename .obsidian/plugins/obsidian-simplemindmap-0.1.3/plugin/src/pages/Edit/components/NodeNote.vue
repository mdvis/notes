<template>
  <el-dialog
    class="nodeNoteDialog smmElDialog"
    :title="$t('nodeNote.title')"
    :visible.sync="dialogVisible"
    :width="'90%'"
    :top="isMobile ? '20px' : '15vh'"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
  >
    <div class="noteEditor" ref="noteEditor" @keyup.stop @keydown.stop></div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel" size="small" class="smmElButtonSmall">{{
        $t('dialog.cancel')
      }}</el-button>
      <el-button
        type="primary"
        @click="confirm"
        size="small"
        class="smmElButtonSmall"
        >{{ $t('dialog.confirm') }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/i18n/zh-cn'
import '@toast-ui/editor/dist/i18n/zh-TW'
import { mapState } from 'vuex'
import { toastUiEditorLangMap } from '@/config/constant'
import { compressImage, isNormalUrl } from '@/utils'
import noteMixin from '@/mixins/note'

// 节点备注内容设置
export default {
  name: 'NodeNote',
  mixins: [noteMixin],
  data() {
    return {
      dialogVisible: false,
      note: '',
      activeNodes: [],
      editor: null,
      appointNode: null
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark,
      isMobile: state => state.isMobile
    })
  },
  watch: {
    dialogVisible(val, oldVal) {
      if (!val && oldVal) {
        this.$root.$bus.$emit('endTextEdit')
      }
    }
  },
  created() {
    this.$root.$bus.$on('node_active', this.handleNodeActive)
    this.$root.$bus.$on('showNodeNote', this.handleShowNodeNote)
  },
  beforeDestroy() {
    this.$root.$bus.$off('node_active', this.handleNodeActive)
    this.$root.$bus.$off('showNodeNote', this.handleShowNodeNote)
  },
  methods: {
    handleNodeActive(...args) {
      this.activeNodes = [...args[1]]
      this.updateNoteInfo()
    },

    updateNoteInfo() {
      if (this.activeNodes.length > 0) {
        let firstNode = this.activeNodes[0]
        this.note = firstNode.getData('note') || ''
      } else {
        this.note = ''
      }
    },

    handleShowNodeNote(node) {
      this.$root.$bus.$emit('startTextEdit')
      if (node) {
        this.appointNode = node
        this.note = node.getData('note') || ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.initEditor()
      })
    },

    initEditor() {
      if (!this.editor) {
        this.editor = new Editor({
          el: this.$refs.noteEditor,
          height: '500px',
          initialEditType: 'markdown',
          previewStyle: 'vertical',
          theme: this.isDark ? 'dark' : 'light',
          language:
            toastUiEditorLangMap[this.$i18n.locale] || toastUiEditorLangMap.en,
          customHTMLRenderer: {
            // 拦截图片渲染逻辑
            image: (node, { entering }) => {
              if (!entering) return null
              let url = node.destination || node.src
              // 自定义转换逻辑（例如添加前缀、替换域名）
              if (!isNormalUrl(url)) {
                url = this.$root.$obsidianAPI.getResourcePath(
                  decodeURIComponent(url)
                )
              }
              return {
                type: 'html',
                content: `<img data-url="${url}" />`
              }
            }
          },
          events: {
            change: () => {
              this.$nextTick(() => {
                const imgs = document.querySelectorAll(
                  '.toastui-editor-md-preview img'
                )
                const img2 = document.querySelectorAll(
                  '.toastui-editor-ww-container img'
                )
                this.fixNoteImg([...Array.from(imgs), ...Array.from(img2)])
              })
            }
          },
          hooks: {
            addImageBlobHook: async (file, callback) => {
              try {
                const {
                  compressImage: isCompress,
                  compressImageOptionsMaxWidth,
                  compressImageOptionsMaxHeight,
                  compressImageOptionsQuality
                } = this.$root.$obsidianAPI.getSettings()
                if (isCompress) {
                  file = await compressImage(file, {
                    exportType: 'file',
                    maxWidth: compressImageOptionsMaxWidth,
                    maxHeight: compressImageOptionsMaxHeight,
                    quality: compressImageOptionsQuality
                  })
                }
                const result = await this.$root.$obsidianAPI.saveFileToVault(
                  file
                )
                if (!result) {
                  throw new Error(this.$t('imageUpload.failTip'))
                }
                callback(result)
              } catch (error) {
                console.error('上传失败', error)
              }
            }
          }
        })
      }
      this.editor.setMarkdown(this.note)
    },

    cancel() {
      this.dialogVisible = false
      if (this.appointNode) {
        this.appointNode = null
        this.updateNoteInfo()
      }
    },

    confirm() {
      this.note = this.editor.getMarkdown()
      if (this.appointNode) {
        this.appointNode.setNote(this.note)
      } else {
        this.activeNodes.forEach(node => {
          node.setNote(this.note)
        })
      }

      this.cancel()
    }
  }
}
</script>

<style lang="less" scoped>
.nodeNoteDialog {
  /deep/ .el-dialog {
    max-width: 800px;
  }

  .tip {
    margin-top: 5px;
    color: #dcdfe6;
  }
}
</style>
