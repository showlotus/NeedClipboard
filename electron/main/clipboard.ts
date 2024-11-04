import { createRequire } from 'node:module'

import { getWinWebContents, toggleWindowVisible } from '.'
import type { NativeClipboardType } from '../../packages/native-clipboard'

export const NativeClipboard: NativeClipboardType = createRequire(
  import.meta.url
)('../../packages/native-clipboard').default

let shouldUpdateHistory = true
let currActiveWindowHandle = ''

export function updateShouldUpdateHistory(val: boolean) {
  shouldUpdateHistory = val
}

export function getCurrActiveWindowHandle() {
  return currActiveWindowHandle
}

export function updateCurrActiveWindowHandle(handle: string) {
  currActiveWindowHandle = handle
}

// TODO
export function writeClipboard(data: any) {
  updateShouldUpdateHistory(false)
  console.log('write Clipboard', data)
  updateShouldUpdateHistory(true)
  toggleWindowVisible()
}

// TODO
export function pastActiveApp(data: any) {
  console.log('pastActiveApp', data)
  toggleWindowVisible()
}

NativeClipboard.watch((type, data, source, app) => {
  if (!shouldUpdateHistory) return
  getWinWebContents().send('update-clipboard', { type, data, source, app })
})
