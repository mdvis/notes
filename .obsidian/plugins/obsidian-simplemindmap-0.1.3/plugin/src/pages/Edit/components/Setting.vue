<template>
  <Sidebar ref="sidebar" :title="$t('setting.title')">
    <template #rightAction>
      <ConfigImportOutputDropdown
        type="smm_setting_config"
        :name="$t('setting.settingConfig')"
        :getConfig="getOutputConfig"
        :setConfig="setConfig"
      ></ConfigImportOutputDropdown>
    </template>
    <div
      class="settingContent smmCommonSidebarContent smmCustomScrollbar"
      :class="{ isDark: isDark }"
      v-if="configData"
    >
      <div class="smmSidebarGroupTitle noTop">{{ $t('setting.title1') }}</div>
      <!-- 根节点是否允许收起下级 -->
      <div class="row">
        <div class="rowItem">
          <el-checkbox
            v-model="config.rootEnableUnExpand"
            @change="updateOtherConfig('rootEnableUnExpand', $event)"
            >{{ $t('setting.rootEnableUnExpand') }}</el-checkbox
          >
        </div>
      </div>
      <!-- 配置开启自由拖拽 -->
      <div class="row">
        <div class="rowItem">
          <el-checkbox
            v-model="config.enableFreeDrag"
            @change="
              value => {
                updateOtherConfig('enableFreeDrag', value)
              }
            "
            >{{ $t('setting.enableFreeDrag') }}</el-checkbox
          >
        </div>
      </div>
      <!-- 节点连线样式是否允许继承祖先的连线样式 -->
      <div class="row">
        <div class="rowItem">
          <el-checkbox
            v-model="config.enableInheritAncestorLineStyle"
            @change="
              updateOtherConfig('enableInheritAncestorLineStyle', $event)
            "
            >{{ $t('setting.enableInheritAncestorLineStyle') }}</el-checkbox
          >
        </div>
      </div>
      <!-- 是否一直显示展开收起按钮 -->
      <div class="row">
        <div class="rowItem">
          <el-checkbox
            v-model="config.alwaysShowExpandBtn"
            @change="updateOtherConfig('alwaysShowExpandBtn', $event)"
            >{{ $t('setting.alwaysShowExpandBtn') }}</el-checkbox
          >
        </div>
      </div>
      <!-- 图片和文本内容的间距 -->
      <div class="row" style="margin-bottom: 0;">
        <div class="rowItem">
          <span
            class="name"
            style="margin-bottom: -5px;"
            :title="$t('setting.imgTextMargin')"
            >{{ $t('setting.imgTextMargin') }}</span
          >
          <el-slider
            style="width: 200px; flex-shrink: 0;"
            v-model="config.imgTextMargin"
            @change="
              value => {
                updateOtherConfig('imgTextMargin', value)
              }
            "
          ></el-slider>
        </div>
      </div>
      <!-- 文本各内容的间距 -->
      <div class="row">
        <div class="rowItem">
          <span
            class="name"
            style="margin-bottom: -5px;"
            :title="$t('setting.textContentMargin')"
            >{{ $t('setting.textContentMargin') }}</span
          >
          <el-slider
            style="width: 200px; flex-shrink: 0;"
            v-model="config.textContentMargin"
            @change="
              value => {
                updateOtherConfig('textContentMargin', value)
              }
            "
          ></el-slider>
        </div>
      </div>
      <div class="smmSidebarGroupTitle">{{ $t('setting.title2') }}</div>
      <!-- 是否开启文本编辑时实时更新节点大小 -->
      <div class="row">
        <div class="rowItem">
          <el-checkbox
            v-model="config.openRealtimeRenderOnNodeTextEdit"
            @change="
              updateOtherConfig('openRealtimeRenderOnNodeTextEdit', $event)
            "
            >{{ $t('setting.openRealtimeRenderOnNodeTextEdit') }}</el-checkbox
          >
        </div>
      </div>
      <!-- 是否在键盘输入时自动进入节点文本编辑模式 -->
      <div class="row">
        <div class="rowItem">
          <el-checkbox
            v-model="config.enableAutoEnterTextEditWhenKeydown"
            @change="
              updateOtherConfig('enableAutoEnterTextEditWhenKeydown', $event)
            "
            >{{ $t('setting.enableAutoEnterTextEditWhenKeydown') }}</el-checkbox
          >
        </div>
      </div>
      <!-- 配置鼠标滚轮行为 -->
      <div class="row">
        <div class="rowItem">
          <span class="name" :title="$t('setting.mousewheelAction')">{{
            $t('setting.mousewheelAction')
          }}</span>
          <el-select
            size="mini"
            style="width: 120px"
            v-model="config.mousewheelAction"
            placeholder=""
            @change="
              value => {
                updateOtherConfig('mousewheelAction', value)
              }
            "
          >
            <el-option :label="$t('setting.zoomView')" value="zoom"></el-option>
            <el-option
              :label="$t('setting.moveViewUpDown')"
              value="move"
            ></el-option>
          </el-select>
        </div>
      </div>
      <!-- 配置鼠标缩放行为 -->
      <div class="row" v-if="config.mousewheelAction === 'zoom'">
        <div class="rowItem">
          <span
            class="name"
            :title="$t('setting.mousewheelZoomActionReverse')"
            >{{ $t('setting.mousewheelZoomActionReverse') }}</span
          >
          <el-select
            size="mini"
            style="width: 120px"
            v-model="config.mousewheelZoomActionReverse"
            placeholder=""
            @change="
              value => {
                updateOtherConfig('mousewheelZoomActionReverse', value)
              }
            "
          >
            <el-option
              :label="$t('setting.mousewheelZoomActionReverse1')"
              :value="false"
            ></el-option>
            <el-option
              :label="$t('setting.mousewheelZoomActionReverse2')"
              :value="true"
            ></el-option>
          </el-select>
        </div>
      </div>
      <!-- 配置创建新节点时的行为 -->
      <div class="row">
        <div class="rowItem">
          <span class="name" :title="$t('setting.createNewNodeBehavior')">{{
            $t('setting.createNewNodeBehavior')
          }}</span>
          <el-select
            size="mini"
            style="width: 120px"
            v-model="config.createNewNodeBehavior"
            placeholder=""
            @change="
              value => {
                updateOtherConfig('createNewNodeBehavior', value)
              }
            "
          >
            <el-option
              :label="$t('setting.default')"
              value="default"
            ></el-option>
            <el-option
              :label="$t('setting.notActive')"
              value="notActive"
            ></el-option>
            <el-option
              :label="$t('setting.activeOnly')"
              value="activeOnly"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div class="smmSidebarGroupTitle">{{ $t('setting.title3') }}</div>
      <!-- 水印 -->
      <div class="row">
        <!-- 是否显示水印 -->
        <div class="rowItem">
          <el-checkbox
            v-model="watermarkConfig.show"
            @change="watermarkShowChange"
            >{{ $t('setting.showWatermark') }}</el-checkbox
          >
        </div>
      </div>
      <div class="watermarkBox" v-if="watermarkConfig.show">
        <!-- 是否仅在导出时显示 -->
        <div class="row">
          <div class="rowItem">
            <el-checkbox
              v-model="watermarkConfig.onlyExport"
              @change="updateWatermarkConfig"
              >{{ $t('setting.onlyExport') }}</el-checkbox
            >
          </div>
        </div>
        <!-- 是否在节点下方 -->
        <div class="row">
          <div class="rowItem">
            <el-checkbox
              v-model="watermarkConfig.belowNode"
              @change="updateWatermarkConfig"
              >{{ $t('setting.belowNode') }}</el-checkbox
            >
          </div>
        </div>
        <!-- 水印文字 -->
        <div class="row">
          <div class="rowItem">
            <span class="name">{{ $t('setting.watermarkText') }}</span>
            <el-input
              v-model="watermarkConfig.text"
              size="small"
              @change="updateWatermarkConfig"
              @keydown.native.stop
            ></el-input>
          </div>
        </div>
        <!-- 水印文字颜色 -->
        <div class="row">
          <div class="rowItem">
            <span class="name">{{ $t('setting.watermarkTextColor') }}</span>
            <span
              class="block"
              v-popover:popover3
              :style="{ backgroundColor: watermarkConfig.textStyle.color }"
            ></span>
            <el-popover ref="popover3" placement="bottom" trigger="hover">
              <Color
                :color="watermarkConfig.textStyle.color"
                @change="
                  value => {
                    watermarkConfig.textStyle.color = value
                    updateWatermarkConfig()
                  }
                "
              ></Color>
            </el-popover>
          </div>
        </div>
        <!-- 水印文字透明度 -->
        <div class="row">
          <div class="rowItem" style="margin-bottom: 0;">
            <span class="name">{{ $t('setting.watermarkTextOpacity') }}</span>
            <el-slider
              v-model="watermarkConfig.textStyle.opacity"
              style="width: 230px"
              :min="0"
              :max="1"
              :step="0.1"
              @change="updateWatermarkConfig"
            ></el-slider>
          </div>
        </div>
        <!-- 水印文字字号 -->
        <div class="row">
          <div class="rowItem">
            <span class="name">{{ $t('setting.watermarkTextFontSize') }}</span>
            <el-input-number
              v-model="watermarkConfig.textStyle.fontSize"
              size="small"
              :min="0"
              :max="50"
              :step="1"
              @change="updateWatermarkConfig"
              @keydown.native.stop
            ></el-input-number>
          </div>
        </div>
        <!-- 旋转角度 -->
        <div class="row">
          <div class="rowItem">
            <span class="name">{{ $t('setting.watermarkAngle') }}</span>
            <el-input-number
              v-model="watermarkConfig.angle"
              size="small"
              :min="0"
              :max="90"
              :step="10"
              @change="updateWatermarkConfig"
              @keydown.native.stop
            ></el-input-number>
          </div>
        </div>
        <!-- 水印行间距 -->
        <div class="row">
          <div class="rowItem">
            <span class="name">{{ $t('setting.watermarkLineSpacing') }}</span>
            <el-input-number
              v-model="watermarkConfig.lineSpacing"
              size="small"
              :step="10"
              @change="updateWatermarkConfig"
              @keydown.native.stop
            ></el-input-number>
          </div>
        </div>
        <!-- 水印文字间距 -->
        <div class="row" style="margin-bottom: 0;">
          <div class="rowItem" style="margin-bottom: 0;">
            <span class="name">{{ $t('setting.watermarkTextSpacing') }}</span>
            <el-input-number
              v-model="watermarkConfig.textSpacing"
              size="small"
              :step="10"
              @change="updateWatermarkConfig"
              @keydown.native.stop
            ></el-input-number>
          </div>
        </div>
      </div>
      <!-- 是否显示滚动条 -->
      <div class="row">
        <div class="rowItem">
          <el-checkbox
            v-model="localConfigs.isShowScrollbar"
            @change="updateLocalConfig('isShowScrollbar', $event)"
            >{{ $t('setting.isShowScrollbar') }}</el-checkbox
          >
        </div>
      </div>
      <!-- 是否显示底部工具栏 -->
      <div class="row">
        <div class="rowItem">
          <el-checkbox
            v-model="localConfigs.isShowBottomToolbar"
            @change="updateLocalConfig('isShowBottomToolbar', $event)"
            >{{ $t('setting.isShowBottomToolbar') }}</el-checkbox
          >
        </div>
      </div>
      <div class="smmSidebarGroupTitle">{{ $t('setting.title4') }}</div>
      <!-- 配置性能模式 -->
      <div class="row">
        <div class="rowItem">
          <el-checkbox
            v-model="config.openPerformance"
            @change="
              value => {
                updateOtherConfig('openPerformance', value)
              }
            "
            >{{ $t('setting.openPerformance') }}</el-checkbox
          >
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script>
import Sidebar from './Sidebar.vue'
import { mapState, mapMutations } from 'vuex'
import Color from './Color.vue'
import ConfigImportOutputDropdown from './ConfigImportOutputDropdown.vue'

