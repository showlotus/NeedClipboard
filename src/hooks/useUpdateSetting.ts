import { computed } from 'vue'

import { useMainStore } from '@/stores/main'
import { ipcUpdateSetting } from '@/utils/ipc'

export function useUpdateSetting() {
  const mainStore = useMainStore()
  const primaryAction = computed({
    get() {
      return mainStore.setting.primaryAction
    },
    set(val) {
      ipcUpdateSetting('primaryAction', val)
    }
  })
  const keepDays = computed({
    get() {
      return mainStore.setting.keepDays
    },
    set(val) {
      ipcUpdateSetting('keepDays', val)
    }
  })
  const language = computed({
    get() {
      return mainStore.setting.language
    },
    set(val) {
      ipcUpdateSetting('language', val)
    }
  })
  const theme = computed({
    get() {
      return mainStore.setting.theme
    },
    set(val) {
      ipcUpdateSetting('theme', val)
    }
  })
  const shortcutKey = computed({
    get() {
      return mainStore.setting.shortcutKey
    },
    set(val) {
      ipcUpdateSetting('shortcutKey', val)
    }
  })
  const startup = computed({
    get() {
      return mainStore.setting.startup
    },
    set(val) {
      ipcUpdateSetting('startup', val)
    }
  })

  return {
    primaryAction,
    keepDays,
    language,
    theme,
    shortcutKey,
    startup
  }
}
