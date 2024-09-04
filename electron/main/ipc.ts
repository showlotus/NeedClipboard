import { globalShortcut, ipcMain } from 'electron'

import { SettingsStore } from './store'

ipcMain.handle('shortcut-is-registered', (_event, key: string) => {
  return Promise.resolve(globalShortcut.isRegistered(key))
})

ipcMain.handle('update-shortcut', (_event, key: string) => {
  SettingsStore.set('shortcutKey', key)
})

ipcMain.handle('update-settings', (_event, val: Record<string, any>) => {
  SettingsStore.set(val)
})
