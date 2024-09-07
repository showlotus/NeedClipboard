import {
  BrowserWindow,
  Menu,
  Tray,
  app,
  clipboard,
  globalShortcut,
  ipcMain,
  nativeImage,
  nativeTheme,
  screen,
  shell,
  webContents
} from 'electron'
import ElectronStore from 'electron-store'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import './ipc'
import { SettingsStore } from './store'
import { initTray } from './tray'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// const NativeClipboard = require('../../packages/native-clipboard')
// in mac development
const NativeClipboard = {
  startWatching(callback: () => void) {
    callback()
  },
  getClipboardType() {
    return [] as any
  },
  writeFilesToClipboard(..._args: any[]) {},
  stopWatching() {}
}
console.log(NativeClipboard)

// TODO 监听剪贴板变化，更新 Store，通知 View 更新
NativeClipboard.startWatching(() => {
  // TODO 检测与上一次剪贴板内容的区别
  const [type, path] = NativeClipboard.getClipboardType()
  const data = { type } as any
  if (type === 'File') {
    data.path = path
  } else if (type === 'Image') {
    const img = clipboard.readImage()
    data.size = img.getSize()
    data.bitmap = img.toBitmap()
    data.png = img.toPNG()
    data.jpg = img.toJPEG(100)
    data.miniUrl = img.resize({ height: 28, quality: 'good' }).toDataURL()
    data.url = img.toDataURL()
  } else if (type === 'Text') {
    data.content = clipboard.readText()
  }
  // win?.webContents.send('clipboard-change', data)
})

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

process.argv.push('--openAsHidden')

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

// TODO 设置开机自启
if (app.isPackaged) {
  app.setLoginItemSettings({
    openAtLogin: true,
    args: ['--openAsHidden']
  })
}

if (app.isPackaged) {
  const { openAtLogin } = app.getLoginItemSettings({
    args: ['--openAsHidden']
  })
  console.log('openAtLogin', openAtLogin, process.argv)
}

// const SettingsStore = new ElectronStore({
//   name: 'settings'
// })
// TODO 配置为空时，设置默认值
// if (!SettingsStore.get('shortcutKey')) {
//   SettingsStore.set('shortcutKey', 'Alt V')
// }
// if (!SettingsStore.get('theme')) {
//   SettingsStore.set('theme', 'system')
// }

// SettingsStore.onDidChange('shortcutKey', (newVal, oldVal) => {
//   console.log('shortcutKey changed', newVal, oldVal)
// })
// SettingsStore.onDidChange('theme', (newVal, oldVal) => {
//   // nativeTheme.themeSource = newVal
//   console.log('theme changed', newVal, oldVal)
// })

ipcMain.handle('update-clipboard-file', (_event, files) => {
  NativeClipboard.writeFilesToClipboard(files)
})
ipcMain.handle('update-clipboard-image', (_event, image) => {
  // const img = nativeImage.createFromDataURL(image)

  const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
  const imageBuffer = Buffer.from(base64Data, 'base64')
  // const tempFilePath = path.join(__dirname, 'temp_image.png')
  // fs.writeFileSync(tempFilePath, imageBuffer)
  const img = nativeImage.createFromBuffer(imageBuffer)
  clipboard.writeImage(img)
})
ipcMain.handle('update-clipboard-image-buffer', (_event, data) => {
  const img = nativeImage.createFromBuffer(data.image.jpg)
  clipboard.writeImage(img)
})
ipcMain.handle('update-clipboard-image-url', (_event, data) => {
  console.log(data.image.url.length)
  const img = nativeImage.createFromDataURL(data.image.url)
  clipboard.writeImage(img)
})
ipcMain.handle('update-clipboard-text', (_event, text) => {
  clipboard.writeText(text)
})

// 修改全局快捷键
// ipcMain.handle('update-shortcut', (_event, key) => {
//   console.log(key)
//   // 判断快捷键是否冲突
//   const keys = key.split(' ').join('+')
//   if (globalShortcut.isRegistered(keys)) {
//     return Promise.resolve(false)
//   }
//   SettingsStore.set('shortcutKey', key)
//   registerShortcut()
//   return Promise.resolve(true)
// })
ipcMain.handle('unregister-all-shortcut', (_event) => {
  unregisterShortcut()
})
ipcMain.handle('register-all-shortcut', (_event) => {
  registerShortcut()
})

