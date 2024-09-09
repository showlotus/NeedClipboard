import { TYPE_VALUE } from '@/constants/aria'
import { SearchParams } from '@/stores/main'

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
  let insertedClipboardTableData = {} as ClipboardTableType
  let insertedTypeTableData = {}
  if (data.type === 'File') {
    ;[insertedTypeTableData, insertedClipboardTableData] = pickAndOmit(
      data,
      'files',
      'filesCount',
      'path',
      'subType'
    )
  } else if (data.type === 'Image') {
    ;[insertedTypeTableData, insertedClipboardTableData] = pickAndOmit(
      data,
      'dimensions',
      'size',
      'url'
    )
  } else {
    ;[insertedTypeTableData, insertedClipboardTableData] = pickAndOmit(
      data,
      'characters'
    )
  }

  const id = await db.ClipboardTable.add(insertedClipboardTableData)
  const insertedData = { id, ...insertedTypeTableData }
  if (data.type === 'File') {
    await db.FileTable.put(insertedData as FileTableType)
  } else if (data.type === 'Image') {
    await db.ImageTable.put(insertedData as ImageTableType)
  } else {
    await db.TextTable.put(insertedData as TextTableType)
  }
  return id
}

export function fetchDelete() {}

export function fetchUpdate() {}

function omit<T extends Record<string, any>>(obj: T, ...keys: (keyof T)[]) {
  return Object.keys(obj).reduce((curr: any, key) => {
    if (!keys.includes(key)) {
      curr[key] = obj[key]
    }
    return curr
  }, {})
}

function pick<T extends Record<string, any>>(obj: T, ...keys: (keyof T)[]) {
  return Object.keys(obj).reduce((curr: any, key) => {
    if (keys.includes(key)) {
      curr[key] = obj[key]
    }
    return curr
  }, {})
}

function pickAndOmit<T extends Record<string, any>>(
  obj: T,
  ...keys: (keyof T)[]
) {
  return [pick(obj, ...keys), omit(obj, ...keys)]
}
