import 'vue-i18n'
import { ComponentCustomProperties } from 'vue'

// 声明 vue 模块扩展
declare module '@vue/runtime-core' {
  // 为 Vue 组件实例扩展类型
  interface ComponentCustomProperties {
    $t: typeof import('vue-i18n').t
  }
}
