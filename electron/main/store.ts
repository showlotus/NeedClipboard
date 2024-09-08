import { globalShortcut } from 'electron'
import ElectronStore from 'electron-store'

import { toggleWindowVisible } from '.'

export const SettingsStore = new ElectronStore({
  name: 'settings',
  defaults: {
    shortcutKey: 'Alt V',
    theme: 'system',
    primaryAction: 'app',
    language: 'en_US',
    startup: true,
    keepDays: 7
  }
})

export const store = {
  shouldTriggerShortcut: true
}

export function registerShortcut(key: string) {
  const accelerator = key.replace(/\s/g, '+')
  globalShortcut.register(accelerator, () => {
    store.shouldTriggerShortcut && toggleWindowVisible()
  })
}

SettingsStore.onDidChange('shortcutKey', (val) => {
  globalShortcut.unregisterAll()
  registerShortcut(val)
})
