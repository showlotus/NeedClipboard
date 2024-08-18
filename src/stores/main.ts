import { ref } from 'vue'
import { defineStore } from 'pinia'
import { OptionType } from '@/hooks/useTypeOptions'
import { TYPE_VALUE } from '@/constants/aria'

export interface SearchParams {
  keyword: string
  type: OptionType
  currPage: number
  pageSize: number
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

  return {
    searchParams,
    updateSearchParams,

    activeRecord,
    updateActiveRecord
  }
})
