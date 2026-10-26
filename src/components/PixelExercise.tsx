import type { GuideId } from '../guides'
import { pixelExercises } from '../pixel-exercises'

const squatFrames = [
  [
    '................',
    '......HHH.......',
    '.....HHHHH......',
    '.....HHSSS......',
    '......SSSS......',
    '.......SS.......',
    '......TTTT......',
    '.....TTTTSWW....',
    '.....TTTSSWW....',
    '.....TTTT.WW....',
    '.....TTTT.......',
    '.....TTTT.......',
    '.....BBBB.......',
    '.....BBBB.......',
    '......SS........',
    '......SS........',
    '......SS........',
    '......SS........',
    '......SS........',
    '......SS........',
    '......KKKK......',
  ],
  [
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....HHH........',
    '....HHHHH.......',
    '....HHSSS.......',
    '.....SSSS.......',
    '......SS........',
    '.....TTTT.......',
    '....TTTTSWW.....',
    '....TTTSSWW.....',
    '...TTTT..WW.....',
    '..TTTT..........',
    '.BBBBSSSSS......',
    '.BBBBSSSSSS.....',
    '........SS......',
    '.......SS.......',
    '......SS........',
    '......KKKK......',
  ],
]

const palette: Record<string, string> = {
  H: '#3b2a20',
  S: '#e8b48a',
  T: '#4ade80',
  B: '#60a5fa',
  W: '#8b92a3',
  K: '#eef0f4',
}

export function PixelExercise({ id, label }: { id: GuideId; label: string }) {
  const frames = id === 'squat' ? squatFrames : pixelExercises[id]
  const width = id === 'squat' ? 16 : 24
  return (
    <svg viewBox={`0 0 ${width} 22`} shapeRendering="crispEdges" role="img" aria-label={label}>
      <rect x="0" y="21" width={width} height="1" fill="var(--border)" />
      {frames.map((rows, i) => (
        <g key={i} className={`exercise-frame frame-${i}`}>
          {rows.flatMap((row, y) =>
            [...row].map((pixel, x) =>
              pixel === '.' ? null : <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={palette[pixel]} />,
            ),
          )}
        </g>
      ))}
    </svg>
  )
}
