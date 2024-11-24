import { BrowserWindow, Menu, Tray, app } from 'electron'
import path from 'node:path'
import { startup } from 'vite-plugin-electron'

import { toggleWindowVisible } from '.'
import pkg from '../../package.json'
import { SettingsStore } from './store'

export let tray: Tray | null

export function initTray() {
  // TODO 托盘图标替换
  tray = new Tray(path.join(process.env.VITE_PUBLIC, 'tray-dark@256x256.png'))
  tray.setToolTip(pkg.name + ' ' + pkg.version)

  const updateMenu = () => {
    // const startup = SettingsStore.get('startup')
    const shortcutKey = SettingsStore.get('shortcutKey').replace(/\s/g, '+')
    tray.setContextMenu(genMenu(shortcutKey))
  }
  updateMenu()
  SettingsStore.onDidChange('shortcutKey', updateMenu)
  // SettingsStore.onDidChange('startup', updateMenu)
}

function genMenu(shortcutAccelerator: string) {
  return Menu.buildFromTemplate([
    // {
    //   label: '开机启动',
    //   type: 'checkbox',
    //   checked: startup,
    //   click(e) {
    //     // 设置开机自启
    //     app.setLoginItemSettings({
    //       openAtLogin: e.checked,
    //       args: ['--openAsHidden']
    //     })
    //     SettingsStore.set('startup', e.checked)
    //   }
    // },
    // { label: '', type: 'separator' },
    {
      label: '打开面板',
      type: 'normal',
      accelerator: shortcutAccelerator,
      click() {
        toggleWindowVisible()
      }
    },
    { label: '', type: 'separator' },
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
