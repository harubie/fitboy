import { describe, expect, it } from 'vitest'
import { addDays, lastSets, nextWorkout, recentMeals, streak, totalsFor } from './logic'
import type { Meal, Session, WorkoutDay } from './types'

const meal = (date: string, name: string, calories: number, protein: number): Meal => ({
  id: name + date,
  date,
  name,
  calories,
  protein,
})

const session = (date: string, dayId: string, sets: Session['entries'][0]['sets'] = []): Session => ({
  id: date + dayId,
  date,
  dayId,
  dayName: dayId,
  entries: [{ exerciseId: 'bench', exerciseName: 'Bench', sets }],
})

const routine: WorkoutDay[] = ['a', 'b', 'c'].map((id) => ({ id, name: id, exercises: [] }))

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })
})

describe('totalsFor', () => {
  it('sums only the given date', () => {
    const meals = [meal('2026-10-26', 'eggs', 300, 20), meal('2026-10-26', 'shake', 200, 40), meal('2026-10-25', 'x', 999, 99)]
    expect(totalsFor(meals, '2026-10-26')).toEqual({ calories: 500, protein: 60 })
  })
})

describe('recentMeals', () => {
  it('dedupes by name, newest first', () => {
    const meals = [meal('1', 'Eggs', 1, 1), meal('2', 'Shake', 1, 1), meal('3', 'eggs', 2, 2)]
    expect(recentMeals(meals).map((m) => m.date)).toEqual(['3', '2'])
  })
})

describe('nextWorkout', () => {
  it('starts at the first day with no history', () => {
    expect(nextWorkout(routine, [])?.id).toBe('a')
  })
  it('rotates after the last session and wraps around', () => {
    expect(nextWorkout(routine, [session('d1', 'a')])?.id).toBe('b')
    expect(nextWorkout(routine, [session('d1', 'a'), session('d2', 'c')])?.id).toBe('a')
  })
  it('ignores sessions for deleted days', () => {
    expect(nextWorkout(routine, [session('d1', 'b'), session('d2', 'gone')])?.id).toBe('c')
  })
})

describe('streak', () => {
  const today = '2026-10-26'
  it('counts consecutive workout/rest days ending today', () => {
    const data = {
      sessions: [session('2026-10-26', 'a'), session('2026-10-24', 'b')],
      checkIns: { '2026-10-25': 'rest' as const, '2026-10-22': 'workout' as const },
    }
    expect(streak(data, today)).toBe(3)
  })
  it('keeps yesterday’s streak alive if today is not logged yet', () => {
    expect(streak({ sessions: [], checkIns: { '2026-10-25': 'workout' } }, today)).toBe(1)
  })
  it('is zero when nothing logged recently', () => {
    expect(streak({ sessions: [], checkIns: { '2026-10-20': 'workout' } }, today)).toBe(0)
  })
})

describe('lastSets', () => {
  it('returns sets from the most recent session with that exercise', () => {
    const sessions = [session('d1', 'a', [{ weight: 60, reps: 8 }]), session('d2', 'a', [{ weight: 62.5, reps: 6 }])]
    expect(lastSets(sessions, 'bench')).toEqual([{ weight: 62.5, reps: 6 }])
    expect(lastSets(sessions, 'squat')).toBeUndefined()
  })
})
