import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/el-message.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import { createDatabase } from './database'
import { fetchInsert } from './database/api'
import './demos/ipc'
import { genMockData } from './hooks/useSearch'
import i18nConfig from './i18n'
import './style/style.css'
import './style/theme.css'

// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

// hotkeys.unbind()
const db = createDatabase()
db.ClipboardTable.clear()
// TEST local dev
Promise.all(genMockData(20)).then((res) => {
  console.log(res)
  res.forEach((v) => {
    delete v.id
    fetchInsert(v)
  })
  console.log('database init...')
})

const pinia = createPinia()
const i18n = createI18n({
  legacy: false,
  locale: 'zh_CN',
  messages: i18nConfig
})
const app = createApp(App)

app
  .use(pinia)
  .use(i18n)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
