import { app, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

autoUpdater.on('checking-for-update', () => {})
autoUpdater.on('update-available', () => {
  autoUpdater.downloadUpdate()
})
autoUpdater.on('update-not-available', () => {})
autoUpdater.on('update-downloaded', () => {
  dialog
    .showMessageBox({
      title: '',
      type: 'info',
      message: 'Update download complete, whether to install now',
      buttons: ['Yes', 'No']
    })
    .then((res) => {
      if (res.response === 0) {
        autoUpdater.quitAndInstall()
        app.quit()
      }
    })
})
autoUpdater.on('error', () => {})

export function checkUpdate() {
  autoUpdater.checkForUpdates()
}
