import { describe, expect, test } from 'vitest'

import { isLink } from '@/utils/isLink'

describe('test isLink', () => {
  test('http', () => {
    expect(isLink('http://x.y.z')).toBe(true)
    expect(isLink('ftp://')).toBe(false)
    expect(isLink('dark')).toBe(false)
  })

  test('https', () => {
    expect(isLink('https://x.y.z')).toBe(true)
    expect(isLink('ftp: ')).toBe(false)
    expect(isLink('dark')).toBe(false)
  })
})
