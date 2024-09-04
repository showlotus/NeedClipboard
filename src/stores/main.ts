import { defineStore } from 'pinia'
import { reactive, ref, watch } from 'vue'

import { TYPE_VALUE } from '@/constants/aria'
import { OptionType } from '@/hooks/useTypeOptions'
import { Lang } from '@/i18n'
import { updateSettings } from '@/utils/ipc'

export interface SearchParams {
  keyword: string
  type: OptionType
  currPage: number
  pageSize: number
}

type Theme = 'system' | 'light' | 'dark'

export interface Setting {
  primaryAction: 'clipboard' | 'app'
  theme: Theme
  language: Lang
  startup: boolean
  shortcutKey: string
  keepDays: number
}

type ValueOf<T> = T[keyof T]

function useSetting() {
  const setting = reactive<Setting>({
    primaryAction: 'clipboard',
    theme: 'dark',
    language: 'zh_CN',
    startup: false,
    shortcutKey: 'Alt V',
    keepDays: 7
  })
  const updateSetting = (key: keyof Setting, val: any) => {
    ;(setting[key] as any) = val
  }

  watch(setting, (val) => {
    const cloneVal = JSON.parse(JSON.stringify(val))
    console.log(cloneVal)
    updateSettings(cloneVal)
  })

  return {
    setting,
    updateSetting
  }
}

export const useMainStore = defineStore('main', () => {
  const searchParams = ref<SearchParams>({
    keyword: '',
    type: TYPE_VALUE.all,
    currPage: 1,
    pageSize: 20
  })
  const updateSearchParams = (val: SearchParams) => {
    searchParams.value = val
  }

  const activeRecord = ref<any>({})
  const updateActiveRecord = (val: any) => {
    activeRecord.value = val
  }

  const { setting, updateSetting } = useSetting()

  return {
    searchParams,
    updateSearchParams,

    activeRecord,
    updateActiveRecord,

    setting,
    updateSetting
  }
})
