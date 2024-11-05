import {describe, expect, test} from 'vitest'
import { sum } from '../src/sum.js'

describe('sum', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3)
  })

  test('adds 2 + 2 to equal 4', () => {
    expect(sum(2, 2)).toBe(4)
  })

  test('adds 3 + 2 to equal 5', () => {
    expect(sum(3, 2)).toBe(5)
  })
});
