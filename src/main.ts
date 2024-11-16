import dayjs from 'dayjs'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/el-message.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import { DATE_TEMPLATE } from './constants/date'
import { TextDataType, createDatabase } from './database'
import { InsertDataType, fetchInsert, fetchIsExistInDB } from './database/api'
import './demos/ipc'
import { calculateBase64Size, genMockData } from './hooks/useSearch'
import i18nConfig from './i18n'
import './style/style.css'
import './style/theme.css'
import { ipcGetAppIcon, ipcOnUpdateClipboard } from './utils/ipc'
import { isLink } from './utils/isLink'
import { isValidColorString } from './utils/isValidColorString'

// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

// hotkeys.unbind()
setTimeout(() => {
  const db = createDatabase()
})
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
  const icon = await ipcGetAppIcon(source)
  const res = {
    application: {
      name: app,
      icon
    },
    createTime: dayjs().format(DATE_TEMPLATE)
  } as any
  if (type === 'TEXT') {
    if (isValidColorString(data)) {
      res.type = 'Color'
    } else if (isLink(data)) {
      res.type = 'Link'
    } else {
      res.type = 'Text'
    }
    res.characters = data.length
    res.content = data
  } else if (type === 'IMAGE') {
    res.type = 'Image'
    res.size = calculateBase64Size(data.url)
    Object.assign(res, data)
  } else if (type === 'FILE') {
  }
  console.log(type, data, source, app)
  if (res && !(await fetchIsExistInDB(res))) {
    fetchInsert(res)
  }
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
