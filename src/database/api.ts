import { TYPE_VALUE } from '@/constants/aria'
import { SearchParams } from '@/stores/main'

import { ClipboardTableType, createDataBase } from '.'

export async function fetchSearch(params: SearchParams) {
  const { keyword, type, currPage, pageSize } = params

  // let data = [] as any
  const filters = (v: ClipboardTableType) => {
    if (!keyword) {
      return true
    }
    return v.content.includes(keyword)
  }
  const DB = await createDataBase()
  if (type === TYPE_VALUE.all) {
    const data = DB.ClipboardTable.filter(filters)
  } else {
    const data = DB.ClipboardTable.where('type').equals(type).filter(filters)
  }

  const start = pageSize * (currPage - 1)
  const end = start + pageSize
  // const result = data.slice(start, end)
  const result = [].slice(start, end)

  return {
    result,
    totals: 100
  }
}

export function fetchInsert() {}

export function fetchDelete() {}

export function fetchUpdate() {}
