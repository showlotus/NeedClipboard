// @vitest-environment jsdom
import dayjs from 'dayjs'
// fix IndexedDB API missing
import 'fake-indexeddb/auto'
import { describe, expect, test } from 'vitest'

import { DATE_TEMPLATE } from '@/constants/date'
import {
  FileDataType,
  ImageDataType,
  TextDataType,
  createDatabase
} from '@/database'
import {
  InsertDataType,
  fetchDelete,
  fetchInsert,
  fetchIsExistInDB,
  fetchSearch,
  fetchUpdate
} from '@/database/api'

describe('test fetchSearch', () => {
  test('search all', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    const content = '1234567'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Text',
      content,
      characters: content.length,
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    const { result } = await fetchSearch({
      keyword: '',
      type: 'All',
      currPage: 1,
      pageSize: 1
    })
    const res = await db.ClipboardTable.get(id)
    expect(res).toEqual({ ...data, id })
    expect(result[0]).toEqual({ ...data, id })
  })

  test('search all with page', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    const list = [
      new Array(3).fill(0).map((v, i) => ({
        type: 'Text',
        content: '111',
        createTime: dayjs().subtract(i, 'day').format(DATE_TEMPLATE)
      })),
      new Array(3).fill(0).map((v, i) => ({
        type: 'Text',
        content: '222',
        createTime: dayjs().add(i, 'day').format(DATE_TEMPLATE)
      }))
    ].flat() as InsertDataType[]
    await Promise.all(list.map((v) => fetchInsert(v)))
    const data = await fetchSearch({
      keyword: '',
      type: 'All',
      currPage: 1,
      pageSize: 4
    })
    expect(data.result.length).toBe(4)

    const data2 = await fetchSearch({
      keyword: '',
      type: 'All',
      currPage: 2,
      pageSize: 4
    })
    expect(data2.result.length).toBe(2)

    const data3 = await fetchSearch({
      keyword: '',
      type: 'All',
      currPage: 2,
      pageSize: 5
    })
    expect(data3.result.length).toBe(1)

    const data4 = await fetchSearch({
      keyword: '',
      type: 'All',
      currPage: 2,
      pageSize: 6
    })
    expect(data4.result.length).toBe(0)
  })

  test('search all with keyword', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    const list = [
      new Array(3).fill(0).map((v, i) => ({
        type: 'Text',
        content: '_' + i,
        createTime: dayjs().format(DATE_TEMPLATE)
      })),
      new Array(3).fill(0).map((v, i) => ({
        type: 'File',
        content: i + '_',
        path: '~/x/y/z/' + i + '_',
        subType: 'folder,file',
        files: ['a.txt', 'b.js', 'c.jsx'],
        filesCount: 3,
        createTime: dayjs().subtract(1, 'day').format(DATE_TEMPLATE)
      })),
      new Array(3).fill(0).map((v, i) => ({
        type: 'Link',
        content: '_' + i + '_',
        createTime: dayjs().subtract(1, 'day').format(DATE_TEMPLATE)
      }))
    ].flat() as InsertDataType[]
    await Promise.all(list.map((v) => fetchInsert(v)))

    const data = await fetchSearch({
      keyword: '1',
      type: 'All',
      currPage: 1,
      pageSize: 4
    })
    expect(data.result.length).toBe(3)
    expect(data.totals).toBe(3)

    const data1 = await fetchSearch({
      keyword: '_1',
      type: 'All',
      currPage: 1,
      pageSize: 4
    })
    expect(data1.result.length).toBe(2)
    expect(data1.totals).toBe(2)

    const data2 = await fetchSearch({
      keyword: '_',
      type: 'All',
      currPage: 1,
      pageSize: 10
    })
    expect(data2.result.length).toBe(9)
    expect(data2.totals).toBe(9)
  })

  // TODO search other type
})

