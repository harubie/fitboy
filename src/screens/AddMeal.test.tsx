import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { defaultData } from '../logic'
import { AddMeal } from './AddMeal'
import { SessionScreen } from './SessionScreen'
import { Workouts } from './Workouts'

it('offers both food paths and keeps calories first without fabricated food values', () => {
  const html = renderToStaticMarkup(<AddMeal data={defaultData()} setData={() => {}} onDone={() => {}} />)
  expect(html).toContain('Quick total')
  expect(html).toContain('Build a meal')
  expect(html).toContain('These numbers are an estimate')
  expect(html.indexOf('Calories<input')).toBeLessThan(html.indexOf('Protein (g)<input'))
  expect(html).not.toContain('70 kcal')
})

it('retains the selected backdate in food and session forms', () => {
  const data = defaultData()
  const props = { data, setData: () => {}, onDone: () => {}, initialDate: '2026-01-01' }
  for (const screen of [
    <AddMeal key="food" {...props} />,
    <SessionScreen key="workout" {...props} day={data.routine[0]} onGuide={() => {}} />,
  ]) {
    const html = renderToStaticMarkup(screen)
    expect(html).toContain('Logging for 01/01/2026')
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('Yesterday')
    expect(html).not.toContain('Pick date')
  }
})

it('allows correcting existing workout dates and displays history in date order', () => {
  const data = defaultData()
  data.sessions = ['2026-10-30', '2026-10-20'].map((date) => ({
    id: date, date, dayId: data.routine[0].id, dayName: 'My plan', entries: [],
  }))
  const html = renderToStaticMarkup(<Workouts data={data} setData={() => {}}
    onStart={() => {}} onEdit={() => {}} onGuide={() => {}} />)
  expect(html.match(/>Change date<\/button>/g)).toHaveLength(2)
  expect(html.indexOf('30/10/2026 ·')).toBeLessThan(html.indexOf('20/10/2026 ·'))
})
