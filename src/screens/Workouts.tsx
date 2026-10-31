import { useState } from 'react'
import { displayDate, formatSets, isLogDate, lastSets, newestSessions, planStats } from '../logic'
import { LogDate } from '../components/LogDate'
import { useLogDate } from '../useLogDate'
import type { Exercise, ScreenProps } from '../types'

const shortDate = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function Workouts({
  data,
  setData,
  onStart,
  onEdit,
  onGuide,
}: ScreenProps & {
  onStart: (dayId: string) => void
  onEdit: (dayId?: string) => void
  onGuide: (exercise: Exercise) => void
}) {
  const [openId, setOpenId] = useState<string | undefined>(data.routine.length === 1 ? data.routine[0].id : undefined)
  const [editingId, setEditingId] = useState<string>()
  const { date, setDate, today, validDate } = useLogDate()
  const unit = data.settings.unit
  const history = newestSessions(data.sessions).slice(0, 20)

  return (
    <>
      <header className="page-header">
        <h1>Dojo</h1>
      </header>

      {data.routine.length === 0 && (
        <section className="card">
          <h2>No workout plans yet</h2>
          <p className="muted small">Tap + to create one. You can start from the 90-Day Full Body template.</p>
        </section>
      )}

      {data.routine.map((day) => {
        const isOpen = openId === day.id
        const stats = planStats(data.sessions, day.id)
        return (
          <section key={day.id} className="card">
            <button className="row spread plain" onClick={() => setOpenId(isOpen ? undefined : day.id)}>
              <div>
                <h2>{day.name}</h2>
                <div className="muted small">
                  {day.exercises.length} exercise{day.exercises.length === 1 ? '' : 's'} ·{' '}
                  {stats.last
                    ? `Last done ${shortDate(stats.last)} · ${stats.count} session${stats.count === 1 ? '' : 's'}`
                    : 'Not started yet'}
                </div>
              </div>
              <span className="muted">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen && (
              <>
                {day.note && <p className="muted small">{day.note}</p>}
                <ul className="list">
                  {day.exercises.map((ex) => {
                    const last = lastSets(data.sessions, ex.id)
                    return (
                      <li key={ex.id}>
                        <div className="row spread">
                          <div className="exercise-name">
                            <span>{ex.name}</span>
                            <button
                              className="guide-button"
                              aria-label={`How to: ${ex.name}`}
                              aria-haspopup="dialog"
                              title={`How to: ${ex.name}`}
                              onClick={() => onGuide(ex)}
                            >
                              <span aria-hidden="true">?</span>
                            </button>
                          </div>
                          <span className="muted small nowrap">
                            {ex.sets} × {ex.reps}
                            {ex.measurement === 'minutes' ? ' min' : ex.measurement === 'metres' ? ' m' : ex.timed ? 's' : ''}
                          </span>
                        </div>
                        {ex.target && <div className="muted small">{ex.target}</div>}
                        <div className="muted small">
                          {last ? `Last: ${formatSets(last, unit, ex.timed, ex.measurement)}` : 'No history yet'}
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="plan-actions">
                  <button className="secondary" onClick={() => onEdit(day.id)}>
                    Edit
                  </button>
                  <button className="primary" onClick={() => onStart(day.id)}>
                    Start
                  </button>
                </div>
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
                    {displayDate(s.date)} · {s.dayName}
                  </strong>
                  <button
                    className="icon"
                    aria-label="Delete session"
                    onClick={() => {
                      if (confirm(`Delete ${s.dayName} on ${displayDate(s.date)}?`))
                        setData((d) => ({
                          ...d,
                          sessions: d.sessions.filter((x) => x.id !== s.id),
                        }))
                    }}
                  >
                    ✕
                  </button>
                </div>
                <button className="link" onClick={() => { setEditingId(s.id); setDate(s.date) }}>Change date</button>
                {editingId === s.id && <>
                  <LogDate date={date} today={today} onChange={setDate} />
                  <div className="row gap">
                    <button className="secondary grow" onClick={() => setEditingId(undefined)}>Cancel</button>
                    <button className="primary grow" disabled={!validDate} onClick={() => {
                      if (!isLogDate(date)) { alert('Choose a valid workout date on or before today.'); return }
                      setData((d) => ({ ...d, sessions: d.sessions.map((session) => session.id === s.id ? { ...session, date } : session) }))
                      setEditingId(undefined)
                    }}>Save date</button>
                  </div>
                </>}
                {s.entries
                  .filter((e) => e.sets.length)
                  .map((e) => (
                    <div key={e.exerciseId} className="muted small">
                      {e.exerciseName}: {formatSets(e.sets, unit, e.timed, e.measurement)}
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        </section>
      )}
      <button className="fab" aria-label="New workout plan" onClick={() => onEdit()}>
        +
      </button>
    </>
  )
}
