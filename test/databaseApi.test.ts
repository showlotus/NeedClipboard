// @vitest-environment jsdom
import dayjs from 'dayjs'
import Dexie from 'dexie'
// fix IndexedDB API missing
import 'fake-indexeddb/auto'
import { describe, expect, test } from 'vitest'

import { fetchInsert, fetchSearch } from '@/database/api'
import { SearchParams } from '@/stores/main'

import {
  ClipboardTableType,
  FileDataType,
  TextDataType,
  createDatabase
} from '../src/database'

describe('test fetchSearch', () => {
  test('search all', async () => {
    const db = createDatabase()
    await db.ClipboardTable.bulkAdd([
      {
        type: 'Text',
        content: 'xxx',
        createTime: dayjs().format('YYYY/MM/DD HH:mm:ss')
      },
      {
        type: 'Image',
        content: '',
        createTime: dayjs().subtract(1, 'day').format('YYYY/MM/DD HH:mm:ss')
      }
    ])
    const params: SearchParams = {
      keyword: '',
      type: 'All',
      currPage: 1,
      pageSize: 10
    }
    const data = await fetchSearch(params)
    console.log(data)
    // expect(sum(1, 2)).toBe(3)
  })
})

describe('test fetchInsert', () => {
  test('insert a record and type is Text', async () => {
    const db = createDatabase()
    const content = '1234567'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Text',
      content,
      characters: content.length,
      createTime: dayjs().format('YYYY/MM/DD HH:mm:ss')
    }
    const id = await fetchInsert(data)
    const clipboardTableResult = await db.ClipboardTable.get(id)
    const textTableResult = await db.TextTable.get(id)
    expect({ ...clipboardTableResult, ...textTableResult }).toEqual({
      ...data,
      id
    })
  })

  test('insert a record and type is Color', async () => {
    const db = createDatabase()
    const content = 'red'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Color',
      content,
      characters: content.length,
      createTime: dayjs().format('YYYY/MM/DD HH:mm:ss')
    }
    const id = await fetchInsert(data)
    const clipboardTableResult = await db.ClipboardTable.get(id)
    const textTableResult = await db.TextTable.get(id)
    expect({ ...clipboardTableResult, ...textTableResult }).toEqual({
      ...data,
      id
    })
  })

  test('insert a record and type is Link', async () => {
    const db = createDatabase()
    const content = 'https://www.xxx.com'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Link',
      content,
      characters: content.length,
      createTime: dayjs().format('YYYY/MM/DD HH:mm:ss')
    }
    const id = await fetchInsert(data)
    const clipboardTableResult = await db.ClipboardTable.get(id)
    const textTableResult = await db.TextTable.get(id)
    expect({ ...clipboardTableResult, ...textTableResult }).toEqual({
      ...data,
      id
    })
  })

  test('insert a record and type is File, subType is file', async () => {
    const db = createDatabase()
    const fileName = 'a.txt'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: fileName,
      path: '~/x/y/z/' + fileName,
      subType: 'file',
      createTime: dayjs().format('YYYY/MM/DD HH:mm:ss')
    }
    const id = await fetchInsert(data)
    const clipboardTableResult = await db.ClipboardTable.get(id)
    const fileTableResult = await db.FileTable.get(id)
    expect({ ...clipboardTableResult, ...fileTableResult }).toEqual({
      ...data,
      id
    })
  })

  test('insert a record and type is File, subType is folder', async () => {
    const db = createDatabase()
    const folderName = 'aaa'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: folderName,
      path: '~/x/y/z/' + folderName,
      subType: 'folder',
      createTime: dayjs().format('YYYY/MM/DD HH:mm:ss')
    }
    const id = await fetchInsert(data)
    const clipboardTableResult = await db.ClipboardTable.get(id)
    const fileTableResult = await db.FileTable.get(id)
    expect({ ...clipboardTableResult, ...fileTableResult }).toEqual({
      ...data,
      id
    })
  })

  test('insert a record and type is File, subType is folder,file', async () => {
    const db = createDatabase()
    const folderName = 'aaa'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: folderName,
      path: '~/x/y/z/' + folderName,
      subType: 'folder,file',
      files: ['a.txt', 'b.js', 'c.jsx'],
      filesCount: 3,
      createTime: dayjs().format('YYYY/MM/DD HH:mm:ss')
    }
    const id = await fetchInsert(data)
    const clipboardTableResult = await db.ClipboardTable.get(id)
    const fileTableResult = await db.FileTable.get(id)
    expect({ ...clipboardTableResult, ...fileTableResult }).toEqual({
      ...data,
      id
    })
  })
})

// describe('test fetchDelete', () => {
//   test('adds 1 + 2 to equal 3', () => {
//     expect(sum(1, 2)).toBe(3)
//   })
// })

// describe('test fetchUpdate', () => {
//   test('adds 1 + 2 to equal 3', () => {
//     expect(sum(1, 2)).toBe(3)
//   })
// })