// TODO 获取当前活动应用，监听当前活动应用是否更新，通知视图层更新
ipcMain.handle('get-active-app', (_event) => {
  return Promise.resolve('Google Chrome')
})

export function getWinWebContents() {
  return win?.webContents
}

export function toggleWindowVisible() {
  if (!win) {
    createWindow()
    return
  }

  if (win.isVisible()) {
    win.hide()
  } else {
    win.show()
  }
}

// 注册快捷键
function registerShortcut() {
  // registerEsc()
  const key = SettingsStore.get('shortcutKey').replace(/\s/g, '+')
  console.log('registerShortcut', key)
  // 注册快捷键激活/隐藏窗口
  globalShortcut.register(key, () => toggleWindowVisible())
}
// 失效快捷键
function unregisterShortcut() {
  globalShortcut.unregisterAll()
}
// TODO 暂时不处理 Esc 键
function registerEsc() {
  if (globalShortcut.isRegistered('Esc')) {
    return
  }
  console.log('register Esc')
  globalShortcut.register('Esc', () => {
    win.hide()
  })
}

async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  console.log(width, height)
  const winWidth = width * 0.4
  const winHeight = height * 1
  win = new BrowserWindow({
    title: 'Main window',
    // width: width * 0.4,
    // height: height * 0.5,
    width: winWidth,
    height: winHeight,
    // icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
      // 禁用拼写检查
      spellcheck: false
    },
    // transparent: true,
    // TODO publish 时需要隐藏标题栏
    // titleBarStyle: 'hidden',
    // 无边框窗口，隐藏标题和菜单栏
    frame: false
    // 设置高斯模糊
    // TODO 会导致打开窗口时有闪烁问题
    // backgroundMaterial: 'mica' // mica acrylic
  })

  // TEST 靠右显示
  win.setPosition(width - winWidth, 0)

  // 隐藏菜单栏
  // Menu.setApplicationMenu(null)
  // for mac
  // Menu.setApplicationMenu(Menu.buildFromTemplate([]))

  // 禁用手动最大化
  win.setMaximizable(false)
  win.setMinimizable(false)
  // win.setMovable(false)
  // 禁用手动调整窗口大小
  win.setResizable(false)
  // TODO 不在任务栏中显示
  // win.setSkipTaskbar(true)

  // TODO 窗口失焦时，隐藏窗口
  win.on('blur', () => {
    // win.hide()
  })

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  win.webContents.on('before-input-event', (event, input) => {
    if (input.alt && input.code === 'F4') {
      event.preventDefault()
    }
    // win.webContents.setIgnoreMenuShortcuts(true)
    // console.log('before-input-event', input.alt, input.key, input.code)
  })

  const language = SettingsStore.get('language')
  const isZh = language === 'zh_CN'
  const updateLanguage = (language: 'zh_CN' | 'en_US') => {
    SettingsStore.set('language', language)
    win.webContents.send('change-language', language)
  }
  // 注册获取当前语言的事件，用于初始化语言
  ipcMain.handleOnce('get-language', () => {
    return Promise.resolve(SettingsStore.get('language'))
  })
  ipcMain.handle('set-language', (_event, language) => {
    updateLanguage(language)
  })
  ipcMain.handle('set-theme', (_event, theme) => {
    SettingsStore.set('theme', theme)
    nativeTheme.themeSource = theme
  })
  ipcMain.handle('get-theme', (_event) => {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    return Promise.resolve(theme)
  })
  nativeTheme.themeSource = SettingsStore.get('theme')
  // win.webContents.send('update-theme', SettingsStore.get('theme'))
  initTray()

  // 刷新配置

  registerShortcut()
  win.on('show', () => {
    win.webContents.send('render')
    // registerEsc()
  })
  win.on('hide', () => {
    // if (globalShortcut.isRegistered('Esc')) {
    //   console.log('unregister Esc')
    //   globalShortcut.unregister('Esc')
    // }
  })
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('refresh-settings', SettingsStore.store)
    console.log('finish loaded')
  })

  // TODO 开机启动时隐藏窗口
  win.once('ready-to-show', () => {
    console.log(process.argv.includes('--openAsHidden'))
    if (!process.argv.includes('--openAsHidden')) {
      win.show()
    }
  })

  console.log(app.getPath('userData'))

  return win
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  // TODO 关闭剪贴板监听
  NativeClipboard.stopWatching()
  console.log('before quit')
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
