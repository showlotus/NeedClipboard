import dayjs from 'dayjs'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/el-message.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import { DATE_TEMPLATE } from './constants/date'
import { TextDataType, createDatabase } from './database'
import { InsertDataType, fetchInsert } from './database/api'
import './demos/ipc'
import { genMockData } from './hooks/useSearch'
import i18nConfig from './i18n'
import './style/style.css'
import './style/theme.css'
import { ipcGetAppIcon, ipcOnUpdateClipboard } from './utils/ipc'

// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

// hotkeys.unbind()
const db = createDatabase()
// db.ClipboardTable.clear()
// TEST local dev
// Promise.all(genMockData(20)).then((res) => {
//   console.log(res)
//   res.forEach((v) => {
//     delete v.id
//     fetchInsert(v)
//   })
//   console.log('database init...')
// })

ipcOnUpdateClipboard(async (_, { type, data, source, app }) => {
  let res
  const icon = await ipcGetAppIcon(source)
  if (type === 'TEXT') {
    res = {
      type: 'Text',
      application: {
        name: app,
        icon
      },
      characters: data.length,
      content: data,
      createTime: dayjs().format(DATE_TEMPLATE)
    } as TextDataType
  } else if (type === 'IMAGE') {
  } else if (type === 'FILE') {
  }
  console.log(type, data, source, app)
  res && fetchInsert(res)
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
  // .use(db)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
