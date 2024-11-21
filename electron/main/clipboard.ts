import clipboardFiles from 'clipboard-files'
import { clipboard, nativeImage } from 'electron'
import NativeClipboard from 'native-clipboard'

import { getWinWebContents, toggleWindowVisible } from '.'

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
  console.log(data.type)
  if (['Text', 'Link', 'Color'].includes(data.type)) {
    console.log('write text')
    clipboard.writeText(data.content)
  } else if (data.type === 'Image') {
    console.log('write image')
    clipboard.writeImage(nativeImage.createFromDataURL(data.url))
  } else if (data.type === 'File') {
    console.log('write file', data)
    clipboardFiles.writeFiles(data.files)
  }
  updateShouldUpdateHistory(true)
  toggleWindowVisible()
  getWinWebContents().send('update-clipboard')
}

// TODO
export function pastActiveApp(data: any) {
  const handle = getCurrActiveWindowHandle()
  if (handle) {
    console.log('pastActiveApp', NativeClipboard.getAppNameByHandle(handle))
  }
  toggleWindowVisible()
  getWinWebContents().send('update-clipboard')
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
    console.log(clipboardFiles.readFiles())
    const files = clipboardFiles.readFiles()
    data = {
      files,
      path: '/xxxx',
      content: files[0],
      subType: 'folder,file'
    } as any
  }

  getWinWebContents().send('update-clipboard', {
    type,
    data,
    source,
    app
  })
})
