import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ExerciseGuide } from './ExerciseGuide'
import { ExerciseVisual } from './ExerciseVisual'
import { exerciseGuide } from '../guides'
import { defaultData, fullBodyDay } from '../logic'
import { Workouts } from '../screens/Workouts'
import { SessionScreen } from '../screens/SessionScreen'
import type { Exercise } from '../types'

const custom: Exercise = { id: 'custom', name: 'My movement', sets: 3, reps: '10', cue: 'Keep control.' }

describe('exercise help buttons', () => {
  it('uses labelled question-mark icons in both Dojo and workout sessions', () => {
    const data = defaultData()
    const noop = () => {}
    const screens = [
      <Workouts key="dojo" data={data} setData={noop} onStart={noop} onEdit={noop} onGuide={noop} />,
      <SessionScreen key="session" day={data.routine[0]} data={data} setData={noop} onDone={noop} onGuide={noop} />,
    ]
    for (const screen of screens) {
      const html = renderToStaticMarkup(screen)
      expect(html.match(/class="guide-button"/g)).toHaveLength(7)
      expect(html.match(/aria-haspopup="dialog"/g)).toHaveLength(7)
      expect(html.match(/<span aria-hidden="true">\?<\/span>/g)).toHaveLength(7)
      expect(html).toContain('aria-label="How to: Goblet Squats"')
      expect(html).not.toMatch(/>\s*How to\s*<\/button>/)
    }
  })
})

describe('ExerciseGuide', () => {
  it('includes the approved muscle label, both visual choices and instructions', () => {
    const exercise = fullBodyDay().exercises.find((ex) => ex.name === 'Goblet Squats')!
    const html = renderToStaticMarkup(<ExerciseGuide exercise={exercise} onClose={() => {}} />)
    expect(html).toContain('quads, glutes')
    expect(html).toContain('Animation')
    expect(html).toContain('Diagram')
    expect(html).toContain('aria-labelledby=')
    expect(html).toContain('Close exercise guide')
    expect(html).toContain('Knees collapsing inward')
    expect(html).toContain('Push through your whole foot')
    expect(html).toContain('aria-pressed="true" class="active">Animation')
    expect(html).toContain('pixel-exercise')
    expect(html).toMatch(/<\/div><footer class="guide-footer">[\s\S]*Close guide[\s\S]*<\/footer><\/dialog>/)
  })

  it('shows custom instructions and cues without offering unrelated artwork', () => {
    const html = renderToStaticMarkup(
      <ExerciseGuide exercise={{ ...custom, instructions: 'Start here.\nThen do this.' }} onClose={() => {}} />,
    )
    expect(html).toContain('<li>Start here.</li><li>Then do this.</li>')
    expect(html).toContain('Keep control.')
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('Guide visual')
    expect(html).toContain('class="guide-footer"')
  })

  it('explains how to add missing instructions instead of inventing a guide', () => {
    const html = renderToStaticMarkup(<ExerciseGuide exercise={custom} onClose={() => {}} />)
    expect(html).toContain('No step-by-step guide')
    expect(html).toContain('How-to steps')
    expect(html).toContain('Keep control.')
  })
})

describe('ExerciseVisual', () => {
  it('uses chunky sprite pixels for every exercise, with no joint-line figures', () => {
    for (const exercise of fullBodyDay().exercises) {
      const html = renderToStaticMarkup(<ExerciseVisual guide={exerciseGuide(exercise.name)!} animation />)
      expect(html).toContain('shape-rendering="crispEdges"')
      expect(html).toContain('fill="#3b2a20"')
      expect(html).toContain('class="exercise-frame frame-0"')
      expect(html).toContain('class="exercise-frame frame-1"')
      expect(html).not.toContain('<polyline')
    }
  })
  it('restores the original chunky squat sprite rather than the joint-line figure', () => {
    const html = renderToStaticMarkup(<ExerciseVisual guide={exerciseGuide('Goblet Squats')!} animation />)
    expect(html).toContain('viewBox="0 0 16 22"')
    expect(html).toContain('fill="#3b2a20"')
    expect(html).toContain('class="exercise-frame frame-0"')
    expect(html).toContain('class="exercise-frame frame-1"')
    expect(html).not.toContain('<polyline')
  })

  it('renders both positions and a labelled illustration for all seven guides', () => {
    for (const exercise of fullBodyDay().exercises) {
      const guide = exerciseGuide(exercise.name)!
      const html = renderToStaticMarkup(<ExerciseVisual guide={guide} animation={false} />)
      expect(html).toContain('role="img"')
      expect(html).toContain(guide.positions[0].replaceAll('&', '&amp;'))
      expect(html).toContain(guide.positions[1].replaceAll('&', '&amp;'))
      expect(html).toContain('var(--danger)')
    }
  })

  it('shows a steady hold rather than repeated knee drops for the plank', () => {
    const html = renderToStaticMarkup(<ExerciseVisual guide={exerciseGuide('Plank')!} animation />)
    expect(html).toContain('pixel-hold')
    expect(html).toContain('hold steady and breathe')
  })
})
