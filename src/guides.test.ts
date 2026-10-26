import { describe, expect, it } from 'vitest'
import { exerciseGuide, guideSteps } from './guides'
import { fullBodyDay } from './logic'
import { guideArt } from './guide-art'

describe('exerciseGuide', () => {
  it('provides instructions and a distinct visual for each template exercise', () => {
    const guides = fullBodyDay().exercises.map((ex) => exerciseGuide(ex.name))
    expect(guides).toHaveLength(7)
    for (const guide of guides) {
      expect(guide).toBeDefined()
      expect(guide!.steps.length).toBeGreaterThanOrEqual(3)
      expect(guide!.avoid).toHaveLength(2)
      expect(guide!.muscles.length).toBeGreaterThan(0)
      const art = guideArt[guide!.id]
      expect(art.drawings).toHaveLength(2)
      expect(art.drawings[0]).not.toEqual(art.drawings[1])
      expect(art.drawings.some((drawing) => drawing.muscle.length > 0)).toBe(true)
    }
    expect(new Set(guides.map((g) => g!.id)).size).toBe(7)
  })

  it('recognises explicit aliases, whitespace, case and curly apostrophes', () => {
    expect(exerciseGuide('  GOBLET   SQUAT ')?.id).toBe('squat')
    expect(exerciseGuide('Captain’s Chair Raises')?.id).toBe('raises')
    expect(exerciseGuide('Lat Pulldown')?.id).toBe('pulldown')
  })

  it('does not guess guides for different movements', () => {
    expect(exerciseGuide('Sumo goblet squats')).toBeUndefined()
    expect(exerciseGuide('Incline dumbbell chest press')).toBeUndefined()
    expect(exerciseGuide('')).toBeUndefined()
  })
})

describe('guideSteps', () => {
  it('uses nonblank custom lines in preference to built-in steps', () => {
    expect(guideSteps({ name: 'Plank', instructions: ' Brace first \n\n Breathe steadily ' })).toEqual([
      'Brace first',
      'Breathe steadily',
    ])
  })

  it('uses built-in instructions when custom instructions are blank or missing', () => {
    expect(guideSteps({ name: 'Plank', instructions: ' \n ' })).toEqual(exerciseGuide('Plank')!.steps)
    expect(guideSteps({ name: 'Plank' })).toEqual(exerciseGuide('Plank')!.steps)
  })

  it('leaves unknown exercises without invented instructions', () => {
    expect(guideSteps({ name: 'My movement' })).toEqual([])
  })
})
