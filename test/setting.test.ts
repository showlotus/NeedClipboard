// @vitest-environment jsdom
import dayjs from 'dayjs'
// fix IndexedDB API missing
import 'fake-indexeddb/auto'
import { describe, expect, test } from 'vitest'

import { DATE_TEMPLATE } from '@/constants/date'
import { createDatabase } from '@/database'
import { fetchDeleteExpired, fetchInsert, fetchSearchAll } from '@/database/api'

describe('test keep days is 7', () => {
  test('less than 7', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs().format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs().subtract(6, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(7)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(2)
  })

  // test('equal 7', async () => {
  //   const db = createDatabase()
  //   await db.ClipboardTable.clear()
  // })
})

// describe('test keep days is 30', () => {})

// describe('test keep days is 90', () => {})

// describe('test keep days is 180', () => {})

// describe('test keep days is 360', () => {})

// describe('test keep days is Unlimited', () => {})
