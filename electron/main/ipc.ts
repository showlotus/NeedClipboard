import { globalShortcut, ipcMain } from 'electron'

import { getWinWebContents, toggleWindowVisible } from '.'
import { SettingsStore } from './store'

ipcMain.handle('shortcut-is-registered', (_event, key: string) => {
  return Promise.resolve(globalShortcut.isRegistered(key))
})

ipcMain.handle('update-shortcut', (_event, key: string) => {
  SettingsStore.set('shortcutKey', key)
})

ipcMain.handle('update-setting', (_event, key: string, val: any) => {
  SettingsStore.set(key, val)
  // 通知渲染进程更新设置
  getWinWebContents().send('refresh-settings', SettingsStore.store)
})

ipcMain.handle('toggle-visible', () => {
  toggleWindowVisible()
})
