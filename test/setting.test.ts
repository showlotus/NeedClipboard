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

  test('equal 7', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert({
      type: 'Text',
      content: '',
      characters: 0,
      createTime: dayjs().subtract(7, 'day').format(DATE_TEMPLATE)
    })
    await fetchDeleteExpired(7)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })

  test('more than 7', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(7, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(8, 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
          .format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(7)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(0)
  })

  test('one is less than 7 and one is more than 7', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(7, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs().subtract(7, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(7)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })
})

describe('test keep days is 30', () => {
  test('less than 30', async () => {
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
        createTime: dayjs().subtract(29, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(30)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(2)
  })

  test('equal 30', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert({
      type: 'Text',
      content: '',
      characters: 0,
      createTime: dayjs().subtract(30, 'day').format(DATE_TEMPLATE)
    })
    await fetchDeleteExpired(30)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })

  test('more than 30', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(30, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(31, 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
          .format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(30)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(0)
  })

  test('one is less than 30 and one is more than 30', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(30, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs().subtract(30, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(30)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })
})

describe('test keep days is 60', () => {
  test('less than 60', async () => {
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
        createTime: dayjs().subtract(59, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(60)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(2)
  })

  test('equal 60', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert({
      type: 'Text',
      content: '',
      characters: 0,
      createTime: dayjs().subtract(60, 'day').format(DATE_TEMPLATE)
    })
    await fetchDeleteExpired(60)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })

  test('more than 60', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(60, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(61, 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
          .format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(60)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(0)
  })

  test('one is less than 60 and one is more than 60', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(60, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs().subtract(60, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(60)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })
})

describe('test keep days is 180', () => {
  test('less than 180', async () => {
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
        createTime: dayjs().subtract(179, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(180)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(2)
  })

  test('equal 180', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert({
      type: 'Text',
      content: '',
      characters: 0,
      createTime: dayjs().subtract(180, 'day').format(DATE_TEMPLATE)
    })
    await fetchDeleteExpired(180)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })

  test('more than 180', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(180, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(181, 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
          .format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(180)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(0)
  })

  test('one is less than 180 and one is more than 180', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(180, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs().subtract(180, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(180)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })
})

describe('test keep days is 360', () => {
  test('less than 360', async () => {
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
        createTime: dayjs().subtract(359, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(360)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(2)
  })

  test('equal 360', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert({
      type: 'Text',
      content: '',
      characters: 0,
      createTime: dayjs().subtract(360, 'day').format(DATE_TEMPLATE)
    })
    await fetchDeleteExpired(360)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })

  test('more than 360', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(360, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(361, 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
          .format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(360)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(0)
  })

  test('one is less than 360 and one is more than 360', async () => {
    const db = createDatabase()
    await db.ClipboardTable.clear()
    await fetchInsert(
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs()
          .subtract(360, 'day')
          .set('minute', dayjs().get('minute') - 1)
          .format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs().subtract(360, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(360)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(1)
  })
})

describe('test keep days is Unlimited', () => {
  test('less than 99999', async () => {
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
        createTime: dayjs().subtract(720, 'day').format(DATE_TEMPLATE)
      },
      {
        type: 'Text',
        content: '',
        characters: 0,
        createTime: dayjs().subtract(99000, 'day').format(DATE_TEMPLATE)
      }
    )
    await fetchDeleteExpired(99999)
    const { totals } = await fetchSearchAll()
    expect(totals).toBe(3)
  })
})
