import {
  BrowserWindow,
  app,
  clipboard,
  ipcMain,
  nativeImage,
  nativeTheme,
  screen,
  shell
} from 'electron'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import './ipc'
import { SettingsStore, registerShortcut } from './store'
import { initTray } from './tray'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// console.log('data:image/png;base64,' + fileIcon('C:\\Users\\showlotus\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', 32).toString('base64'))
// console.log('data:image/png;base64,' + fileIcon('C:\\Program Files\\Clash Verge\\Clash Verge.exe', 32).toString('base64'))

const NativeClipboard = require('../../packages/native-clipboard')

console.log(NativeClipboard)

NativeClipboard.watch((type, data, source, app) => {
  console.log('clipboard changed!')
  console.log(type, data, source, app)
})

// TODO 监听剪贴板变化，更新 Store，通知 View 更新
// NativeClipboard.startWatching(() => {
//   // TODO 检测与上一次剪贴板内容的区别
//   const [type, path] = NativeClipboard.getClipboardType()
//   const data = { type } as any
//   if (type === 'File') {
//     data.path = path
//   } else if (type === 'Image') {
//     const img = clipboard.readImage()
//     data.size = img.getSize()
//     data.bitmap = img.toBitmap()
//     data.png = img.toPNG()
//     data.jpg = img.toJPEG(100)
//     data.miniUrl = img.resize({ height: 28, quality: 'good' }).toDataURL()
//     data.url = img.toDataURL()
//   } else if (type === 'Text') {
//     data.content = clipboard.readText()
//   }
//   // win?.webContents.send('clipboard-change', data)
// })

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
    win.webContents.send('before-hide-win')
    Promise.resolve().then(() => {
      win.hide()
    })
  } else {
    win.show()
  }
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
  })
  nativeTheme.themeSource = SettingsStore.get('theme') as any
  initTray()

  registerShortcut(SettingsStore.get('shortcutKey'))

  win.on('show', () => {
    win.webContents.send('show-win')
  })
  win.on('hide', () => {
    win.webContents.send('hide-win')
  })
  // TODO 模拟当前 Active App 发生改变
  // setInterval(() => {
  //   win.webContents.send(
  //     'update-active-app',
  //     btoa(String(Date.now() % 10000))
  //       .slice(0, 6)
  //       .toUpperCase()
  //   )
  // }, 5000)

  // TODO 开机启动时隐藏窗口
  // TODO 打包时，改为 once
  const eventType = VITE_DEV_SERVER_URL ? 'on' : 'once'
  win[eventType]('ready-to-show', () => {
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
