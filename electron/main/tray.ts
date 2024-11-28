import { Menu, Tray, nativeTheme } from 'electron'
import path from 'node:path'

import { toggleWindowVisible } from '.'
import pkg from '../../package.json'
import { SettingsStore } from './store'

export let tray: Tray | null

export function initTray() {
  let currIconTheme: 'light' | 'dark' = 'light'
  const updateIcon = () => {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    if (theme === currIconTheme) return
    currIconTheme = theme
    tray?.setImage(getTrayIcon(theme))
  }
  nativeTheme.on('updated', updateIcon)
  updateIcon()

  tray = new Tray(getTrayIcon(currIconTheme))
  tray.setToolTip(pkg.name + ' ' + pkg.version)

  const updateMenu = () => {
    const shortcutKey = SettingsStore.get('shortcutKey').replace(/\s/g, '+')
    tray.setContextMenu(genMenu(shortcutKey))
  }
  updateMenu()
  SettingsStore.onDidChange('shortcutKey', updateMenu)
}

function getTrayIcon(theme: 'light' | 'dark') {
  const size = 48
  const darkIcon = path.join(
    process.env.VITE_PUBLIC,
    `icon/tray/dark/icon@${size}x${size}.png`
  )
  const lightIcon = path.join(
    process.env.VITE_PUBLIC,
    `icon/tray/light/icon@${size}x${size}.png`
  )
  return theme === 'light' ? darkIcon : lightIcon
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
