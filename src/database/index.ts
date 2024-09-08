import pkg from '$/package.json'
import Dexie, { EntityTable } from 'dexie'

import { genMockData } from '@/hooks/useSearch'
import { ClipboardType } from '@/hooks/useTypeOptions'

export interface ClipboardTableType {
  id: number
  type: ClipboardType
  content: string
  application?: string
  createTime?: string
}

export interface TextTableType {
  id: number
  characters: number
}

export interface FileTableType {
  id: number
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

type DataBaseType = Dexie & {
  ClipboardTable: EntityTable<ClipboardTableType, 'id'>
  TextTable: EntityTable<TextTableType, 'id'>
  FileTable: EntityTable<FileTableType, 'id'>
  ImageTable: EntityTable<ImageTableType, 'id'>
}

let db: DataBaseType
export async function createDataBase() {
  const isExists = await Dexie.exists(pkg.name)
  if (isExists) {
    return db
  }

  // 创建数据库
  const DB = new Dexie(pkg.name) as DataBaseType

  // 定义表结构
  DB.version(1).stores({
    ClipboardTable: '++id,type,content,application,createTime',
    TextTable: 'id,characters',
    FileTable: 'id,subType,path,files,filesCount',
    ImageTable: 'id,url,dimensions,size'
  })

  const mockData = genMockData(10)
  DB.ClipboardTable.bulkAdd(
    mockData.map((v) => {
      delete v.id
      return v
    })
  )

  return (db = DB)
}
