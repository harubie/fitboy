import { describe, expect, it } from 'vitest'
import { foodCatalog, foodTotals, isSavedFood, nutritionNumber } from './foods'
import { defaultData } from './logic'
import type { SavedFood } from './types'

const egg: SavedFood = { id: 'egg', name: 'My eggs', unit: 'eggs', serving: 1, calories: 70, protein: 6, pinned: true }
const sauce: SavedFood = { id: 'sauce', name: 'My sauce', unit: 'tbsp', serving: 1, calories: 20, protein: 0, pinned: false }

describe('food catalog', () => {
  it('keeps all historical foods available, including more than eight, without guessing nutrition', () => {
    const data = defaultData()
    data.meals = Array.from({ length: 20 }, (_, i) => ({
      id: String(i), name: `Food ${i}`, date: '2026-10-30', calories: i + 1, protein: i,
    }))
    const catalog = foodCatalog(data)
    expect(catalog).toHaveLength(20)
    expect(catalog.find((food) => food.name === 'Food 0')).toMatchObject({ calories: 1, protein: 0, serving: 1, unit: 'servings' })
  })
  it('uses an explicitly saved food over an old meal with the same name', () => {
    const data = defaultData()
    data.savedFoods = [egg]
    data.meals = [{ id: 'old', date: '2026-10-20', name: ' my EGGS ', calories: 210, protein: 18 }]
    expect(foodCatalog(data)).toEqual([egg])
  })
})

describe('food totals', () => {
  it('scales eggs and half a tablespoon of sauce without rounding each ingredient', () => {
    expect(foodTotals([{ food: egg, amount: 3 }, { food: sauce, amount: 0.5 }])).toEqual({ calories: 220, protein: 18 })
  })
  it('supports grams and preserves fractional protein', () => {
    expect(foodTotals([{ food: { ...egg, unit: 'g', serving: 100, calories: 90, protein: 12.5 }, amount: 50 }]))
      .toEqual({ calories: 45, protein: 6.25 })
  })
  it('rejects non-positive, non-finite amounts and overflowing totals', () => {
    for (const amount of [0, -1, NaN, Infinity, Number.MAX_VALUE]) {
      expect(() => foodTotals([{ food: egg, amount }])).toThrow()
    }
  })
})

describe('nutrition validation', () => {
  it('allows one missing nutrient as zero, but rejects negative or non-finite input', () => {
    expect(nutritionNumber('')).toBe(0)
    expect(nutritionNumber('12.5')).toBe(12.5)
    for (const input of ['-1', 'NaN', 'Infinity', 'abc']) expect(nutritionNumber(input)).toBeUndefined()
  })
  it('validates saved foods from backups', () => {
    expect(isSavedFood(egg)).toBe(true)
    for (const food of [null, { ...egg, serving: 0 }, { ...egg, unit: 'unknown' }, { ...egg, protein: -1 }, { ...egg, name: ' ' }]) {
      expect(isSavedFood(food)).toBe(false)
    }
  })
})
