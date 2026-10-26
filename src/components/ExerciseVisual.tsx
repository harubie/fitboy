import { guideArt } from '../guide-art'
import type { Guide } from '../guides'
import { PixelExercise } from './PixelExercise'

export function ExerciseVisual({ guide, animation }: { guide: Guide; animation: boolean }) {
  const art = guideArt[guide.id]
  if (animation) {
    return (
      <figure className={`exercise-visual pixel-exercise ${guide.id === 'plank' ? 'pixel-hold' : ''}`}>
        <PixelExercise id={guide.id} label={`${guide.names[0]}: ${guide.positions.join(', then ')}`} />
        <figcaption className="muted small">
          {guide.id === 'plank'
            ? 'Set up, then hold steady and breathe.'
            : 'Repeat slowly, keeping the movement controlled.'}
        </figcaption>
      </figure>
    )
  }
  return (
    <figure className="exercise-visual anatomical-exercise">
      <svg viewBox="0 0 320 230" role="img" aria-label={`${guide.names[0]}: ${guide.positions.join(', then ')}`}>
        {art.drawings.map((drawing, i) => (
          <g key={i} transform={`translate(${i * 160} 0)`}>
            <g stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d={drawing.equipment} />
            </g>
            <g stroke="#cbd0da" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="var(--bg)">
              <path d={drawing.body} />
              <path d={drawing.arms} />
              <path d={drawing.muscle} fill="var(--danger)" fillOpacity=".65" stroke="none" />
              <path d={drawing.detail} fill="none" strokeWidth="1" />
            </g>
            <text x="75" y="220" textAnchor="middle" fill="var(--text)" fontSize="11">
              {i + 1} · {guide.positions[i]}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="muted small">Schematic guide · move within a comfortable range.</figcaption>
    </figure>
  )
}
