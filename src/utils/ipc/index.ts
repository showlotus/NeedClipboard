import { Setting } from '@/stores/main'

export function ipcGetActiveApp() {
  return window.ipcRenderer.invoke('get-active-app')
}

export function ipcOnUpdateActiveApp(callback: (...args: any[]) => void) {
  window.ipcRenderer.on('update-active-app', callback)
}

export function ipcValidateShortcutIsRegistered(val: string) {
  return window.ipcRenderer.invoke('shortcut-is-registered', val)
}

export function ipcUpdateActiveShortcut(val: string) {
  return window.ipcRenderer.invoke('update-shortcut', val)
}

export function ipcUpdateSetting(key: keyof Setting, val: any) {
  window.ipcRenderer.invoke('update-setting', key, val)
}

export function ipcToggleVisible() {
  window.ipcRenderer.invoke('toggle-visible')
}

export function ipcInitSettings() {
  window.ipcRenderer.invoke('init-settings')
}

export function ipcOnRefreshSettings(callback: (...args: any[]) => void) {
  window.ipcRenderer.on('refresh-settings', callback)
}

export function ipcGetTheme() {
  return window.ipcRenderer.invoke('get-theme')
}

export function ipcCloseTriggerShortcut() {
  window.ipcRenderer.invoke('close-trigger-shortcut')
}

export function ipcOpenTriggerShortcut() {
  window.ipcRenderer.invoke('open-trigger-shortcut')
}
