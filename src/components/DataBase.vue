<script setup lang="ts">
import Dexie, { EntityTable } from 'dexie'

interface Clipboard {
  id: number
  type: string
  content: string
  imagePath?: string
  timestamp?: Date
  application?: string
}

// 创建数据库
const db = new Dexie('NeedClipboard') as Dexie & {
  clipboard: EntityTable<Clipboard, 'id'>
}

// 定义表结构
db.version(1).stores({
  clipboard: '++id,type,content,imagePath,timestamp,application'
})

db.clipboard
  .bulkAdd([
    {
      type: 'file',
      content: '~/showlotus/.../code/NeedClipboard',
      application: 'Chrome'
    }
  ])
  .then((res) => {
    console.log(res)
  })

// 示例添加一些数据
// db.clipboard.bulkAdd([
//   { type: 'text', content: 'Hello World', timestamp: new Date() },
//   {
//     type: 'text',
//     content: 'Fuzzy search with Dexie.js',
//     timestamp: new Date()
//   },
//   { type: 'text', content: 'How to use Dexie.js', timestamp: new Date() }
// ])

async function fuzzySearch(query: string) {
  const regex = new RegExp(query, 'i') // 创建正则表达式，忽略大小写
  const results = await db.clipboard
    .filter((item) => regex.test(item.content))
    .toArray()
  return results
}

const handleQuery = () => {
  fuzzySearch('dexie').then((results) => {
    console.log('Fuzzy search results:', results)
  })
}
</script>

<template>
  <h1>DataBase</h1>
  <button class="border-red-500" @click="handleQuery">Query DataBase</button>
</template>

<style scoped></style>
