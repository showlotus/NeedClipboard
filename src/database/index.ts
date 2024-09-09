import pkg from '$/package.json'
import Dexie, { EntityTable } from 'dexie'

import { genMockData } from '@/hooks/useSearch'
import { ClipboardType } from '@/hooks/useTypeOptions'

export interface ClipboardTableType {
  id: number
  type: ClipboardType
  content: string
  createTime: string
  application?: string
}

export interface TextTableType {
  id: number
  characters: number
}

export interface TextDataType extends ClipboardTableType {
  type: 'Text' | 'Link' | 'Color'

  characters: number
}

export interface FileTableType {
  id: number
  subType: 'file' | 'folder' | 'folder,file'
  path: string | string[]
  files?: string[]
  filesCount?: number
}

export interface FileDataType extends ClipboardTableType {
  type: 'File'

  subType: 'file' | 'folder' | 'folder,file'
  path: string | string[]
  files?: string[]
  filesCount?: number
}

export interface ImageTableType {
  id: number
  url: string
  dimensions: string
  size: string
}

export interface ImageDataType extends ClipboardTableType {
  type: 'Image'

  url: string
  dimensions: string
  size: string
}

type DataBaseType = Dexie & {
  ClipboardTable: EntityTable<ClipboardTableType, 'id'>
  TextTable: EntityTable<TextTableType, 'id'>
  FileTable: EntityTable<FileTableType, 'id'>
  ImageTable: EntityTable<ImageTableType, 'id'>
}

let db: DataBaseType
export function createDatabase() {
  // const isExists = await Dexie.exists(pkg.name)
  // if (isExists) {
  //   return db
  // }

  // 创建数据库
  const DB = new Dexie(pkg.name) as DataBaseType

  // 定义表结构
  DB.version(1).stores({
    ClipboardTable: '++id,type,content,application,createTime',
    TextTable: 'id,characters',
    FileTable: 'id,subType,path,files,filesCount',
    ImageTable: 'id,url,dimensions,size'
  })

  // const mockData = genMockData(10)
  // DB.ClipboardTable.bulkAdd(
  //   mockData.map((v) => {
  //     delete v.id
  //     return v
  //   })
  // )

  // DB.ClipboardTable.bulkPut([
  //   {
  //     id: 100,
  //     content: 'xxxxxxx',
  //     application: '',
  //     type: 'Text'
  //   },
  //   {
  //     id: 1000,
  //     content: 'xxxxxxx',
  //     application: '',
  //     type: 'Text'
  //   }
  // ])

  return (db = DB)
}

export function getDataBase() {
  return db
}
