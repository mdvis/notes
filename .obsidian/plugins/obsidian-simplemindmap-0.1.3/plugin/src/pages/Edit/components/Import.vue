<template>
  <div>
    <el-dialog
      class="nodeImportDialog smmElDialog"
      :title="$t('import.title')"
      :visible.sync="dialogVisible"
      width="350px"
      :modal-append-to-body="false"
    >
      <el-upload
        action="x"
        :accept="supportFileStr"
        :file-list="fileList"
        :auto-upload="false"
        :multiple="false"
        :on-change="onChange"
        :on-remove="onRemove"
        :limit="1"
        :on-exceed="onExceed"
      >
        <div class="btnList">
          <el-button slot="trigger" size="small" type="primary">{{
            $t('import.selectFile')
          }}</el-button>
        </div>
        <div slot="tip" class="el-upload__tip">
          {{ $t('import.support') }}{{ supportFileStr }}{{ $t('import.file') }}
        </div>
      </el-upload>
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
    <el-dialog
      class="xmindCanvasSelectDialog smmElDialog"
      :title="$t('import.xmindCanvasSelectDialogTitle')"
      :visible.sync="xmindCanvasSelectDialogVisible"
      width="300px"
      :show-close="false"
      :modal-append-to-body="false"
    >
      <el-radio-group v-model="selectCanvas" class="canvasList">
        <el-radio
          v-for="(item, index) in canvasList"
          :key="index"
          :label="index"
          >{{ item.title }}</el-radio
        >
      </el-radio-group>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="confirmSelect"
          size="small"
          class="smmElButtonSmall"
          >{{ $t('dialog.confirm') }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import xmind from 'simple-mind-map/src/parse/xmind.js'
import markdown from 'simple-mind-map/src/parse/markdown.js'
import { mapMutations } from 'vuex'
import { base64ToFile } from '@/utils'

// 导入
export default {
  data() {
    return {
      dialogVisible: false,
      fileList: [],
      selectPromiseResolve: null,
      xmindCanvasSelectDialogVisible: false,
      selectCanvas: '',
      canvasList: []
    }
  },
  computed: {
    supportFileStr() {
      return '.smm,.json,.xmind,.md'
    }
  },
  watch: {
    dialogVisible(val, oldVal) {
      if (!val && oldVal) {
        this.fileList = []
      }
    }
  },
  created() {
    this.$root.$bus.$on('showImport', this.handleShowImport)
    this.$root.$bus.$on('importFile', this.handleImportFile)
  },
  beforeDestroy() {
    this.$root.$bus.$off('showImport', this.handleShowImport)
    this.$root.$bus.$off('importFile', this.handleImportFile)
  },
  methods: {
    ...mapMutations(['setActiveSidebar']),

    handleShowImport() {
      this.dialogVisible = true
    },

    getRegexp() {
      return new RegExp(`\.(smm|json|xmind|md)$`)
    },

    // 文件选择
    onChange(file) {
      if (!this.getRegexp().test(file.name)) {
        this.$root.$obsidianAPI.showTip(
          this.$t('import.pleaseSelect') +
            this.supportFileStr +
            this.$t('import.file')
        )
        this.fileList = []
      } else {
        this.fileList.push(file)
      }
    },

    // 移除文件
    onRemove(file, fileList) {
      this.fileList = fileList
    },

    // 数量超出限制
    onExceed() {
      this.$root.$obsidianAPI.showTip(this.$t('import.maxFileNum'))
    },

    // 取消
    cancel() {
      this.dialogVisible = false
    },

    // 确定
    confirm() {
      if (this.fileList.length <= 0) {
        return this.$root.$obsidianAPI.showTip(this.$t('import.notSelectTip'))
      }
      this.$root.$bus.$emit('showLoading')
      let file = this.fileList[0]
      if (/\.(smm|json)$/.test(file.name)) {
        this.handleSmm(file)
      } else if (/\.xmind$/.test(file.name)) {
        this.handleXmind(file)
      } else if (/\.md$/.test(file.name)) {
        this.handleMd(file)
      }
      this.cancel()
      this.setActiveSidebar(null)
    },

    // 处理.smm文件
    handleSmm(file) {
      let fileReader = new FileReader()
      fileReader.readAsText(file.raw)
      fileReader.onload = async evt => {
        try {
          let data = JSON.parse(evt.target.result)
          if (typeof data !== 'object') {
            throw new Error(this.$t('import.fileContentError'))
          }
          await this.transformImgToFile(data)
          this.$root.$bus.$emit('setData', data)
          this.$root.$obsidianAPI.showTip(this.$t('import.importSuccess'))
        } catch (error) {
          console.log(error)
          this.$root.$obsidianAPI.showTip(this.$t('import.fileParsingFailed'))
        }
      }
    },

    // 处理.xmind文件
    async handleXmind(file) {
      try {
        let data = await xmind.parseXmindFile(file.raw, content => {
          this.showSelectXmindCanvasDialog(content)
          return new Promise(resolve => {
            this.selectPromiseResolve = resolve
          })
        })
        await this.transformImgToFile(data)
        this.$root.$bus.$emit('setData', data)
        this.$root.$obsidianAPI.showTip(this.$t('import.importSuccess'))
      } catch (error) {
        console.log(error)
        this.$root.$obsidianAPI.showTip(this.$t('import.fileParsingFailed'))
      }
    },

    // 显示xmind文件的多个画布选择弹窗
    showSelectXmindCanvasDialog(content) {
      this.canvasList = content
      this.selectCanvas = 0
      this.xmindCanvasSelectDialogVisible = true
    },

    // 确认导入指定的画布
    confirmSelect() {
      this.selectPromiseResolve(this.canvasList[this.selectCanvas])
      this.xmindCanvasSelectDialogVisible = false
      this.canvasList = []
      this.selectCanvas = 0
    },

    // 处理markdown文件
    async handleMd(file) {
      let fileReader = new FileReader()
      fileReader.readAsText(file.raw)
      fileReader.onload = async evt => {
        try {
          let data = await markdown.transformMarkdownTo(
            evt.target.result,
            false,
            file.raw.name
          )
          if (!data) {
            this.$root.$obsidianAPI.showTip(this.$t('import.mdImportFailTip'))
            this.$root.$bus.$emit('hideLoading')
            return
          }
          this.$root.$bus.$emit('setData', data)
          this.$root.$obsidianAPI.showTip(this.$t('import.importSuccess'))
        } catch (error) {
          console.log(error)
          this.$root.$obsidianAPI.showTip(this.$t('import.fileParsingFailed'))
        }
      }
    },

    // 导入指定文件
    handleImportFile(file) {
      this.onChange({
        raw: file,
        name: file.name
      })
      if (this.fileList.length <= 0) return
      this.confirm()
    },

    async transformImgToFile(data) {
      if (!data) return
      const nodeTree = data.root ? data.root : data
      const waitLoadImageList = []
      const imgMap = nodeTree.data.imgMap || {}
      const walk = root => {
        const image = root.data.image
        const imageTitle = root.data.imageTitle || ''
        let dataUrl = ''
        if (image) {
          if (/^data:/.test(image)) {
            dataUrl = image
          } else if (imgMap[image] && /^data:/.test(imgMap[image])) {
            dataUrl = imgMap[image]
          }
        }
        if (dataUrl) {
          waitLoadImageList.push(
            new Promise(async resolve => {
              try {
                const res = await this.$root.$obsidianAPI.saveFileToVault(
                  base64ToFile(dataUrl, imageTitle)
                )
                root.data.image = res
                resolve()
              } catch (error) {
                console.log(error)
                resolve()
              }
            })
          )
        }
        if (root.children && root.children.length > 0) {
          root.children.forEach(child => {
            walk(child)
          })
        }
      }
      walk(nodeTree)
      delete nodeTree.data.imgMap
      if (waitLoadImageList.length > 0) {
        await Promise.all(waitLoadImageList)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.nodeImportDialog {
  .btnList {
    display: flex;
    align-items: center;
  }
}

.canvasList {
  display: flex;
  flex-direction: column;

  /deep/ .el-radio {
    margin-bottom: 12px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }
}
</style>
