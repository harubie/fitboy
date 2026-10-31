import { recentMeals } from './logic'
import type { AppData, FoodUnit, SavedFood } from './types'

export const FOOD_UNITS: FoodUnit[] = ['servings', 'g', 'tbsp', 'tsp', 'eggs', 'scoops']
export type Ingredient = { food: SavedFood; amount: number }
const nameKey = (name: string) => name.trim().toLowerCase()

export function nutritionNumber(input: string): number | undefined {
  const value = Number(input)
  return Number.isFinite(value) && value >= 0 ? value : undefined
}

export function isSavedFood(value: unknown): value is SavedFood {
  if (!value || typeof value !== 'object') return false
  const food = value as Record<string, unknown>
  return typeof food.id === 'string' && food.id.trim().length > 0
    && typeof food.name === 'string' && food.name.trim().length > 0
    && FOOD_UNITS.some((unit) => unit === food.unit)
    && typeof food.serving === 'number' && Number.isFinite(food.serving) && food.serving > 0
    && typeof food.calories === 'number' && Number.isFinite(food.calories) && food.calories >= 0
    && typeof food.protein === 'number' && Number.isFinite(food.protein) && food.protein >= 0
    && typeof food.pinned === 'boolean'
    && (food.estimated === undefined || typeof food.estimated === 'boolean')
}

/** Old meal totals are reusable as one serving, never inferred as per-ingredient nutrition. */
export function foodCatalog(data: Pick<AppData, 'savedFoods' | 'meals'>): SavedFood[] {
  const saved = data.savedFoods ?? []
  const names = new Set(saved.map((food) => nameKey(food.name)))
  return [...saved, ...recentMeals(data.meals, data.meals.length)
    .filter((meal) => !names.has(nameKey(meal.name)))
    .map((meal): SavedFood => ({
      id: `meal:${meal.id}`, name: meal.name, unit: 'servings', serving: 1,
      calories: meal.calories, protein: meal.protein, estimated: meal.estimated, pinned: false,
    }))]
}

export function foodTotals(items: Ingredient[]) {
  const totals = items.reduce((total, { food, amount }) => {
    if (!isSavedFood(food) || !Number.isFinite(amount) || amount <= 0) throw new Error('Choose a positive, finite food amount.')
    return {
      calories: total.calories + food.calories * (amount / food.serving),
      protein: total.protein + food.protein * (amount / food.serving),
    }
  }, { calories: 0, protein: 0 })
  if (!Number.isFinite(totals.calories) || !Number.isFinite(totals.protein)) throw new Error('Food amounts are too large.')
  return totals
}
