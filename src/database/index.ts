import Dexie, { EntityTable } from 'dexie'
import pkg from '../../package.json'

interface Clipboard {
  id: number
  type: string
  content: string
  imagePath?: string
  timestamp?: Date
  application?: string
}

// 创建数据库
const db = new Dexie(pkg.name) as Dexie & {
  clipboard: EntityTable<Clipboard, 'id'>
  image: EntityTable<{ id: number; image: any }, 'id'>
}

// 定义表结构
db.version(1).stores({
  clipboard: '++id,type,content,imagePath,timestamp,application'
})

db.version(1).stores({
  image: '++id,image'
})

export default db
