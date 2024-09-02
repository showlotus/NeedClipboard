import { Ref, nextTick, ref } from 'vue'

import { EVENT_CODE } from '@/constants/aria'
import { updateActiveShortcut } from '@/utils/ipc'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ValueOf<T> = T[keyof T]

const formatKey = (key: string) => {
  if (
    [
      EVENT_CODE.left,
      EVENT_CODE.up,
      EVENT_CODE.right,
      EVENT_CODE.down
    ].includes(key as any)
  ) {
    return key.slice(5)
  } else if (key === EVENT_CODE.meta) {
    return EVENT_CODE.super
  } else if (key === ' ') {
    return EVENT_CODE.space
  } else if (key === 'Control') {
    return 'Ctrl'
  }
  return key.replace(/^[\s\S]/, (val) => val.toUpperCase())
}

export function useRecordKey(initialValue: Ref<string>) {
  const recordingKeys = ref<string>(initialValue.value || '')
  const pressKeys = new Set<string>()
  const recordKeys = new Set<string>()
  // BUG 同时按下 Alt + Space 时，会默认打开调整窗口菜单面板
  const onKeydown = (e: KeyboardEvent) => {
    // 禁止的按键
    const uselessKeys = [EVENT_CODE.esc]
    if (e.key === EVENT_CODE.enter) {
      const value = Array.from(recordKeys.values()).join(' ')

      // TODO 重新设置当前全局快捷键
      // 首先判断是否冲突，若冲突则提示，否则提示修改成功
      updateActiveShortcut(value).then((res) => {
        if (res) {
          initialValue.value = value
          recordingKeys.value = value
          nextTick(() => {
            ;(e.target as HTMLElement).blur()
          })
          console.log(value)
        } else {
          console.error('快捷键冲突')
        }
      })
    } else if (!uselessKeys.includes(e.key)) {
      // 重新录制，清空上次录制的键
      if (pressKeys.size === 0) {
        recordKeys.clear()
      }

      const key = formatKey(e.key)
      recordKeys.add(key)
      pressKeys.add(key)
      recordingKeys.value = Array.from(recordKeys.values()).join(' ')
    }
  }
  const onKeyup = (e: KeyboardEvent) => {
    const key = formatKey(e.key)
    if (pressKeys.has(key)) {
      pressKeys.delete(key)
    }
  }
  const onFocus = (e: FocusEvent) => {
    recordingKeys.value = initialValue.value
  }
  const onBlur = (e: FocusEvent) => {
    pressKeys.clear()
    recordKeys.clear()
    recordingKeys.value = initialValue.value
  }
  return {
    recordingKeys,
    onKeydown,
    onKeyup,
    onFocus,
    onBlur
  }
}
