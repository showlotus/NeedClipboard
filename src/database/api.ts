import dayjs from 'dayjs'

import { DATE_TEMPLATE } from '@/constants/date'
import { TYPE_VALUE } from '@/constants/type'
import { SearchParams } from '@/stores/main'
import { isEqualArray } from '@/utils/tools'

import {
  ClipboardTableType,
  FileDataType,
  ImageDataType,
  TextDataType,
  createDatabase
} from '.'

type RemoveId<T> = Omit<T, 'id'>

export type InsertDataType =
  | RemoveId<TextDataType>
  | RemoveId<ImageDataType>
  | RemoveId<FileDataType>

export async function fetchSearch(params: SearchParams) {
  const { keyword, type, currPage, pageSize } = params

  const db = createDatabase()
  const filters = (v: ClipboardTableType) => {
    if (!keyword) {
      return true
    }
    return v.content.toLowerCase().includes(keyword.toLowerCase())
  }
  let data: ClipboardTableType[]
  let totals = 0
  const start = pageSize * (currPage - 1)
  const end = start + pageSize
  if (type === TYPE_VALUE.all) {
    const collections = db.ClipboardTable.filter(filters)
    totals = await collections.count()
    data = (await collections.sortBy('createTime')).reverse().slice(start, end)
  } else {
    const collections = db.ClipboardTable.where('type')
      .equals(type)
      .filter(filters)
    totals = await collections.count()
    data = (await collections.sortBy('createTime')).reverse().slice(start, end)
  }
  return { result: data, totals }
}

export async function fetchInsert(...data: Array<InsertDataType>) {
  const db = createDatabase()
  return db.ClipboardTable.bulkAdd(data)
}

export async function fetchDelete(id: number) {
  const db = createDatabase()
  return db.ClipboardTable.delete(id)
}

export function fetchUpdate(id: number, createTime?: string) {
  const db = createDatabase()
  return db.ClipboardTable.where('id')
    .equals(id)
    .modify((v) => {
      v.createTime = createTime || dayjs().format(DATE_TEMPLATE)
    })
}

export async function fetchIsExistInDB(
  data:
    | Omit<TextDataType, 'id' | 'application' | 'createTime'>
    | Omit<FileDataType, 'id' | 'application' | 'createTime'>
    | Omit<ImageDataType, 'id' | 'application' | 'createTime'>
) {
  const db = createDatabase()
  let target
  if (data.type === 'File') {
    const res = (await db.ClipboardTable.where({
      type: data.type,
      content: data.content,
      path: data.path,
      subType: data.subType
    }).toArray()) as FileDataType[]
    if (data.subType !== 'folder,file') {
      target = res[0]
    } else {
      for (const item of res) {
        if (isEqualArray(data.files!, item.files!)) {
          target = item
          break
        }
      }
    }
  } else if (data.type === 'Image') {
    target = await db.ClipboardTable.where({
      url: data.url,
      width: data.width,
      height: data.height,
      size: data.size
    }).first()
  } else {
    target = await db.ClipboardTable.where({
      type: data.type,
      content: data.content
    }).first()
  }
  return target?.id
}

export async function fetchDeleteExpired(day: number) {
  const db = createDatabase()
  const data = await db.ClipboardTable.toArray()
  const now = dayjs()
  const expiredData = data.filter((v) => {
    return now.diff(v.createTime, 'day') > day
  })
  await db.ClipboardTable.bulkDelete(expiredData.map((v) => v.id))
}

export function fetchSearchAll() {
  return fetchSearch({
    keyword: '',
    type: 'All',
    currPage: 1,
    pageSize: 1
  })
}

;(window as any).__NeedClipboard__TEST__API = {
  fetchInsert,
  fetchDelete,
  fetchUpdate
}
