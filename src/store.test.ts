import { afterEach, expect, it, vi } from 'vitest'
import { defaultData } from './logic'
import { loadData } from './store'
import type { SavedFood } from './types'

afterEach(() => vi.unstubAllGlobals())

it('loads older backups without a food library and preserves their history', () => {
  const data = defaultData()
  data.meals = [{ id: 'old', date: '2026-10-30', name: 'Eggs', calories: 210, protein: 18 }]
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(data) })
  expect(loadData().meals).toEqual(data.meals)
  expect(loadData().savedFoods).toBeUndefined()
})

it('round-trips reusable servings, pins and estimated meals', () => {
  const food: SavedFood = { id: 'sauce', name: 'My sauce', serving: 1, unit: 'tbsp', calories: 20, protein: 0, pinned: true }
  const data = { ...defaultData(), savedFoods: [food], meals: [{
    id: 'meal', date: '2026-10-30', name: 'Sauce', calories: 10, protein: 0, estimated: true,
    ingredients: [{ foodId: food.id, name: food.name, amount: 0.5, unit: food.unit }],
  }] }
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(data) })
  expect(loadData()).toEqual(data)
})

it('reports an invalid library without dropping meal or workout history', () => {
  const data = { ...defaultData(), savedFoods: [{ serving: 0 }] }
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(data) })
  const alert = vi.fn()
  vi.stubGlobal('alert', alert)
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    const loaded = loadData()
    expect(loaded.savedFoods).toEqual([])
    expect(loaded.routine).toEqual(data.routine)
    expect(loaded.meals).toEqual(data.meals)
    expect(alert).toHaveBeenCalledOnce()
    expect(log).toHaveBeenCalledOnce()
  } finally { log.mockRestore() }
})
