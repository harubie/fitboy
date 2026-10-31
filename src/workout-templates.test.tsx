import { describe, expect, it } from 'vitest'
import { workoutTemplates } from './workout-templates'
import { defaultData, formatSets } from './logic'
import { renderToStaticMarkup } from 'react-dom/server'
import { PlanEditor } from './screens/PlanEditor'
import { SessionScreen } from './screens/SessionScreen'
import { Workouts } from './screens/Workouts'

describe('workout templates', () => {
  it('keeps the existing full-body template and adds six named days with every exercise', () => {
    expect(workoutTemplates).toHaveLength(7)
    const days = workoutTemplates.slice(1).map((template) => template.create())
    expect(days.map((day) => day.name)).toEqual([
      'Day 1: Chest & Triceps', 'Day 2: Back & Biceps', 'Day 3: Shoulders & Abs',
      'Day 4: Legs & Cardio', 'Day 5: Full-Body Retargeting', 'Day 6: Hybrid Routine & Conditioning',
    ])
    expect(days.map((day) => day.exercises.length)).toEqual([8, 8, 7, 6, 5, 4])
    expect(days[0].exercises[0]).toMatchObject({ name: 'Incline Dumbbell Press', sets: 3, reps: '8-10' })
    expect(days[0].exercises[7]).toMatchObject({ name: 'Bodyweight Dips', reps: 'failure' })
    expect(days[2].exercises[1]).toMatchObject({ sets: 4, reps: '12-15' })
    expect(days[4].note).toContain('Upper Chest')
    expect(days[0].exercises[6].cue).toContain('dumbbell kickbacks')
  })
  it('creates independent plan and exercise ids each time', () => {
    for (const template of workoutTemplates) {
      const first = template.create()
      const second = template.create()
      expect(first.id).not.toBe(second.id)
      expect(first.exercises.map((exercise) => exercise.id)).not.toEqual(second.exercises.map((exercise) => exercise.id))
      first.exercises[0].name = 'Edited'
      expect(second.exercises[0].name).not.toBe('Edited')
    }
  })
  it('represents cardio in minutes and walks in metres, not reps or seconds', () => {
    const legs = workoutTemplates[4].create()
    expect(legs.exercises[5]).toMatchObject({ sets: 1, reps: '20-30', measurement: 'minutes' })
    const hybrid = workoutTemplates[6].create()
    expect(hybrid.exercises[2]).toMatchObject({ sets: 3, reps: '50', measurement: 'metres' })
    expect(hybrid.exercises[3]).toMatchObject({ sets: 1, reps: '20-30', measurement: 'minutes' })
    expect(formatSets([{ weight: 20, reps: 50 }], 'kg', false, 'metres')).toBe('20kg×50m')
    expect(formatSets([{ weight: 0, reps: 25 }], 'kg', false, 'minutes')).toBe('25min')
  })
  it('lists every template in the new-plan editor', () => {
    const html = renderToStaticMarkup(<PlanEditor data={defaultData()} setData={() => {}} onDone={() => {}} />)
    for (const template of workoutTemplates) expect(html).toContain(template.name.replaceAll('&', '&amp;'))
  })
  it('labels session targets and history with distance and minute units', () => {
    const data = defaultData()
    const day = workoutTemplates[6].create()
    data.routine = [day]
    data.sessions = [{
      id: 'hybrid', date: '2026-10-31', dayId: day.id, dayName: day.name,
      entries: [
        { exerciseId: day.exercises[2].id, exerciseName: day.exercises[2].name, measurement: 'metres', sets: [{ weight: 20, reps: 50 }] },
        { exerciseId: day.exercises[3].id, exerciseName: day.exercises[3].name, measurement: 'minutes', sets: [{ weight: 0, reps: 25 }] },
      ],
    }]
    const html = renderToStaticMarkup(<SessionScreen day={day} data={data} setData={() => {}} onDone={() => {}} onGuide={() => {}} />)
    expect(html).toContain('set 1 metres')
    expect(html).toContain('set 1 minutes')
    expect(html).toContain('Start 20 min timer')
    expect(html).toContain('20kg×50m</p>')
    const history = renderToStaticMarkup(<Workouts data={data} setData={() => {}} onStart={() => {}} onEdit={() => {}} onGuide={() => {}} />)
    expect(history).toContain('20kg×50m</div>')
    expect(history).toContain('25min')
  })
})
