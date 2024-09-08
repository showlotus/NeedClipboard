import { globalShortcut, ipcMain, nativeTheme } from 'electron'

import { getWinWebContents, toggleWindowVisible } from '.'
import { SettingsStore, store } from './store'

ipcMain.handle('toggle-visible', () => {
  toggleWindowVisible()
})

ipcMain.handle('update-setting', (event, key: string, val: any) => {
  SettingsStore.set(key, val)
  // 通知渲染进程更新设置
  getWinWebContents().send('refresh-settings', SettingsStore.store)
})

ipcMain.handle('shortcut-is-registered', (event, key: string) => {
  return Promise.resolve(globalShortcut.isRegistered(key))
})

ipcMain.handle('update-shortcut', (event, key: string) => {
  SettingsStore.set('shortcutKey', key)
})

ipcMain.handle('close-trigger-shortcut', () => {
  store.shouldTriggerShortcut = false
})

ipcMain.handle('open-trigger-shortcut', () => {
  store.shouldTriggerShortcut = true
})

ipcMain.handle('set-theme', (event, theme) => {
  SettingsStore.set('theme', theme)
  nativeTheme.themeSource = theme
})

ipcMain.handle('get-theme', (_event) => {
  const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  return Promise.resolve(theme)
})
