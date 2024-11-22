import clipboardFiles from 'clipboard-files'
import { clipboard, nativeImage } from 'electron'
import NativeClipboard from 'native-clipboard'
import fs from 'node:fs'

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
  if (['Text', 'Link', 'Color'].includes(data.type)) {
    clipboard.writeText(data.content)
  } else if (data.type === 'Image') {
    clipboard.writeImage(nativeImage.createFromDataURL(data.url))
  } else if (data.type === 'File') {
    clipboardFiles.writeFiles(data.files || [data.path])
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

function getFileName(filePath: string) {
  return filePath.split('\\').at(-1)
}

function getPublicDirectoryPath(files: string[]) {
  return files[0].split('\\').slice(0, -1).join('\\')
}

NativeClipboard.watch(
  (type: 'TEXT' | 'IMAGE' | 'FILE', data: any, source: string, app: string) => {
    if (!shouldUpdateHistory) return
    if (type === 'IMAGE') {
      const img = clipboard.readImage()
      const { width, height } = img.getSize()
      data = {
        url: img.toDataURL(),
        width,
        height,
        content: ''
      } as any
    } else if (type === 'FILE') {
      const files = clipboardFiles.readFiles()
      if (files.length === 1) {
        const stat = fs.lstatSync(files[0])
        if (stat.isFile()) {
          data = {
            subType: 'file',
            content: getFileName(files[0]),
            path: files[0]
          }
        } else if (stat.isDirectory()) {
          data = {
            subType: 'folder',
            content: getFileName(files[0]),
            path: files[0]
          }
        }
      } else {
        data = {
          files,
          path: getPublicDirectoryPath(files),
          content: getFileName(getPublicDirectoryPath(files)),
          subType: 'folder,file'
        } as any
      }
    }

    getWinWebContents().send('update-clipboard', {
      type,
      data,
      source,
      app
    })
  }
)
