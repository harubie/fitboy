import { useState } from 'react'
import { dateKey, formatSets, lastSets, uid } from '../logic'
import type { ScreenProps, WorkoutDay } from '../types'

type Row = { weight: string; reps: string; prevReps?: number }

export function SessionScreen({ day, data, setData, onDone }: ScreenProps & { day: WorkoutDay; onDone: () => void }) {
  const unit = data.settings.unit
  // Weight is prefilled from last time; reps must be entered for a set to count.
  const [rows, setRows] = useState<Record<string, Row[]>>(() =>
    Object.fromEntries(
      day.exercises.map((ex) => {
        const last = lastSets(data.sessions, ex.id) ?? []
        const count = Math.max(ex.sets, last.length, 1)
        return [
          ex.id,
          Array.from({ length: count }, (_, i) => ({
            weight: last[i] ? String(last[i].weight) : '',
            reps: '',
            prevReps: last[i]?.reps,
          })),
        ]
      }),
    ),
  )

  const update = (exId: string, i: number, patch: Partial<Row>) =>
    setRows((r) => ({ ...r, [exId]: r[exId].map((row, j) => (j === i ? { ...row, ...patch } : row)) }))

  const entries = day.exercises.map((ex) => ({
    exerciseId: ex.id,
    exerciseName: ex.name,
    sets: rows[ex.id]
      .filter((r) => Number(r.reps) > 0)
      .map((r) => ({ weight: Math.max(0, Number(r.weight) || 0), reps: Number(r.reps) })),
  }))
  const setCount = entries.reduce((n, e) => n + e.sets.length, 0)

  const save = () => {
    setData((d) => ({
      ...d,
      sessions: [...d.sessions, { id: uid(), date: dateKey(), dayId: day.id, dayName: day.name, entries }],
    }))
    onDone()
  }

  return (
    <div className="app">
      <main className="content">
        <header className="page-header">
          <button className="link" onClick={onDone}>
            ← Back
          </button>
          <h1>{day.name}</h1>
        </header>

        {day.exercises.map((ex) => {
          const last = lastSets(data.sessions, ex.id)
          return (
            <section key={ex.id} className="card">
              <div className="row spread">
                <h2>{ex.name}</h2>
                <span className="muted small">
                  Target {ex.sets} × {ex.reps}
                </span>
              </div>
              {last && <p className="muted small">Last: {formatSets(last, unit)}</p>}
              <div className="sets">
                <span className="muted small">Set</span>
                <span className="muted small">Weight ({unit})</span>
                <span className="muted small">Reps</span>
                {rows[ex.id].map((r, i) => (
                  <div key={i} className="set-row">
                    <span className="set-num">{i + 1}</span>
                    <input
                      inputMode="decimal"
                      aria-label={`${ex.name} set ${i + 1} weight`}
                      value={r.weight}
                      onChange={(e) => update(ex.id, i, { weight: e.target.value })}
                      placeholder="0"
                    />
                    <input
                      inputMode="numeric"
                      aria-label={`${ex.name} set ${i + 1} reps`}
                      value={r.reps}
                      onChange={(e) => update(ex.id, i, { reps: e.target.value })}
                      placeholder={r.prevReps ? String(r.prevReps) : '—'}
                    />
                  </div>
                ))}
              </div>
              <div className="row gap">
                <button
                  className="secondary grow"
                  onClick={() =>
                    setRows((rs) => {
                      const prev = rs[ex.id].at(-1)
                      return { ...rs, [ex.id]: [...rs[ex.id], { weight: prev?.weight ?? '', reps: '' }] }
                    })
                  }
                >
                  + Set
                </button>
                <button
                  className="secondary grow"
                  disabled={rows[ex.id].length <= 1}
                  onClick={() => setRows((rs) => ({ ...rs, [ex.id]: rs[ex.id].slice(0, -1) }))}
                >
                  − Set
                </button>
              </div>
            </section>
          )
        })}

        <button className="primary block sticky-bottom" disabled={setCount === 0} onClick={save}>
          {setCount === 0 ? 'Enter reps to log sets' : `Finish workout (${setCount} sets)`}
        </button>
      </main>
    </div>
  )
}
