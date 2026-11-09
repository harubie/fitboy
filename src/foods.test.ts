import { describe, expect, it } from 'vitest'
import { deleteFood, foodCatalog, foodTotals, isSavedFood, nutritionNumber, recentFoodMeals, kilojoulesToCalories } from './foods'
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
  it('deletes saved foods and keeps same-name history out of reusable lists without changing logs', () => {
    const data = defaultData()
    data.savedFoods = [egg, sauce]
    data.meals = [
      { id: 'old', date: '2026-10-20', name: ' my EGGS ', calories: 210, protein: 18 },
      { id: 'new', date: '2026-10-21', name: 'My eggs', calories: 140, protein: 12 },
    ]
    const next = deleteFood(data, egg)
    expect(foodCatalog(next)).toEqual([sauce])
    expect(recentFoodMeals(next)).toEqual([])
    expect(next.meals).toBe(data.meals)
    expect(next.routine).toBe(data.routine)
    expect(data.savedFoods).toEqual([egg, sauce])
    expect(foodCatalog(JSON.parse(JSON.stringify(next)))).toEqual([sauce])
  })
  it('deletes historical meals from All foods without removing daily entries', () => {
    const data = defaultData()
    data.meals = [{ id: 'old', date: '2026-10-20', name: 'Beef bowl', calories: 700, protein: 45 }]
    const next = deleteFood(data, foodCatalog(data)[0])
    expect(foodCatalog(next)).toEqual([])
    expect(recentFoodMeals(next)).toEqual([])
    expect(next.meals).toEqual(data.meals)
  })
  it('fills recent slots with available foods rather than deleted entries', () => {
    const data = defaultData()
    data.meals = Array.from({ length: 10 }, (_, i) => ({
      id: String(i), name: `Food ${i}`, date: '2026-10-30', calories: 100, protein: 10,
    }))
    const last = foodCatalog(data).find((food) => food.name === 'Food 9')!
    const next = deleteFood(data, last)
    expect(recentFoodMeals(next).map((meal) => meal.name)).toEqual([
      'Food 8', 'Food 7', 'Food 6', 'Food 5', 'Food 4', 'Food 3', 'Food 2', 'Food 1',
    ])
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
    expect(isSavedFood({ ...egg, deleted: true })).toBe(true)
    for (const food of [null, { ...egg, serving: 0 }, { ...egg, unit: 'unknown' }, { ...egg, protein: -1 }, { ...egg, name: ' ' }, { ...egg, deleted: 'yes' }]) {
      expect(isSavedFood(food)).toBe(false)
    }
  })
})

describe('kilojoules to food calories', () => {
  it('uses 4.184 kJ per kcal without rounding the calculation', () => {
    expect(kilojoulesToCalories('418.4')).toBeCloseTo(100)
    expect(kilojoulesToCalories('2000')).toBeCloseTo(478.011472)
    expect(kilojoulesToCalories('0')).toBe(0)
    expect(kilojoulesToCalories('4.184')).toBe(1)
  })
  it('does not present blank, negative or non-finite input as a conversion', () => {
    for (const input of ['', ' ', '-1', 'Infinity', 'NaN', 'abc', '1e309']) {
      expect(kilojoulesToCalories(input)).toBeUndefined()
    }
  })
})
