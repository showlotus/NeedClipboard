import { describe, expect, test } from 'vitest'
import dayjs from 'dayjs'
import {
  isLastWeek,
  isThisMonth,
  isThisWeek,
  isToday,
  isYesterday
} from '../src/utils/date'

describe('test date validate', () => {
  test('😀 is today', () => {
    expect(isToday(dayjs())).toBe(true)
  })

  test('🙁 is not today and before', () => {
    expect(isToday(dayjs().subtract(1, 'day'))).toBe(false)
  })

  test('🙁 is not today and after', () => {
    expect(isToday(dayjs().add(1, 'day'))).toBe(false)
  })

  test('😀 is yesterday', () => {
    expect(isYesterday(dayjs().subtract(1, 'day'))).toBe(true)
  })

  test('😀 is yesterday with time is 00:00:00', () => {
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

  test('😀 is yesterday with time is 23:59:59', () => {
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

  test('🙁 is not yesterday and before', () => {
    expect(isYesterday(dayjs().subtract(1, 'day').subtract(1, 'day'))).toBe(
      false
    )
  })

  test('🙁 is not yesterday and after', () => {
    expect(isYesterday(dayjs())).toBe(false)
  })

  test('😀 is this week', () => {
    expect(isThisWeek(dayjs())).toBe(true)
  })

  test('😀 is this week at monday with time is 00:00:00', () => {
    expect(
      isThisWeek(
        dayjs()
          .subtract(dayjs().get('day') - 1, 'day')
          .set('hour', 0)
          .set('minute', 0)
          .set('second', 0)
      )
    ).toBe(true)
  })

  test('😀 is this week at sunday with time is 23:59:59', () => {
    expect(
      isThisWeek(
        dayjs()
          .add(7 - dayjs().get('day'), 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
      )
    ).toBe(true)
  })

  test('🙁 is not this week at last sunday with time is 23:59:59', () => {
    expect(
      isThisWeek(
        dayjs()
          .subtract(dayjs().get('day'), 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
      )
    ).toBe(false)
  })

  test('🙁 is not this week at next monday with time is 00:00:00', () => {
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

  test('😀 is last week', () => {
    expect(
      isLastWeek(
        dayjs()
          .subtract(dayjs().get('day'), 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
      )
    ).toBe(true)
  })

  test('😀 is last week at last monday with 00:00:00', () => {
    expect(
      isLastWeek(
        dayjs()
          .subtract(dayjs().get('day') - 1 + 7, 'day')
          .set('hour', 0)
          .set('minute', 0)
          .set('second', 0)
      )
    ).toBe(true)
  })

  test('😀 is last week at last sunday with 23:59:59', () => {
    expect(
      isLastWeek(
        dayjs()
          .subtract(dayjs().get('day'), 'day')
          .set('hour', 23)
          .set('minute', 59)
          .set('second', 59)
      )
    ).toBe(true)
  })

  test('🙁 is not last week at today', () => {
    expect(isLastWeek(dayjs())).toBe(false)
  })

  test('😀 is this month', () => {
    expect(isThisMonth(dayjs())).toBe(true)
  })

  test('😀 is this month', () => {
    expect(isThisMonth(dayjs())).toBe(true)
  })

  test('😀🙁 ', () => {})
})
