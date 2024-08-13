// @vitest-environment jsdom

import { describe, expect, test } from 'vitest'
import { isValidColorString } from '../src/utils/isValidColorString'

describe('test name-color', () => {
  test('cyan', () => {
    expect(isValidColorString('cyan')).toBe(true)
  })

  test('blue', () => {
    expect(isValidColorString('blue ')).toBe(true)
  })

  test('dark', () => {
    expect(isValidColorString('dark')).toBe(false)
  })
})

describe('test rgb', () => {
  test('rgb(2,2,2)', () => {
    expect(isValidColorString(' rgb(2,2,2) ')).toBe(true)
  })

  test('rgb(256,2,2)', () => {
    expect(isValidColorString(' rgb(256,2,2) ')).toBe(true)
  })
})

describe('test hex', () => {
  test('#fff', () => {
    expect(isValidColorString('#fff')).toBe(true)
  })

  test('#313131', () => {
    expect(isValidColorString('#313131')).toBe(true)
  })

  test('#ggg', () => {
    expect(isValidColorString('#ggg')).toBe(false)
  })
})

describe('test hsl', () => {
  test('hsl(200, 10%, 50%)', () => {
    expect(isValidColorString(' hsl(200, 10%, 50%) ')).toBe(true)
  })

  test('hsl(200, 100%, 50%)', () => {
    expect(isValidColorString(' hsl(200, 100%, 50%) ')).toBe(true)
  })

  test('hsl(200, 101%, 0%)', () => {
    expect(isValidColorString(' hsl(200, 10, 0%) ')).toBe(false)
  })
})
