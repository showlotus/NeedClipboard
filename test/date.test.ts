import dayjs from 'dayjs'
import { describe, expect, test } from 'vitest'

import {
  isLastMonth,
  isLastWeek,
  isLastYear,
  isLongAgo,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isYesterday
} from '../src/utils/date'

describe('test today', () => {
  test('is today', () => {
    expect(isToday(dayjs())).toBe(true)
  })

  test('is not today and before', () => {
    expect(isToday(dayjs().subtract(1, 'day'))).toBe(false)
  })

  test('is not today and after', () => {
    expect(isToday(dayjs().add(1, 'day'))).toBe(false)
  })
})

describe('test yesterday', () => {
  test('is yesterday', () => {
    expect(isYesterday(dayjs().subtract(1, 'day'))).toBe(true)
  })

  test('is yesterday with time is 00:00:00', () => {
    expect(
      isYesterday(
        dayjs()
          .subtract(1, 'day')
          .set('hour', 0)
          .set('minute', 0)
          .set('second', 0)
      )
    ).toBe(true)
  })

  test('is yesterday with time is 23:59:59', () => {
    expect(
      isYesterday(
        dayjs()
          .subtract(1, 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
      )
    ).toBe(true)
  })

  test('is not yesterday and before', () => {
    expect(isYesterday(dayjs().subtract(1, 'day').subtract(1, 'day'))).toBe(
      false
    )
  })

  test('is not yesterday and after', () => {
    expect(isYesterday(dayjs())).toBe(false)
  })
})

describe('test this week', () => {
  test('is this week', () => {
    expect(isThisWeek(dayjs())).toBe(true)
  })

  test('is this week at monday with time is 00:00:00', () => {
    expect(
      isThisWeek(
        dayjs()
          .subtract((dayjs().get('day') - 1 + 7) % 7, 'day')
          .set('hour', 0)
          .set('minute', 0)
          .set('second', 0)
      )
    ).toBe(true)
  })

  test('is this week at sunday with time is 23:59:59', () => {
    expect(
      isThisWeek(
        dayjs()
          .add((7 - dayjs().get('day') + 7) % 7, 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
      )
    ).toBe(true)
  })

  test('is not this week at last sunday with time is 23:59:59', () => {
    expect(
      isThisWeek(
        dayjs()
          .subtract(dayjs().get('day') || 7, 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
      )
    ).toBe(false)
  })

  test('is not this week at next monday with time is 00:00:00', () => {
    expect(
      isThisWeek(
        dayjs()
          .add(7 - dayjs().get('day') + 1, 'day')
          .set('hour', 0)
          .set('minute', 0)
          .set('second', 0)
      )
    ).toBe(false)
  })
})

describe('test last week', () => {
  test('is last week', () => {
    expect(isLastWeek(dayjs().subtract(dayjs().get('day') || 7, 'day'))).toBe(
      true
    )
  })

  test('is last week at last monday with 00:00:00', () => {
    expect(
      isLastWeek(
        dayjs()
          .subtract((dayjs().get('day') || 7) + 6, 'day')
          .set('hour', 0)
          .set('minute', 0)
          .set('second', 0)
      )
    ).toBe(true)
  })

  test('is last week at last sunday with 23:59:59', () => {
    expect(
      isLastWeek(
        dayjs()
          .subtract(dayjs().get('day') || 7, 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
      )
    ).toBe(true)
  })

  test('is not last week at today', () => {
    expect(isLastWeek(dayjs())).toBe(false)
  })
})

describe('test this month', () => {
  test('is this month', () => {
    expect(isThisMonth(dayjs())).toBe(true)
  })

  test('is not this month at last day of last month', () => {
    expect(isThisMonth(dayjs().subtract(dayjs().get('date'), 'day'))).toBe(
      false
    )
  })

  test('is not this month at next month', () => {
    expect(isThisMonth(dayjs().set('month', dayjs().get('month') + 1))).toBe(
      false
    )
  })
})

describe('test last month', () => {
  test('is last month', () => {
    expect(isLastMonth(dayjs().subtract(dayjs().get('date'), 'day'))).toBe(true)
  })

  test('is last month of first day', () => {
    expect(
      isLastMonth(
        dayjs()
          .set('month', dayjs().get('month') - 1)
          .startOf('month')
      )
    ).toBe(true)
  })

  test('is last month of last day', () => {
    expect(
      isLastMonth(
        dayjs()
          .set('month', dayjs().get('month') - 1)
          .endOf('month')
      )
    ).toBe(true)
  })

  test('is not last month', () => {
    expect(isLastMonth(dayjs())).toBe(false)
  })
})

describe('test this year', () => {
  test('is this year', () => {
    expect(isThisYear(dayjs())).toBe(true)
  })

  test('is not this year and before', () => {
    expect(isThisYear(dayjs().subtract(1, 'year'))).toBe(false)
  })

  test('is not this year and after', () => {
    expect(isThisYear(dayjs().add(1, 'year'))).toBe(false)
  })
})

describe('test last year', () => {
  test('is last year', () => {
    expect(isLastYear(dayjs().subtract(1, 'year'))).toBe(true)
  })

  test('is not last year', () => {
    expect(isLastYear(dayjs())).toBe(false)
  })
})

describe('test long ago', () => {
  test('is long ago', () => {
    expect(isLongAgo(dayjs().subtract(2, 'year'))).toBe(true)
  })

  test('is not long ago', () => {
    expect(isLongAgo(dayjs())).toBe(false)
  })
})
