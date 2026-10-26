import { Icon } from './Icon'
import { litSegments } from '../logic'
import type { MeterStyle } from '../types'

type MeterProps = { label: string; short: string; value: number; goal: number; unit: string; color: string }

function Remaining({ value, goal, unit, done }: { value: number; goal: number; unit: string; done: string }) {
  const left = goal - value
  return left > 0 ? (
    <>{`${Math.round(left)}${unit} to go`}</>
  ) : (
    <span className="nowrap">
      {done} <Icon name="trophy" />
    </span>
  )
}

function ValueText({ value, goal, unit }: { value: number; goal: number; unit: string }) {
  return (
    <>
      <strong>{Math.round(value)}</strong>
      <span className="muted small">
        {' '}
        / {goal}
        {unit}
      </span>
    </>
  )
}

function ClassicDial({ label, value, goal, unit, color }: MeterProps) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
  const done = value >= goal
  const arc = 'M 20 100 A 80 80 0 0 1 180 100'
  return (
    <div className="gauge" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={goal}>
      <svg viewBox="0 0 200 116" aria-hidden="true">
        <path d={arc} className="gauge-track" pathLength={100} />
        <path
          d={arc}
          className="gauge-fill"
          pathLength={100}
          stroke={done ? 'var(--accent)' : color}
          strokeDasharray={`${pct} 1000`}
          opacity={pct > 0 ? 1 : 0}
        />
        {[0, 25, 50, 75, 100].map((t) => (
          <line
            key={t}
            x1="100"
            y1="12"
            x2="100"
            y2="4"
            className="gauge-tick"
            transform={`rotate(${t * 1.8 - 90} 100 100)`}
          />
        ))}
        <g className="gauge-needle" style={{ transform: `rotate(${pct * 1.8 - 90}deg)` }}>
          <line x1="100" y1="100" x2="100" y2="38" />
        </g>
        <circle cx="100" cy="100" r="7" className="gauge-hub" />
      </svg>
      <div className="gauge-value">
        <ValueText value={value} goal={goal} unit={unit} />
      </div>
      <div className="gauge-label">{label}</div>
      <div className="muted small">
        <Remaining value={value} goal={goal} unit={unit} done="Goal reached" />
      </div>
    </div>
  )
}

// Pixel dial geometry: a 41×22 grid, arc split into 12 segments with gaps.
const PX_W = 41
const PX_C = 20
const PX_SEGMENTS = 12
const PX_CELLS = (() => {
  const cells: { x: number; y: number; seg: number }[] = []
  for (let y = 0; y <= PX_C; y++)
    for (let x = 0; x < PX_W; x++) {
      const r = Math.hypot(x - PX_C, PX_C - y)
      if (r < 14.5 || r > 19.5) continue
      const t = (1 - Math.atan2(PX_C - y, x - PX_C) / Math.PI) * PX_SEGMENTS
      const seg = Math.min(PX_SEGMENTS - 1, Math.floor(t))
      const local = t - seg
      if (local > 0.12 && local < 0.88) cells.push({ x, y, seg })
    }
  return cells
})()

function needlePixels(frac: number) {
  const ang = Math.PI * (1 - frac)
  const seen = new Set<string>()
  const out: { x: number; y: number }[] = []
  for (let i = 1; i <= 12; i++) {
    const x = Math.round(PX_C + Math.cos(ang) * i)
    const y = Math.round(PX_C - Math.sin(ang) * i)
    if (!seen.has(`${x},${y}`)) {
      seen.add(`${x},${y}`)
      out.push({ x, y })
    }
  }
  return out
}

function PixelDial({ label, value, goal, unit, color }: MeterProps) {
  const lit = litSegments(value, goal, PX_SEGMENTS)
  const done = goal > 0 && value >= goal
  const fill = done ? 'var(--accent)' : color
  const frac = goal > 0 ? Math.min(1, value / goal) : 0
  return (
    <div className="gauge" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={goal}>
      <svg viewBox={`0 0 ${PX_W} 22`} shapeRendering="crispEdges" aria-hidden="true">
        {PX_CELLS.map((c) => (
          <rect
            key={`${c.x},${c.y}`}
            className="px-seg"
            x={c.x}
            y={c.y}
            width="1"
            height="1"
            fill={c.seg < lit ? fill : 'var(--border)'}
          />
        ))}
        {needlePixels(frac).map((p) => (
          <rect key={`n${p.x},${p.y}`} x={p.x} y={p.y} width="1" height="1" fill="var(--text)" />
        ))}
        <rect x={PX_C - 1} y={PX_C - 1} width="3" height="3" fill="var(--text)" />
      </svg>
      <div className="gauge-value">
        <ValueText value={value} goal={goal} unit={unit} />
      </div>
      <div className="gauge-label">{label}</div>
      <div className="muted small">
        <Remaining value={value} goal={goal} unit={unit} done="Goal reached" />
      </div>
    </div>
  )
}

const BAR_SEGMENTS = 15

function StatBar({ label, short, value, goal, unit, color }: MeterProps) {
  const lit = litSegments(value, goal, BAR_SEGMENTS)
  const done = goal > 0 && value >= goal
  return (
    <div className="stat" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={goal}>
      <div className="row spread">
        <span className="stat-tag" style={{ color }}>
          {short}
        </span>
        <span>
          <ValueText value={value} goal={goal} unit={unit} />
        </span>
      </div>
      <div className="stat-bar" aria-hidden="true">
        {Array.from({ length: BAR_SEGMENTS }, (_, i) => (
          <span key={i} style={i < lit ? { background: done ? 'var(--accent)' : color } : undefined} />
        ))}
      </div>
      <div className="row spread muted small">
        <span>{label}</span>
        <span>
          <Remaining value={value} goal={goal} unit={unit} done="MAX!" />
        </span>
      </div>
    </div>
  )
}

export function Meters({
  style,
  protein,
  calories,
}: {
  style: MeterStyle
  protein: { value: number; goal: number }
  calories: { value: number; goal: number }
}) {
  const items: MeterProps[] = [
    { label: 'Protein', short: 'STR', unit: 'g', color: 'var(--protein)', ...protein },
    { label: 'Calories', short: 'NRG', unit: ' kcal', color: 'var(--calories)', ...calories },
  ]
  if (style === 'bars')
    return (
      <div className="stats">
        {items.map((m) => (
          <StatBar key={m.label} {...m} />
        ))}
      </div>
    )
  const Dial = style === 'classic' ? ClassicDial : PixelDial
  return (
    <div className="gauges">
      {items.map((m) => (
        <Dial key={m.label} {...m} />
      ))}
    </div>
  )
}
