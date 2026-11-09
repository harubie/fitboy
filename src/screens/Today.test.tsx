import { expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { defaultData, dateKey } from '../logic'
import { Today } from './Today'
import { SettingsScreen } from './SettingsScreen'
import { MonstersScreen } from './MonstersScreen'
import { initialMonsters } from '../monsters'

it.each([
  [2026, 9, 26],
  [2026, 10, 1],
  [2027, 0, 1],
])('shows Monday through Sunday for local date %i-%i-%i', (year, month, day) => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(year, month, day, 12))
  try {
    const html = renderToStaticMarkup(
      <Today
        data={defaultData()}
        setData={() => {}}
        onAddMeal={() => {}}
        onStartWorkout={() => {}}
        onOpenMonsters={() => {}}
      />,
    )
    const labels = [...html.matchAll(/class="week-day[^"]*"[^>]*><span class="muted small">([^<]+)<\/span>/g)].map(
      (match) => match[1],
    )
    const monday = new Date(2026, 9, 26)
    expect(labels).toEqual(
      Array.from({ length: 7 }, (_, i) =>
        new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i).toLocaleDateString(undefined, {
          weekday: 'short',
        }),
      ),
    )
    expect(html.match(/aria-current="date"/g)).toHaveLength(1)
  } finally {
    vi.useRealTimers()
  }
})

it('encourages starting a streak at zero and shows the count after a workout', () => {
  const data = defaultData()
  const props = { setData: () => {}, onAddMeal: () => {}, onStartWorkout: () => {}, onOpenMonsters: () => {} }
  const empty = renderToStaticMarkup(<Today data={data} {...props} />)
  expect(empty).toContain('Start your streak!')
  expect(empty).not.toContain('0 day streak')
  expect(empty).not.toContain('Feed the beast')
  expect(empty).toContain('aria-label="Your companion"')
  expect(empty).toContain('aria-label="Workout and check-in"')
  expect(empty.indexOf('Your companion')).toBeLessThan(empty.indexOf('Workout and check-in'))
  expect(empty).toContain('Start workout')
  expect(empty).not.toContain('What are stars?')
  data.checkIns[dateKey(new Date())] = 'workout'
  const active = renderToStaticMarkup(<Today data={data} {...props} />)
  expect(active).toContain('1 day streak')
  expect(active).not.toContain('Start your streak!')
})

it('labels the compact destructive button clearly for assistive technology', () => {
  const html = renderToStaticMarkup(<SettingsScreen data={defaultData()} setData={() => {}} />)
  expect(html).toContain('class="reset-button" aria-label="Reset all data"')
  expect(html).toContain('>Reset</button>')
  expect(html).not.toContain('Reset everything')
})

it('keeps monster details and star progress in the Lair instead of the home hero', () => {
  const data = defaultData()
  data.monsters = initialMonsters(data, dateKey())
  const home = renderToStaticMarkup(
    <Today data={data} setData={() => {}} onAddMeal={() => {}} onStartWorkout={() => {}} onOpenMonsters={() => {}} />,
  )
  expect(home).toContain('Your first workout hatches it.')
  expect(home).not.toContain('What are stars?')
  const lair = renderToStaticMarkup(<MonstersScreen data={data} setData={() => {}} onDone={() => {}} />)
  expect(lair).toContain('What are stars?')
  expect(lair).toContain('workouts to next star')
  expect(lair).toContain('Rest days keep it warm')
})

it('puts the companion before nutrition and keeps a single floating food action', () => {
  const data = defaultData()
  data.monsters = initialMonsters(data, dateKey())
  const html = renderToStaticMarkup(
    <Today data={data} setData={() => {}} onAddMeal={() => {}} onStartWorkout={() => {}} onOpenMonsters={() => {}} />,
  )
  expect(html.indexOf('Your companion')).toBeLessThan(html.indexOf('aria-label="Protein"'))
  expect(html.indexOf('aria-label="Protein"')).toBeLessThan(html.indexOf('Workout and check-in'))
  expect(html).toContain('class="card companion-card companion-hero"')
  expect(html).toContain('class="day-navigation" aria-label="Choose a day"')
  expect(html).not.toContain('class="card day-navigation"')
  expect(html.match(/aria-label="Add meal"/g)).toHaveLength(1)
  expect(html).toMatch(/<button class="fab" aria-label="Add meal">\+<\/button>/)
})

it.each(['pixel', 'bars', 'classic'] as const)('preserves %s meters and the selected past day', (meterStyle) => {
  const data = defaultData()
  data.settings.meterStyle = meterStyle
  data.meals = [
    { id: 'past', date: '2026-01-01', name: 'Beef bowl', calories: 650, protein: 45 },
    { id: 'today', date: dateKey(), name: 'Today food', calories: 400, protein: 30 },
  ]
  const html = renderToStaticMarkup(
    <Today data={data} setData={() => {}} initialDate="2026-01-01"
      onAddMeal={() => {}} onStartWorkout={() => {}} onOpenMonsters={() => {}} />,
  )
  expect(html).toContain('Daily log')
  expect(html).toContain('Beef bowl')
  expect(html).not.toContain('Today food')
  expect(html).toContain('aria-label="Protein" aria-valuenow="45"')
  expect(html).toContain(meterStyle === 'bars' ? 'class="stats"' : 'class="gauges"')
  expect(html).toContain('aria-label="Add meal"')
  expect(html).toContain('Previous week')
})

it('keeps rest-day feedback and the no-plan state available', () => {
  const data = defaultData()
  const props = { setData: () => {}, onAddMeal: () => {}, onStartWorkout: () => {}, onOpenMonsters: () => {} }
  data.routine = []
  expect(renderToStaticMarkup(<Today data={data} {...props} />)).toContain('Create a workout plan in Dojo')
  data.checkIns[dateKey()] = 'rest'
  const html = renderToStaticMarkup(<Today data={data} {...props} />)
  expect(html).toContain('Rest day')
  expect(html).toContain('Undo')
  expect(html).not.toContain('Start workout')
})
