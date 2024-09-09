import { defineStore } from 'pinia'
import { ref } from 'vue'

import { TYPE_VALUE } from '@/constants/aria'
import { OptionType } from '@/hooks/useTypeOptions'
import { Lang } from '@/i18n'
import { ipcInitSettings, ipcOnRefreshSettings } from '@/utils/ipc'

export interface SearchParams {
  keyword: string
  type: OptionType
  currPage: number
  pageSize: number
}

export type Theme = 'system' | 'light' | 'dark'

export interface Setting {
  primaryAction: 'clipboard' | 'app'
  theme: Theme
  language: Lang
  startup: boolean
  shortcutKey: string
  keepDays: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ValueOf<T> = T[keyof T]

function useSetting() {
  const setting = ref<Setting>({} as any)

  ipcOnRefreshSettings((event, store) => {
    setting.value = store
  })

  ipcInitSettings()

  return {
    setting
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

  const { setting } = useSetting()

  return {
    searchParams,
    updateSearchParams,

    activeRecord,
    updateActiveRecord,

    setting
  }
})
