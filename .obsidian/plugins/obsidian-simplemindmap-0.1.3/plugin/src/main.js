import Vue from 'vue'
import App from './pages/Edit/Index.vue'
import createStore from './store'
import './style/element-variables.scss'
import '@/assets/icon-font/iconfont.css'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import i18n from './i18n'
import '@/style/common.less'
import '@/style/sidebar.less'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'
import PreviewMode from './pages/PreviewMode/Index.vue'
import {
  Dialog,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Input,
  Popover,
  Select,
  Option,
  Tabs,
  TabPane,
  Checkbox,
  Slider,
  ColorPicker,
  Radio,
  RadioGroup,
  Button,
  Upload,
  RadioButton,
  Tree,
  InputNumber,
  MessageBox,
  Loading
} from 'element-ui'

Vue.config.productionTip = false
Vue.use(VueViewer)
Vue.use(Dialog)
Vue.use(Button)
Vue.use(Input)
Vue.use(Select)
Vue.use(Option)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Checkbox)
Vue.use(Slider)
Vue.use(ColorPicker)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Upload)
Vue.use(RadioButton)
Vue.use(Tree)
Vue.use(InputNumber)
Vue.use(Popover)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Loading.directive)
Vue.prototype.$loading = Loading.service
Vue.prototype.$confirm = MessageBox.confirm

// 初始化独立窗口编辑应用
export const initApp = (el, obsidianAPI = {}) => {
  i18n.locale = obsidianAPI.getSettings().lang || 'en'
  const app = new Vue({
    render: h => h(App),
    store: createStore(),
    i18n
  })
  const bus = new Vue()
  // 注册全局事件总线
  app.$bus = bus
  // 派发更新思维导图尺寸事件
  let resizeTimer = null
  app.$updateMindMapSize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      app.$bus.$emit('windowResize')
    }, 300)
  }
  app.$clearUpdateMindMapSize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = null
  }
  // 挂载一些API
  app.$obsidianAPI = obsidianAPI
  app.$mount(el)
  return app
}

const initCommonApp = (el, obsidianAPI = {}, component) => {
  i18n.locale = obsidianAPI.getSettings().lang || 'en'
  const app = new Vue({
    render: h => h(component),
    store: createStore(),
    i18n
  })
  const bus = new Vue()
  // 注册全局事件总线
  app.$bus = bus
  // 挂载一些API
  app.$obsidianAPI = obsidianAPI
  app.$mount(el)
  return app
}

export const initPreviewModeApp = (el, obsidianAPI = {}) => {
  return initCommonApp(el, obsidianAPI, PreviewMode)
}
