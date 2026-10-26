import { describe, expect, it } from 'vitest'
import { pixelExercises } from './pixel-exercises'

describe('chunky exercise sprites', () => {
  it('provides two distinct, bounded frames in the original character palette', () => {
    expect(Object.keys(pixelExercises)).toHaveLength(6)
    for (const frames of Object.values(pixelExercises)) {
      expect(frames).toHaveLength(2)
      expect(frames[0]).not.toEqual(frames[1])
      for (const frame of frames) {
        expect(frame).toHaveLength(22)
        expect(frame.join('')).toMatch(/^[.HSTBWK]+$/)
        expect(frame.some((row) => row.includes('HHH'))).toBe(true)
        expect(frame.some((row) => row.includes('TTT'))).toBe(true)
        expect(Math.max(...frame.map((row) => row.length))).toBeLessThanOrEqual(24)
      }
    }
  })
})
