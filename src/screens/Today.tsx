import { useEffect, useState } from 'react'
import { addDays, dateKey, nextWorkout, statusFor, streak, totalsFor } from '../logic'
import type { ScreenProps } from '../types'

type Props = ScreenProps & { onAddMeal: () => void; onStartWorkout: (dayId: string) => void }

function Gauge({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
  const left = goal - value
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
          <line key={t} x1="100" y1="12" x2="100" y2="4" className="gauge-tick" transform={`rotate(${t * 1.8 - 90} 100 100)`} />
        ))}
        <g className="gauge-needle" style={{ transform: `rotate(${pct * 1.8 - 90}deg)` }}>
          <line x1="100" y1="100" x2="100" y2="38" />
        </g>
        <circle cx="100" cy="100" r="7" className="gauge-hub" />
      </svg>
      <div className="gauge-value">
        <strong>{Math.round(value)}</strong>
        <span className="muted small">
          {' '}
          / {goal}
          {unit}
        </span>
      </div>
      <div className="gauge-label">{label}</div>
      <div className="muted small">{left > 0 ? `${Math.round(left)}${unit} to go` : 'Goal reached 🎉'}</div>
    </div>
  )
}

export function Today({ data, setData, onAddMeal, onStartWorkout }: Props) {
  const [now, setNow] = useState(() => new Date())
  // Re-evaluate "today" when the app is reopened (e.g. after midnight).
  useEffect(() => {
    const refresh = () => document.visibilityState === 'visible' && setNow(new Date())
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])
  const today = dateKey(now)
  const totals = totalsFor(data.meals, today)
  const meals = data.meals.filter((m) => m.date === today)
  const status = statusFor(data, today)
  const sessionToday = data.sessions.findLast((s) => s.date === today)
  const next = nextWorkout(data.routine, data.sessions)
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))

  const setCheckIn = (value: 'workout' | 'rest' | undefined) =>
    setData((d) => {
      const checkIns = { ...d.checkIns }
      if (value) checkIns[today] = value
      else delete checkIns[today]
      return { ...d, checkIns }
    })

  return (
    <>
      <header className="page-header">
        <h1>Today</h1>
        <span className="muted">
          {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
      </header>

      <section className="card">
        <div className="gauges">
          <Gauge label="Protein" value={totals.protein} goal={data.settings.proteinGoal} unit="g" color="var(--protein)" />
          <Gauge label="Calories" value={totals.calories} goal={data.settings.calorieGoal} unit=" kcal" color="var(--calories)" />
        </div>
      </section>

      <section className="card">
        <div className="row spread">
          <h2>Accountability</h2>
          <span className="streak">🔥 {streak(data, today)} day streak</span>
        </div>
        <div className="week">
          {week.map((d) => {
            const s = statusFor(data, d)
            const [y, m, day] = d.split('-').map(Number)
            return (
              <div key={d} className={`week-day ${d === today ? 'today' : ''}`}>
                <span className="muted small">
                  {new Date(y, m - 1, day).toLocaleDateString(undefined, { weekday: 'narrow' })}
                </span>
                <span className={`dot ${s ?? ''}`}>{s === 'workout' ? '✓' : s === 'rest' ? 'z' : ''}</span>
              </div>
            )
          })}
        </div>

        {sessionToday ? (
          <p className="ok">✅ Worked out today: {sessionToday.dayName}</p>
        ) : status === 'workout' ? (
          <div className="row spread">
            <p className="ok">✅ Marked as worked out</p>
            <button className="link" onClick={() => setCheckIn(undefined)}>
              Undo
            </button>
          </div>
        ) : status === 'rest' ? (
          <div className="row spread">
            <p className="muted">💤 Rest day</p>
            <button className="link" onClick={() => setCheckIn(undefined)}>
              Undo
            </button>
          </div>
        ) : (
          <>
            {next && (
              <button className="primary block" onClick={() => onStartWorkout(next.id)}>
                Start next workout: {next.name}
              </button>
            )}
            <div className="row gap">
              <button className="secondary grow" onClick={() => setCheckIn('workout')}>
                ✓ I worked out
              </button>
              <button className="secondary grow" onClick={() => setCheckIn('rest')}>
                💤 Rest day
              </button>
            </div>
          </>
        )}
        {(sessionToday || status) && next && <p className="muted small">Up next: {next.name}</p>}
      </section>

      <section className="card">
        <h2>Meals</h2>
        {meals.length === 0 && <p className="muted">Nothing logged yet — tap + to add.</p>}
        <ul className="list">
          {meals.map((m) => (
            <li key={m.id} className="row spread">
              <span>
                {m.name}
                <span className="muted small">
                  {' '}
                  · {m.protein}g · {m.calories} kcal
                </span>
              </span>
              <button
                className="icon"
                aria-label={`Delete ${m.name}`}
                onClick={() => setData((d) => ({ ...d, meals: d.meals.filter((x) => x.id !== m.id) }))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      <button className="fab" aria-label="Add meal" onClick={onAddMeal}>
        +
      </button>
    </>
  )
}
