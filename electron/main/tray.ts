import { BrowserWindow, Menu, Tray, app } from 'electron'
import path from 'node:path'

import pkg from '../../package.json'
import { SettingsStore } from './store'

export let tray: Tray | null

export function initTray(win: BrowserWindow) {
  // TODO 托盘图标替换
  tray = new Tray(path.join(process.env.VITE_PUBLIC, 'icon/png/logo.png'))
  console.log(SettingsStore.get('shortcutKey'))

  tray.on('click', () => {
    !win.isVisible() && win.show()
  })
  tray.setToolTip(pkg.name)

  const updateMenu = () => {
    const startup = SettingsStore.get('startup')
    const shortcutKey = SettingsStore.get('shortcutKey').replace(/\s/g, '+')
    tray.setContextMenu(genMenu(startup, shortcutKey))
  }
  updateMenu()
  SettingsStore.onDidChange('shortcutKey', updateMenu)
  SettingsStore.onDidChange('startup', updateMenu)
}

function genMenu(startup: boolean, shortcutAccelerator: string) {
  console.log('shortcutAccelerator', shortcutAccelerator)
  return Menu.buildFromTemplate([
    {
      label: '开机启动',
      type: 'checkbox',
      checked: startup,
      click(e) {
        // 设置开机自启
        app.setLoginItemSettings({
          openAtLogin: e.checked,
          args: ['--openAsHidden']
        })
        SettingsStore.set('startup', e.checked)
      }
    },
    { label: '', type: 'separator' },
    {
      label: '打开',
      type: 'normal',
      accelerator: shortcutAccelerator
    },
    {
      label: '检查更新',
      type: 'normal',
      click() {
        // TODO 检查更新
        console.log('检查更新')
      }
    },
    {
      label: '退出',
      type: 'normal',
      role: 'quit'
    }
  ])
}
