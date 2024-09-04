import { Setting } from '@/stores/main'

export function getActiveApp() {
  return window.ipcRenderer.invoke('get-active-app')
}

export function validateShortcutIsRegistered(val: string) {
  return window.ipcRenderer.invoke('shortcut-is-registered', val)
}

export function updateActiveShortcut(val: string) {
  return window.ipcRenderer.invoke('update-shortcut', val)
}

export function updateSettings(val: Setting) {
  window.ipcRenderer.invoke('update-settings', val)
}
