import { describe, expect, it } from 'vitest'
import {
  addDays,
  formatSets,
  fullBodyDay,
  lastSets,
  litSegments,
  planStats,
  quickStartPlan,
  recentMeals,
  streak,
  totalsFor,
  workoutRuns,
  isLogDate,
  displayDate,
  weekHeading,
  moveWorkoutDay,
  sharedExerciseLog,
} from './logic'
import type { Meal, Session, WorkoutDay } from './types'

describe('moveWorkoutDay', () => {
  const days: WorkoutDay[] = ['Day 4', 'Day 2', 'Day 3'].map((name) => ({ id: name, name, exercises: [] }))

  it('moves a day upward without modifying the original plans', () => {
    const result = moveWorkoutDay(days, 'Day 2', 0)
    expect(result.map((day) => day.name)).toEqual(['Day 2', 'Day 4', 'Day 3'])
    expect(result[0]).toBe(days[1])
    expect(days.map((day) => day.name)).toEqual(['Day 4', 'Day 2', 'Day 3'])
  })

  it('moves a day downward across multiple plans', () => {
    expect(moveWorkoutDay(days, 'Day 4', 2).map((day) => day.name)).toEqual(['Day 2', 'Day 3', 'Day 4'])
  })

  it('leaves the order unchanged for the same day or a day removed during dragging', () => {
    expect(moveWorkoutDay(days, 'Day 2', 1)).toBe(days)
    expect(moveWorkoutDay(days, 'missing', 1)).toBe(days)
    expect(moveWorkoutDay(days, 'Day 2', -1)).toBe(days)
    expect(moveWorkoutDay(days, 'Day 2', 3)).toBe(days)
    expect(moveWorkoutDay(days, 'Day 2', NaN)).toBe(days)
  })

  it('saves the final position after reversing drag direction, rather than the last crossed card', () => {
    const down = moveWorkoutDay(days, 'Day 4', 2)
    const reversed = moveWorkoutDay(down, 'Day 4', 1)
    const position = reversed.findIndex((day) => day.id === 'Day 4')
    expect(moveWorkoutDay(days, 'Day 4', position)).toEqual(reversed)
    const original = moveWorkoutDay(reversed, 'Day 4', 0)
    expect(moveWorkoutDay(days, 'Day 4', original.findIndex((day) => day.id === 'Day 4'))).toBe(days)
  })
})

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

const routine: WorkoutDay[] = ['a', 'b', 'c'].map((id) => ({
  id,
  name: id,
  exercises: [],
}))

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  describe('display dates', () => {
    it('shows numeric dates as DD/MM/YYYY', () => {
      expect(displayDate('2026-01-09')).toBe('09/01/2026')
    })
    it('uses short month names in week ranges, including year boundaries', () => {
      expect(weekHeading('2026-10-26', '2026-11-01')).toBe('26 Oct – 1 Nov 2026')
      expect(weekHeading('2026-10-19', '2026-10-25')).toBe('19 Oct – 25 Oct 2026')
      expect(weekHeading('2026-12-28', '2027-01-03')).toBe('28 Dec 2026 – 3 Jan 2027')
    })
  })

  describe('isLogDate', () => {
    it('accepts real local dates through today, not invalid or future dates', () => {
      expect(isLogDate('2024-02-29', '2026-10-31')).toBe(true)
      for (const date of ['', '2026-02-30', '2026-13-01', '2026-11-01', '2026-1-01']) {
        expect(isLogDate(date, '2026-10-31')).toBe(false)
      }
    })
  })
})

describe('totalsFor', () => {
  it('sums only the given date', () => {
    const meals = [
      meal('2026-10-26', 'eggs', 300, 20),
      meal('2026-10-26', 'shake', 200, 40),
      meal('2026-10-25', 'x', 999, 99),
    ]
    expect(totalsFor(meals, '2026-10-26')).toEqual({
      calories: 500,
      protein: 60,
    })
  })
})

