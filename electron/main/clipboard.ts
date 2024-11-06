import { clipboard, nativeImage } from 'electron'
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

export function writeClipboard(data: any) {
  updateShouldUpdateHistory(false)

  if (data.type === 'Text') {
    console.log('write text')
    clipboard.writeText(data.content)
  } else if (data.type === 'Image') {
    console.log('write image')
    clipboard.writeImage(nativeImage.createFromDataURL(data.url))
  } else if (data.type === 'File') {
    console.log('write file')
  }

  setTimeout(() => {
    updateShouldUpdateHistory(true)
  })
  toggleWindowVisible()
}

// TODO
export function pastActiveApp(data: any) {
  const handle = getCurrActiveWindowHandle()
  if (handle) {
    console.log('pastActiveApp', NativeClipboard.getAppNameByHandle(handle))
  }
  //   NativeClipboard.activateWindowByHandle(getCurrActiveWindowHandle())
  toggleWindowVisible()
}

NativeClipboard.watch((type, data, source, app) => {
  if (!shouldUpdateHistory) return
  console.log(type, clipboard.availableFormats())
  if (type === 'TEXT') {
    // buffer = clipboard.readBuffer(clipboard.availableFormats()[0]).toString()
  } else if (type === 'IMAGE') {
    const img = clipboard.readImage()
    const { width, height } = img.getSize()
    data = {
      url: img.toDataURL(),
      width,
      height,
      content: ''
    } as any
  } else if (type === 'FILE') {
  }

  getWinWebContents().send('update-clipboard', {
    type,
    data,
    source,
    app
  })
})
