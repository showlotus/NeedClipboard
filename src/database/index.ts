import pkg from '$/package.json'
import Dexie, { EntityTable } from 'dexie'
import { App } from 'vue'

import { ClipboardType } from '@/hooks/useTypeOptions'

export interface ClipboardTableType {
  id: number
  type: ClipboardType
  content: string
  createTime: string
  application?: {
    name: string
    icon: string
  }
}

export interface TextDataType extends ClipboardTableType {
  type: 'Text' | 'Link' | 'Color'
  characters: number
}

export interface FileDataType extends ClipboardTableType {
  type: 'File'
  subType: 'file' | 'folder' | 'folder,file'
  path: string | string[]
  files?: string[]
}

export interface ImageDataType extends ClipboardTableType {
  type: 'Image'
  url: string
  width: number
  height: number
  size: number
}

type DataBaseType = Dexie & {
  ClipboardTable: EntityTable<ClipboardTableType, 'id'>
}

export function createDatabase(): DataBaseType {
  if (createDatabase.prototype._DB) {
    return createDatabase.prototype._DB
  }

  // 创建数据库
  const DB = new Dexie(pkg.name) as DataBaseType

  // 定义表结构
  DB.version(1).stores({
    ClipboardTable:
      '++id,type,content,application,createTime, url,width,height,size, subType,path,files'
  })

  // TODO can use install register in the app
  // DB.install = function (app: App, ...options: unknown[]) {}

  return (createDatabase.prototype._DB = DB)
}