describe('test fetchInsert', () => {
  test('insert a record and type is Text', async () => {
    const db = createDatabase()
    const content = '1234567'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Text',
      content,
      characters: content.length,
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    const res = await db.ClipboardTable.get(id)
    expect(res).toEqual({ ...data, id })
  })

  test('insert a record and type is Color', async () => {
    const db = createDatabase()
    const content = 'red'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Color',
      content,
      characters: content.length,
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    const res = await db.ClipboardTable.get(id)
    expect(res).toEqual({ ...data, id })
  })

  test('insert a record and type is Link', async () => {
    const db = createDatabase()
    const content = 'https://www.xxx.com'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Link',
      content,
      characters: content.length,
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    const res = await db.ClipboardTable.get(id)
    expect(res).toEqual({ ...data, id })
  })

  test('insert a record and type is Image', async () => {
    const db = createDatabase()
    const data: Omit<ImageDataType, 'id'> = {
      type: 'Image',
      content: '',
      url: 'data:image/png;base64,/9j/4A',
      width: 200,
      height: 300,
      size: 300,
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    const res = await db.ClipboardTable.get(id)
    expect(res).toEqual({ ...data, id })
  })

  test('insert a record and type is File, subType is file', async () => {
    const db = createDatabase()
    const fileName = 'a.txt'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: fileName,
      path: '~/x/y/z/' + fileName,
      subType: 'file',
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    const res = await db.ClipboardTable.get(id)
    expect(res).toEqual({ ...data, id })
  })

  test('insert a record and type is File, subType is folder', async () => {
    const db = createDatabase()
    const folderName = 'aaa'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: folderName,
      path: '~/x/y/z/' + folderName,
      subType: 'folder',
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    const res = await db.ClipboardTable.get(id)
    expect(res).toEqual({ ...data, id })
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
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    const res = await db.ClipboardTable.get(id)
    expect(res).toEqual({ ...data, id })
  })
})

describe('test fetchDelete', () => {
  test('delete a record and type is Text', async () => {
    const db = createDatabase()
    const content = '1234567'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Text',
      content,
      characters: content.length,
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    expect(await db.ClipboardTable.get(id)).toBeDefined()
    await fetchDelete(id)
    expect(await db.ClipboardTable.get(id)).toBeUndefined()
  })

  test('delete a record and type is Link', async () => {
    const db = createDatabase()
    const content = 'https://www.xxx.com'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Link',
      content,
      characters: content.length,
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    expect(await db.ClipboardTable.get(id)).toBeDefined()
    await fetchDelete(id)
    expect(await db.ClipboardTable.get(id)).toBeUndefined()
  })

  test('delete a record and type is Color', async () => {
    const db = createDatabase()
    const content = 'blue'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Color',
      content,
      characters: content.length,
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    expect(await db.ClipboardTable.get(id)).toBeDefined()
    await fetchDelete(id)
    expect(await db.ClipboardTable.get(id)).toBeUndefined()
  })

  test('delete a record and type is Image', async () => {
    const db = createDatabase()
    const data: Omit<ImageDataType, 'id'> = {
      type: 'Image',
      content: '',
      url: 'data:image/png;base64,/9j/4A',
      width: 200,
      height: 300,
      size: 300,
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    expect(await db.ClipboardTable.get(id)).toBeDefined()
    await fetchDelete(id)
    expect(await db.ClipboardTable.get(id)).toBeUndefined()
  })

  test('delete a record and type is File, subType is file', async () => {
    const db = createDatabase()
    const fileName = 'a.txt'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: fileName,
      path: '~/x/y/z/' + fileName,
      subType: 'file',
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    expect(await db.ClipboardTable.get(id)).toBeDefined()
    await fetchDelete(id)
    expect(await db.ClipboardTable.get(id)).toBeUndefined()
  })

  test('delete a record and type is File, subType is folder', async () => {
    const db = createDatabase()
    const folderName = 'aaa'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: folderName,
      path: '~/x/y/z/' + folderName,
      subType: 'folder',
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    expect(await db.ClipboardTable.get(id)).toBeDefined()
    await fetchDelete(id)
    expect(await db.ClipboardTable.get(id)).toBeUndefined()
  })

  test('delete a record and type is File, subType is folder,file', async () => {
    const db = createDatabase()
    const folderName = 'aaa'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: folderName,
      path: '~/x/y/z/' + folderName,
      subType: 'folder,file',
      files: ['a.txt', 'b.js', 'c.jsx'],
      createTime: dayjs().format(DATE_TEMPLATE)
    }
    const id = await fetchInsert(data)
    expect(await db.ClipboardTable.get(id)).toBeDefined()
    await fetchDelete(id)
    expect(await db.ClipboardTable.get(id)).toBeUndefined()
  })
})

describe('test fetchIsExistInDB', () => {
  test('a existed record with type is Text', async () => {
    const db = createDatabase()
    db.ClipboardTable.clear()
    const content = '1234567'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Text',
      content,
      characters: content.length,
      createTime: dayjs().format(DATE_TEMPLATE)
    }

    const id = await fetchInsert(data)
    const existId = await fetchIsExistInDB(data)
    expect(id).toBe(existId)

    const existId2 = await fetchIsExistInDB({
      ...data,
      content: data.content + ' '
    })
    expect(existId2).toBeUndefined()
  })

  test('a existed record with type is Image', async () => {
    const db = createDatabase()
    db.ClipboardTable.clear()
    const data: Omit<ImageDataType, 'id'> = {
      type: 'Image',
      content: '',
      url: 'data:image/png;base64,/9j/4A',
      width: 200,
      height: 300,
      size: 300,
      createTime: dayjs().format(DATE_TEMPLATE)
    }

    const id = await fetchInsert(data)
    const existId = await fetchIsExistInDB(data)
    expect(id).toBe(existId)

    const existId2 = await fetchIsExistInDB({ ...data, url: '' })
    expect(existId2).toBeUndefined()
  })

  test('a existed record with type is File, subType is file', async () => {
    const db = createDatabase()
    db.ClipboardTable.clear()
    const fileName = 'a.txt'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: fileName,
      path: '~/x/y/z/' + fileName,
      subType: 'file',
      createTime: dayjs().format(DATE_TEMPLATE)
    }

    const id = await fetchInsert(data)
    const existId = await fetchIsExistInDB(data)
    expect(id).toBe(existId)

    const existId2 = await fetchIsExistInDB({ ...data, subType: 'folder' })
    expect(existId2).toBeUndefined()
  })

  test('a existed record with type is File, subType is folder', async () => {
    const db = createDatabase()
    db.ClipboardTable.clear()
    const folderName = 'aaa'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: folderName,
      path: '~/x/y/z/' + folderName,
      subType: 'folder',
      createTime: dayjs().format(DATE_TEMPLATE)
    }

    const id = await fetchInsert(data)
    const existId = await fetchIsExistInDB(data)
    expect(id).toBe(existId)

    const existId2 = await fetchIsExistInDB({ ...data, subType: 'file' })
    expect(existId2).toBeUndefined()
  })

  test('a existed record with type is File, subType is folder,file', async () => {
    const db = createDatabase()
    db.ClipboardTable.clear()
    const folderName = 'aaa'
    const data: Omit<FileDataType, 'id'> = {
      type: 'File',
      content: folderName,
      path: '~/x/y/z/' + folderName,
      subType: 'folder,file',
      files: ['a.txt', 'b.js', 'c.jsx'],
      createTime: dayjs().format(DATE_TEMPLATE)
    }

    const id = await fetchInsert(data)
    const existId = await fetchIsExistInDB(data)
    expect(existId).toBe(id)

    const existId2 = await fetchIsExistInDB({ ...data, subType: 'folder' })
    expect(existId2).toBeUndefined()

    const existId3 = await fetchIsExistInDB({
      ...data,
      files: ['c.jsx', 'a.txt', 'b.js']
    })
    expect(existId3).toBe(id)

    const existId4 = await fetchIsExistInDB({
      ...data,
      files: ['c.jsx', 'a.txt', 'b.jsx']
    })
    expect(existId4).toBeUndefined()
  })
})

describe('test fetchUpdate', () => {
  test('update a record and type is Text', async () => {
    const db = createDatabase()
    const content = '1234567'
    const data: Omit<TextDataType, 'id'> = {
      type: 'Text',
      content,
      characters: content.length,
      createTime: dayjs().format(DATE_TEMPLATE)
    }

    const id = await fetchInsert(data)
    const createTime = dayjs().add(1, 'h').format(DATE_TEMPLATE)
    await fetchUpdate(id, createTime)
    expect((await db.ClipboardTable.get(id))?.createTime).toBe(createTime)
  })
})
