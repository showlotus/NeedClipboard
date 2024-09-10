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

  // let data = [] as any
  const filters = (v: ClipboardTableType) => {
    if (!keyword) {
      return true
    }
    return v.content.includes(keyword)
  }
  const DB = createDatabase()
  console.log(await DB.ClipboardTable.count())
  let data
  if (type === TYPE_VALUE.all) {
    data = await DB.ClipboardTable.filter(filters).toArray()
  } else {
    data = await DB.ClipboardTable.where('type')
      .equals(type)
      .filter(filters)
      .toArray()
  }

  return data

  const start = pageSize * (currPage - 1)
  const end = start + pageSize
  // const result = data.slice(start, end)
  const result = [].slice(start, end)

  return {
    result,
    totals: 100
  }
}

type RemoveId<T> = Omit<T, 'id'>

type InsertDataType =
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

export function fetchDelete() {}

export function fetchUpdate() {}
