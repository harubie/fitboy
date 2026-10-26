import { useState } from 'react'
import { formatSets, lastSets, nextWorkout } from '../logic'
import type { ScreenProps } from '../types'

export function Workouts({ data, setData, onStart }: ScreenProps & { onStart: (dayId: string) => void }) {
  const next = nextWorkout(data.routine, data.sessions)
  const [openId, setOpenId] = useState<string | undefined>(next?.id)
  const unit = data.settings.unit
  const history = [...data.sessions].reverse().slice(0, 20)

  return (
    <>
      <header className="page-header">
        <h1>Workouts</h1>
      </header>

      {data.routine.length === 0 && <p className="muted">No workout days yet — add some in Settings.</p>}

      {data.routine.map((day) => {
        const isNext = day.id === next?.id
        const isOpen = openId === day.id
        return (
          <section key={day.id} className={`card ${isNext ? 'highlight' : ''}`}>
            <button className="row spread plain" onClick={() => setOpenId(isOpen ? undefined : day.id)}>
              <h2>
                {day.name} {isNext && <span className="badge">Up next</span>}
              </h2>
              <span className="muted">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen && (
              <>
                <ul className="list">
                  {day.exercises.map((ex) => {
                    const last = lastSets(data.sessions, ex.id)
                    return (
                      <li key={ex.id}>
                        <div className="row spread">
                          <span>{ex.name}</span>
                          <span className="muted small">
                            {ex.sets} × {ex.reps}
                          </span>
                        </div>
                        <div className="muted small">{last ? `Last: ${formatSets(last, unit)}` : 'No history yet'}</div>
                      </li>
                    )
                  })}
                </ul>
                <button className="primary block" onClick={() => onStart(day.id)}>
                  Start {day.name}
                </button>
              </>
            )}
          </section>
        )
      })}

      {history.length > 0 && (
        <section className="card">
          <h2>History</h2>
          <ul className="list">
            {history.map((s) => (
              <li key={s.id}>
                <div className="row spread">
                  <strong>
                    {s.date} · {s.dayName}
                  </strong>
                  <button
                    className="icon"
                    aria-label="Delete session"
                    onClick={() => {
                      if (confirm(`Delete ${s.dayName} on ${s.date}?`))
                        setData((d) => ({ ...d, sessions: d.sessions.filter((x) => x.id !== s.id) }))
                    }}
                  >
                    ✕
                  </button>
                </div>
                {s.entries
                  .filter((e) => e.sets.length)
                  .map((e) => (
                    <div key={e.exerciseId} className="muted small">
                      {e.exerciseName}: {formatSets(e.sets, unit)}
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
