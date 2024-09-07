import { ElMessage } from 'element-plus'
import { Ref, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { EVENT_CODE } from '@/constants/aria'
import { ipcValidateShortcutIsRegistered } from '@/utils/ipc'

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
  const { t } = useI18n()

  watch(initialValue, (val) => {
    recordingKeys.value = val
  })

  // BUG 同时按下 Alt + Space 时，会默认打开调整窗口菜单面板
  const onKeydown = async (e: KeyboardEvent) => {
    // 禁止的按键
    const uselessKeys = [EVENT_CODE.esc]
    if (e.key === EVENT_CODE.enter) {
      const value = Array.from(recordKeys.values())

      const shortcutKeys = value.join('+')
      const isRegistered = await ipcValidateShortcutIsRegistered(shortcutKeys)
      if (isRegistered) {
        return ElMessage({
          message: t('NC.conflictShortcut'),
          type: 'warning',
          plain: true
        })
      }

      const key = value.join(' ')
      initialValue.value = key
      recordingKeys.value = key
      nextTick(() => {
        ;(e.target as HTMLElement).blur()
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
  const onFocus = () => {
    recordingKeys.value = initialValue.value
  }
  const onBlur = () => {
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