describe('recentMeals', () => {
  it('dedupes by name, newest first', () => {
    const meals = [meal('1', 'Eggs', 1, 1), meal('2', 'Shake', 1, 1), meal('3', 'eggs', 2, 2)]
    expect(recentMeals(meals).map((m) => m.date)).toEqual(['3', '2'])
  })
})

describe('quickStartPlan', () => {
  it('starts with the first plan when there is no history', () => {
    expect(quickStartPlan(routine, [])?.id).toBe('a')
  })
  it('picks the plan used most recently', () => {
    expect(quickStartPlan(routine, [session('d1', 'a'), session('d2', 'c')])?.id).toBe('c')
  })
  it('ignores sessions for deleted plans', () => {
    expect(quickStartPlan(routine, [session('d1', 'b'), session('d2', 'gone')])?.id).toBe('b')
  })
  it('does not treat a newly entered backdated workout as the latest workout', () => {
    expect(quickStartPlan(routine, [session('2026-10-30', 'c'), session('2026-10-20', 'a')])?.id).toBe('c')
  })
})

describe('planStats', () => {
  it('counts sessions and finds the latest date', () => {
    const sessions = [session('2026-10-20', 'a'), session('2026-10-24', 'a'), session('2026-10-22', 'b')]
    expect(planStats(sessions, 'a')).toEqual({ count: 2, last: '2026-10-24' })
    expect(planStats(sessions, 'c')).toEqual({ count: 0, last: undefined })
  })
})

