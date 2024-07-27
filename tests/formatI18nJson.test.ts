import { describe, expect, test } from 'vitest'
import { formatI18nJson } from '../src/i18n'

describe('formatI18nJson', () => {
  test('empty object', () => {
    expect(formatI18nJson({})).toEqual({})
  })

  test('single key', () => {
    const data = {
      hello: {
        zh_CN: '你好',
        en_US: 'Hello'
      }
    }
    expect(formatI18nJson(data)).toEqual({
      zh_CN: {
        hello: '你好'
      },
      en_US: {
        hello: 'Hello'
      }
    })
  })

  test('multiple key', () => {
    const data = {
      hello: {
        zh_CN: '你好',
        en_US: 'Hello'
      },
      morning: {
        zh_CN: '早上好',
        en_US: 'Good Morning'
      }
    }
    expect(formatI18nJson(data)).toEqual({
      zh_CN: {
        hello: '你好',
        morning: '早上好'
      },
      en_US: {
        hello: 'Hello',
        morning: 'Good Morning'
      }
    })
  })
})
