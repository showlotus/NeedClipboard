import { globalShortcut, ipcMain, nativeTheme } from 'electron'
import { createRequire } from 'node:module'

import { getWinWebContents, toggleWindowVisible } from '.'
import {
  NativeClipboard,
  pastActiveApp,
  updateShouldUpdateHistory,
  writeClipboard
} from './clipboard'
import { SettingsStore, store } from './store'

const getFileIcon = createRequire(import.meta.url)(
  '../../packages/extract-file-icon'
)

ipcMain.handle('toggle-visible', () => {
  toggleWindowVisible()
})

// TODO in production mode need use handleOnce
ipcMain.handle('init-settings', () => {
  getWinWebContents().send('refresh-settings', SettingsStore.store)
})

ipcMain.handle('update-setting', (event, key: string, val: any) => {
  SettingsStore.set(key, val)
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

ipcMain.handle('get-app-icon', (_event, path: string) => {
  const base64Str =
    'data:image/png;base64,' + getFileIcon(path, 16).toString('base64')
  return Promise.resolve(base64Str)
})

ipcMain.handle('copy-to-clipboard', (_event, data: any) => {
  writeClipboard(data)
})

ipcMain.handle('past-to-active-app', (_event, data: any) => {
  pastActiveApp(data)
})
