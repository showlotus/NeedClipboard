import { createRequire } from 'node:module'

import { getWinWebContents } from '.'
import type { NativeClipboardType } from '../../packages/native-clipboard'

export const NativeClipboard: NativeClipboardType = createRequire(
  import.meta.url
)('../../packages/native-clipboard').default

let shouldUpdateHistory = true

export function updateShouldUpdateHistory(val: boolean) {
  shouldUpdateHistory = val
}

NativeClipboard.watch((type, data, source, app) => {
  if (!shouldUpdateHistory) return
  getWinWebContents().send('update-clipboard', { type, data, source, app })
})
