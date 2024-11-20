import {
  BrowserWindow,
  app,
  ipcMain,
  nativeTheme,
  screen,
  shell
} from 'electron'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  NativeClipboard,
  getCurrActiveWindowHandle,
  updateCurrActiveWindowHandle
} from './clipboard'
import './clipboard'
import './ipc'
import { SettingsStore, registerShortcut } from './store'
import { initTray } from './tray'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

// TODO 获取当前活动应用，监听当前活动应用是否更新，通知视图层更新
ipcMain.handle('get-active-app', (_event) => {
  return Promise.resolve('Google Chrome')
})

export function getWinWebContents() {
  return win?.webContents
}

// 更新当前 Active App
function updateActiveApp() {
  const handle = NativeClipboard.getCurrentWindowHandle()
  const appName = NativeClipboard.getAppNameByHandle(handle)
  updateCurrActiveWindowHandle(handle)
  win.webContents.send('update-active-app', appName)
}

// 激活来源窗口
function activateSourceWindow() {
  const handle = getCurrActiveWindowHandle()
  if (handle) {
    console.log('Activate window')
    NativeClipboard.activateWindowByHandle(handle)
  }
}

export function toggleWindowVisible() {
  if (!win) {
    // createWindow()
    return
  }

  if (win.isVisible()) {
    win.blur()
  } else {
    updateActiveApp()
    win.show()
  }
}

async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  console.log(width, height)
  const winWidth = width * 0.4
  const winHeight = height * 1
  const IS_DEV = false
  const wh =
    VITE_DEV_SERVER_URL && IS_DEV
      ? { width: winWidth, height: winHeight }
      : { width: width * 0.4, height: height * 0.5 }
  win = new BrowserWindow({
    title: 'Main window',
    ...wh,
    // icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
      // 禁用拼写检查
      spellcheck: false,
      // 窗口未可见时，也开启更新
      backgroundThrottling: false
    },
    // transparent: true,
    // TODO publish 时需要隐藏标题栏
    // titleBarStyle: 'hidden',
    // 无边框窗口，隐藏标题和菜单栏
    frame: false
    // 设置高斯模糊
    // 会导致打开窗口时有闪烁问题
    // backgroundMaterial: 'mica' // mica acrylic
  })

  // TEST 靠右显示
  // win.setPosition(width - winWidth, 0)

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
  win.setSkipTaskbar(true)

  // 窗口失焦时，隐藏窗口
  win.on('blur', () => {
    win.hide()
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
    console.log('hide')
    activateSourceWindow()
    win.webContents.send('hide-win')
  })

  // TODO 开机启动时隐藏窗口
  // TODO 打包时，改为 once
  const eventType = VITE_DEV_SERVER_URL ? 'on' : 'once'
  win[eventType]('ready-to-show', () => {
    console.log(process.argv.includes('--openAsHidden'))
    if (!process.argv.includes('--openAsHidden')) {
      updateActiveApp()
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
  NativeClipboard.unwatch()
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
