import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const createStore = () => {
  return new Vuex.Store({
    state: {
      localConfig: {
        // 本地配置
        isZenMode: false, // 是否是禅模式
        // 鼠标行为
        useLeftKeySelectionRightKeyDrag: false,
        // 是否显示滚动条
        isShowScrollbar: false,
        // 是否是暗黑模式
        isDark: false,
        // 是否显示底部工具栏
        isShowBottomToolbar: true,
        // 自动保存时间
        autoSaveTime: 5
      },
      activeSidebar: '', // 当前显示的侧边栏
      isOutlineEdit: false, // 是否是大纲编辑模式
      isReadonly: false, // 是否只读
      extraTextOnExport: '', // 导出时底部添加的文字
      // 是否是移动端
      isMobile: false
    },
    mutations: {
      // 设置本地配置
      setLocalConfig(state, data) {
        Object.keys(data).forEach(key => {
          state.localConfig[key] = data[key]
        })
      },

      // 设置当前显示的侧边栏
      setActiveSidebar(state, data) {
        state.activeSidebar = data
      },

      // 设置大纲编辑模式
      setIsOutlineEdit(state, data) {
        state.isOutlineEdit = data
      },

      // 设置是否只读
      setIsReadonly(state, data) {
        state.isReadonly = data
      },

      // 设置导出时底部添加的文字
      setExtraTextOnExport(state, data) {
        state.extraTextOnExport = data
      },

      // 设置是否是移动端
      setIsMobile(state, data) {
        state.isMobile = data
      }
    },
    actions: {}
  })
}

export default createStore
