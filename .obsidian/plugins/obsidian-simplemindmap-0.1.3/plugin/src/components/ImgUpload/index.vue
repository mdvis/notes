<template>
  <div class="imgUploadContainer" :class="{ isDark: isDark }">
    <div class="imgUploadPanel">
      <div class="upBtn" v-if="!value">
        <label
          for="imgUploadInput"
          class="imgUploadInputArea"
          @dragenter.stop.prevent
          @dragover.stop.prevent
          @drop.stop.prevent="onDrop"
          >{{ $t('imageUpload.tip') }}</label
        >
        <input
          type="file"
          accept="image/*"
          id="imgUploadInput"
          @change="onImgUploadInputChange"
        />
      </div>
      <div v-if="value" class="uploadInfoBox">
        <div
          class="previewBox"
          :style="{ backgroundImage: `url('${getResourcePath(value)}')` }"
        ></div>
        <span class="delBtn el-icon-close" @click="deleteImg"></span>
      </div>
    </div>
  </div>
</template>

<script>
import { compressImage, isNormalUrl } from '@/utils'
import { mapState } from 'vuex'

const getDroppedText = item => {
  return new Promise(resolve => {
    item.getAsString(resolve)
  })
}

const handleFiles = files => {
  if (!files || files.length === 0) return
  let res = null
  Array.from(files).forEach(file => {
    if (/^image\//.test(file.type)) {
      res = file
    }
  })
  return res
}

// 读取文字和图片
const getDataFromDt = async dt => {
  let text = null
  let file = null
  // 检查是否有拖拽的文件
  if (dt.files && dt.files.length > 0) {
    file = handleFiles(dt.files)
  }
  // 检查是否有拖拽的文本内容
  else if (dt.items && dt.items.length > 0) {
    for (let i = 0; i < dt.items.length; i++) {
      const item = dt.items[i]
      if (item.kind === 'string' && item.type === 'text/plain') {
        text = await getDroppedText(item)
      }
    }
  }
  return {
    text,
    file
  }
}

export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      file: null
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark
    })
  },
  methods: {
    // 图片选择事件
    onImgUploadInputChange(e) {
      let file = e.target.files[0]
      this.selectImg(file)
    },

    // 拖动上传图片
    async onDrop(e) {
      const { file, text } = await getDataFromDt(e.dataTransfer)
      if (file) {
        this.selectImg(file)
      } else if (text) {
        const tFile = this.$root.$obsidianAPI.getFileFromUri(text)
        if (tFile) {
          this.$emit('selectObFile', tFile.path)
          this.$emit('change', tFile.path)
        }
      }
    },

    // 选择图片
    async selectImg(file) {
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
        const result = await this.$root.$obsidianAPI.saveFileToVault(file)
        if (!result) {
          throw new Error(this.$t('imageUpload.failTip'))
        }
        this.$emit('change', result)
      } catch (error) {
        this.$root.$obsidianAPI.showTip(error)
      }
    },

    // 获取图片大小
    getSize() {
      return new Promise(resolve => {
        let img = new Image()
        img.src = this.getResourcePath(this.value)
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          })
        }
        img.onerror = () => {
          resolve({
            width: 0,
            height: 0
          })
        }
      })
    },

    // 删除图片
    deleteImg() {
      this.$emit('change', '')
    },

    getResourcePath(url) {
      if (isNormalUrl(url)) {
        return url
      }
      return this.$root.$obsidianAPI.getResourcePath(url)
    }
  }
}
</script>

<style lang="less" scoped>
@import './style.less';
</style>
