import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { defaultData } from '../logic'
import type { Exercise, Session } from '../types'
import { SessionScreen } from './SessionScreen'

const exercise: Exercise = { id: 'squat', name: 'Squat', sets: 3, reps: '8-12' }
const history = (date: string, sets: Session['entries'][number]['sets']): Session => ({
  id: date, date, dayId: 'legs', dayName: 'Legs',
  entries: [{ exerciseId: exercise.id, exerciseName: exercise.name, sets }],
})

function render(ex = exercise, sessions: Session[] = [], unit: 'kg' | 'lb' = 'kg') {
  const data = defaultData()
  data.sessions = sessions
  data.settings.unit = unit
  return renderToStaticMarkup(
    <SessionScreen day={{ id: 'legs', name: 'Legs', exercises: [ex] }} data={data}
      setData={() => {}} onDone={() => {}} onGuide={() => {}} />,
  )
}

it('shows a dated last-session snapshot above today using the latest completed exercise, not entry order', () => {
  const html = render(exercise, [
    history('2026-11-08', [{ weight: 60, reps: 10 }, { weight: 65, reps: 8 }]),
    history('2026-11-09', []),
    history('2026-11-01', [{ weight: 40, reps: 6 }]),
  ])
  expect(html).toContain('Last session')
  expect(html).toContain('dateTime="2026-11-08">08/11/2026</time>')
  expect(html).toContain('aria-label="Squat last session"')
  expect(html).toContain('>Today</h3>')
  expect(html.indexOf('Last session')).toBeLessThan(html.indexOf('>Today</h3>'))
  expect(html).not.toContain('>Previous</span>')
  expect(html).toContain('aria-label="Squat set 1 previous: 60kg×10 reps"')
  expect(html).toContain('aria-label="Squat set 2 previous: 65kg×8 reps"')
  expect(html).not.toContain('Squat set 3 previous:')
  expect(html).toMatch(/aria-label="Squat set 1 weight"[^>]*value="60"/)
  expect(html).toMatch(/aria-label="Squat set 1 reps"[^>]*value=""/)
  expect(html).toContain('Enter reps, time or distance to log sets')
})

it('explains when an exercise has no previous history', () => {
  const html = render()
  expect(html).toContain('No previous sets yet.')
  expect(html).not.toContain('class="last-session"')
})

it('shows every historical set even when the current target has fewer sets', () => {
  const sets = Array.from({ length: 6 }, (_, i) => ({ weight: 40 + i, reps: 10 - i }))
  const html = render({ ...exercise, sets: 2 }, [history('2026-11-08', sets)])
  expect(html).toContain('aria-label="Squat set 6 previous: 45kg×5 reps"')
  expect(html).toMatch(/aria-label="Squat set 6 weight"[^>]*value="45"/)
})

it.each([
  [{ ...exercise, timed: true }, { weight: 0, reps: 30 }, '30s'],
  [{ ...exercise, measurement: 'minutes' as const }, { weight: 0, reps: 20 }, '20min'],
  [{ ...exercise, measurement: 'metres' as const }, { weight: 15, reps: 40 }, '15lb×40m'],
  [exercise, { weight: 0, reps: 12 }, 'BW×12 reps'],
])('keeps previous values appropriate for the exercise and weight unit', (ex, set, expected) => {
  const html = render(ex, [history('2026-11-08', [set])], 'lb')
  expect(html).toContain(`aria-label="Squat set 1 previous: ${expected}"`)
})
