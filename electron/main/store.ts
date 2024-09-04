import ElectronStore from 'electron-store'

export const SettingsStore = new ElectronStore({
  name: 'settings',
  defaults: {
    shortcutKey: 'Alt V',
    theme: 'system',
    primaryAction: 'app',
    language: 'en_US',
    startup: false,
    keepDays: 7
  }
})