describe('streak', () => {
  const today = '2026-10-26'
  it('counts consecutive workout/rest days ending today', () => {
    const data = {
      sessions: [session('2026-10-26', 'a'), session('2026-10-24', 'b')],
      checkIns: {
        '2026-10-25': 'rest' as const,
        '2026-10-22': 'workout' as const,
      },
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

describe('workoutRuns', () => {
  it('counts workout days per unbroken run, ignoring rest days', () => {
    const data = {
      sessions: [session('2026-10-26', 'a')],
      checkIns: {
        '2026-10-01': 'workout' as const,
        '2026-10-02': 'rest' as const,
        '2026-10-03': 'workout' as const,
        '2026-10-24': 'workout' as const,
        '2026-10-25': 'rest' as const,
      },
    }
    expect(workoutRuns(data)).toEqual([2, 2])
  })
})

describe('lastSets', () => {
  it('uses the workout date rather than the order of entry', () => {
    expect(lastSets([
      session('2026-10-30', 'a', [{ weight: 60, reps: 8 }]),
      session('2026-10-20', 'a', [{ weight: 20, reps: 10 }]),
    ], 'bench')).toEqual([{ weight: 60, reps: 8 }])
  })

  describe('sharedExerciseLog', () => {
    const squat = { id: 'squat-a', name: 'Cable Crunch', sets: 2, reps: '10' }
    const other = { ...squat, id: 'squat-b', name: '  cable   crunch ' }
    const plans = [
      { id: 'a', name: 'A', exercises: [squat] },
      { id: 'b', name: 'B', exercises: [other] },
    ]
    const log = (id: string, date: string, exerciseId: string, name: string, weights: number[]): Session => ({
      id, date, dayId: id, dayName: `Plan ${id}`,
      entries: [{ exerciseId, exerciseName: name, sets: weights.map((weight) => ({ weight, reps: 10 })) }],
    })

    it('initially selects the heaviest saved session for matching names without changing its sets', () => {
      const sessions = [
        log('old', '2026-01-01', 'squat-a', 'Cable Crunch', [40, 60]),
        log('new', '2026-02-01', 'squat-b', 'cable crunch', [50, 45]),
      ]
      expect(sharedExerciseLog(sessions, squat, plans)).toEqual({
        date: '2026-01-01', dayName: 'Plan old', sets: sessions[0].entries[0].sets, heaviest: true,
      })
      expect(sharedExerciseLog(sessions, other, plans)?.sets).toEqual(sessions[0].entries[0].sets)
    })

    it('uses the latest newly completed workout even when its weight is lighter', () => {
      const sessions = [
        log('old', '2026-01-01', 'squat-a', 'Cable Crunch', [60]),
        { ...log('new', '2026-02-01', 'squat-b', 'Cable Crunch', [50]), sharedExerciseHistory: true },
      ]
      expect(sharedExerciseLog(sessions, squat, plans)).toMatchObject({
        date: '2026-02-01', dayName: 'Plan new', sets: [{ weight: 50, reps: 10 }], heaviest: false,
      })
    })

    it('uses workout dates and then entry order to break ties', () => {
      const old = log('old', '2026-01-01', 'squat-a', 'Cable Crunch', [60])
      const newest = log('new', '2026-02-01', 'squat-b', 'Cable Crunch', [60])
      expect(sharedExerciseLog([newest, old], squat, plans)?.dayName).toBe('Plan new')
      const first = { ...old, date: '2026-03-01', sharedExerciseHistory: true }
      const second = { ...newest, date: '2026-03-01', sharedExerciseHistory: true }
      expect(sharedExerciseLog([first, second], squat, plans)?.dayName).toBe('Plan new')
    })

    it('keeps ordinary single-exercise history sorted by date and ignores unrelated names', () => {
      const sessions = [
        log('old', '2026-01-01', 'squat-a', 'Cable Crunch', [60]),
        log('new', '2026-02-01', 'squat-a', 'Cable Crunch', [40]),
        log('other', '2026-03-01', 'other', 'Cable Fly', [100]),
      ]
      expect(sharedExerciseLog(sessions, squat, [plans[0]])?.sets).toEqual([{ weight: 40, reps: 10 }])
    })

    it('does not combine different measurement types or unfinished sets', () => {
      const incompatible: Session = {
        ...log('timed', '2026-03-01', 'other', 'Cable Crunch', [100]),
        entries: [{ exerciseId: 'other', exerciseName: 'Cable Crunch', measurement: 'minutes', sets: [{ weight: 100, reps: 10 }] }],
      }
      expect(sharedExerciseLog([incompatible, log('empty', '2026-04-01', 'squat-b', 'Cable Crunch', [])], squat, plans)).toBeUndefined()
    })
  })
  it('returns sets from the most recent session with that exercise', () => {
    const sessions = [session('d1', 'a', [{ weight: 60, reps: 8 }]), session('d2', 'a', [{ weight: 62.5, reps: 6 }])]
    expect(lastSets(sessions, 'bench')).toEqual([{ weight: 62.5, reps: 6 }])
    expect(lastSets(sessions, 'squat')).toBeUndefined()
  })
})

describe('formatSets', () => {
  it('shows weight, bodyweight and timed sets', () => {
    expect(formatSets([{ weight: 20, reps: 10 }], 'kg')).toBe('20kg×10')
    expect(formatSets([{ weight: 0, reps: 12 }], 'kg')).toBe('BW×12')
    expect(
      formatSets(
        [
          { weight: 0, reps: 30 },
          { weight: 5, reps: 45 },
        ],
        'kg',
        true,
      ),
    ).toBe('30s, 5kg×45s')
  })
})

describe('fullBodyDay', () => {
  it('has the 7 exercises with rest times and a timed plank', () => {
    const day = fullBodyDay()
    expect(day.exercises).toHaveLength(7)
    expect(day.exercises.every((e) => e.rest && e.cue && e.target && e.effort)).toBe(true)
    expect(day.exercises.filter((e) => e.timed).map((e) => e.name)).toEqual(['Plank'])
  })
})


describe('litSegments', () => {
  it('is empty with no intake or no goal', () => {
    expect(litSegments(0, 150, 12)).toBe(0)
    expect(litSegments(50, 0, 12)).toBe(0)
  })
  it('lights at least one segment once anything is logged', () => {
    expect(litSegments(1, 2500, 15)).toBe(1)
  })
  it('scales proportionally and caps at the segment count', () => {
    expect(litSegments(75, 150, 12)).toBe(6)
    expect(litSegments(400, 150, 12)).toBe(12)
  })
})
