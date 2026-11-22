import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { defaultData } from '../logic'
import { Workouts } from './Workouts'

it('offers named keyboard-accessible drag handles in the saved workout-day order', () => {
  const data = defaultData()
  data.routine = ['Day 4', 'Day 2'].map((name) => ({ id: name, name, exercises: [] }))
  const html = renderToStaticMarkup(
    <Workouts data={data} setData={() => {}} onStart={() => {}} onEdit={() => {}} onGuide={() => {}} />,
  )
  expect(html).toContain('aria-label="Reorder Day 4"')
  expect(html).toContain('aria-label="Reorder Day 2"')
  expect(html).toContain('aria-describedby="plan-reorder-help"')
  expect(html.indexOf('<h2>Day 4</h2>')).toBeLessThan(html.indexOf('<h2>Day 2</h2>'))
})

it('does not offer reordering when there is only one workout day', () => {
  const html = renderToStaticMarkup(
    <Workouts data={defaultData()} setData={() => {}} onStart={() => {}} onEdit={() => {}} onGuide={() => {}} />,
  )
  expect(html).not.toContain('aria-label="Reorder ')
})

it('offers recovery for a draft even when its plan was deleted', () => {
  const data = defaultData()
  data.workoutDrafts = [{ day: data.routine[0], date: '2026-01-01', rows: {} }]
  data.routine = []
  const html = renderToStaticMarkup(
    <Workouts data={data} setData={() => {}} onStart={() => {}} onEdit={() => {}} onGuide={() => {}} />,
  )
  expect(html).toContain('Unfinished workouts')
  expect(html).toContain(data.workoutDrafts[0].day.name)
  expect(html).toContain('Logging for 01/01/2026')
  expect(html).toContain('>Resume</button>')
  expect(html).toContain('>Discard</button>')
})
