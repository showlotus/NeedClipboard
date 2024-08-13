import { ref } from 'vue'
import { defineStore } from 'pinia'
import { OptionType } from '@/hooks/useTypeOptions'

export interface SearchParams {
  keyword: string
  type: OptionType
  currPage?: number
  pageSize?: number
}

export const useMainStore = defineStore('main', () => {
  const searchParams = ref<SearchParams>({ keyword: '', type: 'all' })
  const updateSearchParams = (val: SearchParams) => {
    searchParams.value = val
  }

  return {
    searchParams,
    updateSearchParams
  }
})
