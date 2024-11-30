import { app, dialog } from 'electron'
import log from 'electron-log/main'
import { autoUpdater } from 'electron-updater'

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

log.initialize()
log.transports.console.format = '[{h}:{i}:{s}] {text}'

autoUpdater.on('checking-for-update', () => {
  log.info('checking for update')
})
autoUpdater.on('update-available', async () => {
  log.info('download process:', await autoUpdater.downloadUpdate())
})
autoUpdater.on('update-not-available', () => {
  log.info('not update available')
})
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
        log.info('quit and install')
        autoUpdater.quitAndInstall()
        app.quit()
      }
    })
})
autoUpdater.on('error', (e) => {
  log.error('update error', e)
})

export function checkUpdate() {
  autoUpdater.checkForUpdates()
}
