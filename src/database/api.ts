import { TYPE_VALUE, UNIQUE_KEY } from '@/constants/aria'
import { ClipboardType, OptionType } from '@/hooks/useTypeOptions'
import { SearchParams } from '@/stores/main'
import { pickAndOmit } from '@/utils/tools'

import {
  ClipboardTableType,
  FileDataType,
  FileTableType,
  ImageDataType,
  ImageTableType,
  TextDataType,
  TextTableType,
  createDatabase
} from '.'

export async function fetchSearch(params: SearchParams) {
  const { keyword, type, currPage, pageSize } = params

  const filters = (v: ClipboardTableType) => {
    if (!keyword) {
      return true
    }
    return v.content.includes(keyword)
  }
  const db = createDatabase()
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
    data = await Promise.all(
      data.map(async (v) => {
        let d
        if (v.type === 'File') {
          d = await db.FileTable.get(v.id)
        } else if (v.type === 'Image') {
          d = await db.ImageTable.get(v.id)
        } else {
          d = await db.TextTable.get(v.id)
        }
        return { ...v, ...d }
      })
    )
  }

  return { result: data, totals }
}

type RemoveId<T> = Omit<T, 'id'>

export type InsertDataType =
  | RemoveId<TextDataType>
  | RemoveId<ImageDataType>
  | RemoveId<FileDataType>

export async function fetchInsert(data: InsertDataType) {
  const db = createDatabase()
  const ops = {
    File: async () => {
      const [typeData, commonData] = pickAndOmit(
        data as RemoveId<FileDataType>,
        'files',
        'filesCount',
        'path',
        'subType'
      )
      const id = await db.ClipboardTable.add(commonData)
      const insertedData = { id, ...typeData }
      return db.FileTable.put(insertedData as FileTableType)
    },
    Image: async () => {
      const [typeData, commonData] = pickAndOmit(
        data as RemoveId<ImageDataType>,
        'dimensions',
        'size',
        'url'
      )
      const id = await db.ClipboardTable.add(commonData)
      const insertedData = { id, ...typeData }
      return db.ImageTable.put(insertedData as ImageTableType)
    },
    [UNIQUE_KEY]: async () => {
      const [typeData, commonData] = pickAndOmit(
        data as RemoveId<TextDataType>,
        'characters'
      )
      const id = await db.ClipboardTable.add(commonData)
      const insertedData = { id, ...typeData }
      return db.TextTable.put(insertedData as TextTableType)
    }
  }

  if (ops[data.type as 'File' | 'Image']) {
    return ops[data.type as 'File' | 'Image']()
  } else {
    return ops[UNIQUE_KEY]()
  }
}

export async function fetchDelete(id: number) {
  const db = createDatabase()
  const { type } = (await db.ClipboardTable.get(id))!
  await db.ClipboardTable.delete(id)
  if (type === 'File') {
    return await db.FileTable.delete(id)
  } else if (type === 'Image') {
    return await db.ImageTable.delete(id)
  } else {
    return await db.TextTable.delete(id)
  }
}

/**
 * 什么时候需要更新记录：
 *
 * 1. 当剪贴板中最新的一条记录与当前即将要入库的数据一致时
 */
export function fetchUpdate() {}
