<template>
  <div class="countContainer" :class="{ isDark: isDark }"></div>
</template>

<script>
import { mapState } from 'vuex'

// 字数及节点数量统计
let countEl = document.createElement('div')
export default {
  props: {
    mindMap: {
      type: Object
    }
  },
  data() {
    return {
      textStr: '',
      words: 0,
      num: 0,
      statusEl: null
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark
    })
  },
  created() {
    this.$root.$bus.$on('data_change', this.onDataChange)
    if (this.mindMap) {
      this.onDataChange(this.mindMap.getData())
    }
  },
  beforeDestroy() {
    if (this.statusEl) {
      this.statusEl.innerHTML = ''
      this.statusEl = null
    }
    this.$root.$bus.$off('data_change', this.onDataChange)
  },
  methods: {
    // 监听数据变化
    onDataChange(data) {
      this.textStr = ''
      this.words = 0
      this.num = 0
      this.walk(data)
      countEl.innerHTML = this.textStr
      this.words = countEl.textContent.length
      this.statusEl = document.querySelector('.smm-file-status')
      if (this.statusEl) {
        this.statusEl.innerHTML = `
        <span class="smm-file-status-item">${this.$t('count.words')} ${
          this.words
        }</span>
        <span class="smm-file-status-item">${this.$t('count.nodes')} ${
          this.num
        }</span>
      `
      }
    },

    // 遍历
    walk(data) {
      if (!data) return
      this.num++
      this.textStr += String(data.data.text) || ''
      if (data.children && data.children.length > 0) {
        data.children.forEach(item => {
          this.walk(item)
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.countContainer {
  font-size: 12px;
  display: flex;
  align-items: center;

  &.isDark {
    .item {
      color: hsla(0, 0%, 100%, 0.6);
    }
  }

  .item {
    color: #555;
    margin-right: 15px;

    &:last-of-type {
      margin-right: 0;
    }

    .name {
      margin-right: 5px;
    }
  }
}
</style>
<style lang="less">
/* 隐藏默认状态栏项 */
.smm-file-status-active .status-bar-item.plugin-word-count,
.smm-file-status-active .status-bar-item.plugin-sync {
  display: none !important;
}

.smm-file-status {
  .smm-file-status-item {
    margin-right: 4px;

    &:last-of-type {
      margin-right: 0;
    }
  }
}
</style>
