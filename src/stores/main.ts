import { defineStore } from 'pinia'
import { ref } from 'vue'

import { TYPE_VALUE } from '@/constants/aria'
import { OptionType } from '@/hooks/useTypeOptions'
import { Lang } from '@/i18n'

export interface SearchParams {
  keyword: string
  type: OptionType
  currPage: number
  pageSize: number
}

type Theme = 'system' | 'light' | 'dark'

interface Setting {
  primaryAction: 'clipboard' | 'app'
  theme: Theme
  language: Lang
  startup: boolean
  shortcutKey: string
  keepDays: number
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

  const setting = ref<Setting>({
    primaryAction: 'clipboard',
    theme: 'dark',
    language: 'zh_CN',
    startup: false,
    shortcutKey: 'Alt,C',
    keepDays: 7
  })
  const updateSetting = (key: keyof Setting, val: any) => {
    ;(setting.value as any)[key] = val
  }

  return {
    searchParams,
    updateSearchParams,

    activeRecord,
    updateActiveRecord,

    setting,
    updateSetting
  }
})
