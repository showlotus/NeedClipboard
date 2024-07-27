import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import i18nConfig from './i18n'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style/style.css'
import './style/theme.css'

import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

const i18n = createI18n({
  legacy: false,
  locale: 'zh_CN',
  messages: i18nConfig
})

createApp(App)
  .use(i18n)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