export default {
  components: {
    Sidebar,
    Color,
    ConfigImportOutputDropdown
  },
  props: {
    configData: {
      type: Object,
      default: null
    },
    mindMap: {
      type: Object
    }
  },
  data() {
    return {
      config: {
        openPerformance: false,
        enableFreeDrag: false,
        mousewheelAction: 'zoom',
        mousewheelZoomActionReverse: false,
        createNewNodeBehavior: 'default',
        openRealtimeRenderOnNodeTextEdit: false,
        alwaysShowExpandBtn: false,
        nodeInitialAutoAlignWidth: 200,
        enableAutoEnterTextEditWhenKeydown: true,
        imgTextMargin: 0,
        textContentMargin: 0,
        enableInheritAncestorLineStyle: false,
        rootEnableUnExpand: false
      },
      watermarkConfig: {
        show: false,
        onlyExport: false,
        text: '',
        lineSpacing: 100,
        textSpacing: 100,
        angle: 30,
        textStyle: {
          color: '',
          opacity: 0,
          fontSize: 1
        }
      },
      updateWatermarkTimer: null,
      localConfigs: {
        isShowScrollbar: false,
        isShowBottomToolbar: true
      }
    }
  },
  computed: {
    ...mapState({
      activeSidebar: state => state.activeSidebar,
      localConfig: state => state.localConfig,
      isDark: state => state.localConfig.isDark
    })
  },
  watch: {
    activeSidebar(val) {
      if (val === 'setting') {
        this.$refs.sidebar.show = true
        this.initConfig()
        this.initWatermark()
      } else {
        this.$refs.sidebar.show = false
      }
    }
  },
  created() {
    this.initLoacalConfig()
  },
  methods: {
    ...mapMutations(['setLocalConfig']),

    // 初始化其他配置
    initConfig() {
      Object.keys(this.config).forEach(key => {
        if (typeof this.config[key] === 'object') {
          this.config[key] = {
            ...(this.mindMap.getConfig(key) || {})
          }
        } else {
          this.config[key] = this.mindMap.getConfig(key)
        }
      })
    },

    // 初始化本地配置
    initLoacalConfig() {
      Object.keys(this.localConfigs).forEach(key => {
        this.localConfigs[key] = this.localConfig[key]
      })
    },

    // 初始化水印配置
    initWatermark() {
      const config = this.mindMap.getConfig('watermarkConfig')
      ;['text', 'lineSpacing', 'textSpacing', 'angle', 'onlyExport'].forEach(
        key => {
          this.watermarkConfig[key] = config[key]
        }
      )
      this.watermarkConfig.show = !!config.text
      this.watermarkConfig.textStyle = { ...config.textStyle }
    },

    // 更新其他配置
    updateOtherConfig(key, value) {
      this.mindMap.updateConfig({
        [key]: value
      })
      this.configData[key] = value
      this.$root.$obsidianAPI.saveMindMapConfig(this.configData)
      if (
        [
          'alwaysShowExpandBtn',
          'imgTextMargin',
          'textContentMargin',
          'enableInheritAncestorLineStyle'
        ].includes(key)
      ) {
        this.mindMap.reRender()
      }
    },

    // 更新水印配置
    updateWatermarkConfig() {
      clearTimeout(this.updateWatermarkTimer)
      this.updateWatermarkTimer = setTimeout(() => {
        let { show, ...config } = this.watermarkConfig
        this.mindMap.watermark.updateWatermark({
          ...config
        })
        this.configData.watermarkConfig = this.mindMap.getConfig(
          'watermarkConfig'
        )
        this.$root.$obsidianAPI.saveMindMapConfig(this.configData)
      }, 300)
    },

    // 切换显示水印与否
    watermarkShowChange(value) {
      if (value) {
        let text =
          this.watermarkConfig.text || this.$t('setting.watermarkDefaultText')
        this.watermarkConfig.text = text
      } else {
        this.watermarkConfig.text = ''
      }
      this.updateWatermarkConfig()
    },

    // 本地配置
    updateLocalConfig(key, value) {
      this.setLocalConfig({
        [key]: value
      })
    },

    // 导出配置
    getOutputConfig() {
      return {
        localConfig: this.localConfigs || {},
        config: this.configData || {}
      }
    },

    // 导入配置
    setConfig({ localConfig, config }) {
      Object.keys(localConfig).forEach(key => {
        const value = localConfig[key]
        this.localConfigs[key] = value
        this.updateLocalConfig(key, value)
      })
      Object.keys(config).forEach(key => {
        const value = config[key]
        if (key === 'watermarkConfig') {
          Object.keys(value).forEach(key2 => {
            this.watermarkConfig[key2] = value[key2]
          })
          this.watermarkConfig.show = !!value.text
          this.updateWatermarkConfig()
        } else {
          this.config[key] = value
          this.updateOtherConfig(key, value)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.settingContent {
  &.isDark {
  }

  .row {
    .rowItem {
      .name {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
  }

  .watermarkBox {
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    padding: 12px 8px;
    margin-bottom: 12px;
  }
}
</style>
