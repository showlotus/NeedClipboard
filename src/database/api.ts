import dayjs from 'dayjs'

import { DATE_TEMPLATE } from '@/constants/date'
import { TYPE_VALUE } from '@/constants/type'
import { UNIQUE_KEY } from '@/constants/unique'
import { ClipboardType } from '@/hooks/useTypeOptions'
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
    return v.content.includes(keyword)
  }
  const composeData = async (v: ClipboardTableType) => {
    let d
    if (v.type === 'File') {
      d = await db.FileTable.get(v.id)
    } else if (v.type === 'Image') {
      d = await db.ImageTable.get(v.id)
    } else {
      d = await db.TextTable.get(v.id)
    }
    return { ...v, ...d }
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
  data = await Promise.all(data.map(composeData))
  return { result: data, totals }
}

export async function fetchInsert(data: InsertDataType) {
  const db = createDatabase()
  const ops = {
    File: async () => {
      const [typeData, commonData] = pickAndOmit(
        data as RemoveId<FileDataType>,
        'files',
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
        'width',
        'height',
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
 * TODO 什么时候需要更新记录：
 *
 * 1. 当剪贴板中最新的一条记录与当前即将要入库的数据一致时，如何判断数据一致？
 * 2. 当前即将入库的数据已存在数据库中，
 */
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
    | Pick<TextDataType, 'type' | 'content'>
    | Pick<FileDataType, 'type' | 'content' | 'path' | 'files' | 'subType'>
    | Pick<ImageDataType, 'type' | 'url' | 'width' | 'height' | 'size'>
) {
  const db = createDatabase()
  let target
  if (data.type === 'File') {
    const res = await db.ClipboardTable.where({
      type: data.type,
      content: data.content,
      path: data.path,
      subType: data.subType
    }).toArray()
    for (const v of res) {
      // if ()
    }
  } else if (data.type === 'Image') {
    target = await db.ClipboardTable.where({
      type: data.type,
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

fetchIsExistInDB({ type: 'Text', content: '' })
fetchIsExistInDB({
  type: 'File',
  content: '',
  path: '11',
  files: [],
  subType: 'file'
})
fetchIsExistInDB({ type: 'Image', url: '', width: 20, height: 30, size: 10 })
;(window as any).__NeedClipboard__TEST__API = {
  fetchInsert,
  fetchDelete,
  fetchUpdate
}
