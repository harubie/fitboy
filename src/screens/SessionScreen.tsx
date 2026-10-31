import { useEffect, useState } from 'react'
import { BottomActions } from '../components/BottomActions'
import { formatSets, isLogDate, lastSets, uid } from '../logic'
import { LogDate } from '../components/LogDate'
import { useLogDate } from '../useLogDate'
import type { Exercise, ScreenProps, WorkoutDay } from '../types'

type Row = { weight: string; reps: string; prevReps?: number }
type Timer = {
  kind: 'rest' | 'hold'
  exId: string
  label: string
  total: number
  endsAt: number
}

const makeTimer = (kind: Timer['kind'], ex: Exercise, label: string, total: number): Timer => ({
  kind,
  exId: ex.id,
  label,
  total,
  endsAt: Date.now() + total * 1000,
})

const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

export function SessionScreen({
  day,
  data,
  setData,
  onDone,
  onGuide,
  initialDate,
  onSavedDate,
}: ScreenProps & { day: WorkoutDay; onDone: () => void; onGuide: (exercise: Exercise) => void; initialDate?: string; onSavedDate?: (date: string) => void }) {
  const { date, setDate, today, validDate } = useLogDate(initialDate)
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
    setRows((r) => ({
      ...r,
      [exId]: r[exId].map((row, j) => (j === i ? { ...row, ...patch } : row)),
    }))

  const [timer, setTimer] = useState<Timer>()
  const [now, setNow] = useState(() => Date.now())

  const startRest = (ex: Exercise) => {
    if (ex.rest) setTimer(makeTimer('rest', ex, 'Rest', ex.rest))
  }
  const startHold = (ex: Exercise) => {
    const sec = Number(ex.reps) || 30
    setTimer(makeTimer('hold', ex, `Hold ${ex.name}`, sec))
  }

  // Timestamps (not tick counts) keep the timer right even if the phone sleeps.
  useEffect(() => {
    if (!timer) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t < timer.endsAt) return
      navigator.vibrate?.([200, 100, 200])
      const ex = day.exercises.find((e) => e.id === timer.exId)
      if (timer.kind === 'hold' && ex) {
        setRows((r) => {
          const i = r[ex.id].findIndex((row) => !row.reps)
          return i < 0
            ? r
            : {
                ...r,
                [ex.id]: r[ex.id].map((row, j) => (j === i ? { ...row, reps: String(timer.total) } : row)),
              }
        })
        if (ex.rest) {
          setTimer(makeTimer('rest', ex, 'Rest', ex.rest))
          return
        }
      }
      setTimer(undefined)
    }, 250)
    return () => clearInterval(id)
  }, [timer, day.exercises])

  const remaining = timer ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : 0
  const hasRir = day.exercises.some((ex) => ex.effort?.includes('RIR'))

  const entries = day.exercises.map((ex) => ({
    exerciseId: ex.id,
    exerciseName: ex.name,
    ...(ex.timed ? { timed: true } : {}),
    sets: rows[ex.id]
      .filter((r) => Number(r.reps) > 0)
      .map((r) => ({
        weight: Math.max(0, Number(r.weight) || 0),
        reps: Number(r.reps),
      })),
  }))
  const setCount = entries.reduce((n, e) => n + e.sets.length, 0)

  const save = () => {
    if (!isLogDate(date)) { alert('Choose a valid workout date on or before today.'); return }
    setData((d) => ({
      ...d,
      sessions: [
        ...d.sessions,
        {
          id: uid(),
          date,
          dayId: day.id,
          dayName: day.name,
          entries,
        },
      ],
    }))
    onSavedDate?.(date)
    onDone()
  }

  return (
    <div className="app">
      <main className="content session-content">
        <header className="page-header">
          <h1>{day.name}</h1>
        </header>
        <LogDate date={date} today={today} onChange={setDate} />

        {hasRir && (
          <details className="card hint">
            <summary>What does "2 RIR" mean?</summary>
            <p className="muted small">
              <strong>Reps In Reserve.</strong> Pick a weight where you finish the set feeling you could only do about 2
              more reps with good form. Too easy? Go heavier next time. Can't reach the reps? Go lighter. A rest timer
              starts when you enter a set's reps.
            </p>
          </details>
        )}

        {day.exercises.map((ex) => {
          const last = lastSets(data.sessions, ex.id)
          return (
            <section key={ex.id} className="card">
              <div className="row spread">
                <h2 className="exercise-name">{ex.name}</h2>
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
              {ex.target && <div className="muted small">{ex.target}</div>}
              <div className="ex-meta">
                <span className="chip">
                  {ex.sets} × {ex.reps}
                  {ex.timed ? 's' : ' reps'}
                </span>
                {ex.effort && <span className="chip">{ex.effort}</span>}
                {ex.rest && <span className="chip">Rest {ex.rest}s</span>}
              </div>
              {ex.cue && (
                <p className="cue small">
                  <strong>Form:</strong> {ex.cue}
                </p>
              )}
              {last && <p className="muted small">Last: {formatSets(last, unit, ex.timed)}</p>}
              <div className="sets">
                <span className="muted small">Set</span>
                <span className="muted small">Weight ({unit})</span>
                <span className="muted small">{ex.timed ? 'Seconds' : 'Reps'}</span>
                {rows[ex.id].map((r, i) => (
                  <div key={i} className="set-row">
                    <span className="set-num">{i + 1}</span>
                    <input
                      inputMode="decimal"
                      aria-label={`${ex.name} set ${i + 1} weight`}
                      value={r.weight}
                      onChange={(e) => update(ex.id, i, { weight: e.target.value })}
                      placeholder={ex.timed ? 'BW' : '0'}
                    />
                    <input
                      inputMode="numeric"
                      aria-label={`${ex.name} set ${i + 1} ${ex.timed ? 'seconds' : 'reps'}`}
                      value={r.reps}
                      onChange={(e) => {
                        if (!r.reps && e.target.value) startRest(ex)
                        update(ex.id, i, { reps: e.target.value })
                      }}
                      placeholder={r.prevReps ? String(r.prevReps) : '—'}
                    />
                  </div>
                ))}
              </div>
              {ex.timed && (
                <button className="primary block hold-btn" onClick={() => startHold(ex)}>
                  Start {Number(ex.reps) || 30}s hold
                </button>
              )}
              <div className="row gap">
                <button
                  className="secondary grow"
                  onClick={() =>
                    setRows((rs) => {
                      const prev = rs[ex.id].at(-1)
                      return {
                        ...rs,
                        [ex.id]: [...rs[ex.id], { weight: prev?.weight ?? '', reps: '' }],
                      }
                    })
                  }
                >
                  + Set
                </button>
                <button
                  className="secondary grow"
                  disabled={rows[ex.id].length <= 1}
                  onClick={() =>
                    setRows((rs) => ({
                      ...rs,
                      [ex.id]: rs[ex.id].slice(0, -1),
                    }))
                  }
                >
                  − Set
                </button>
              </div>
            </section>
          )
        })}
      </main>
      <footer className="screen-footer">
        {timer && (
          <div className={`timer-bar ${timer.kind}`} role="timer" aria-live="polite">
            <div className="timer-fill" style={{ width: `${(remaining / timer.total) * 100}%` }} />
            <span className="timer-label">{timer.label}</span>
            <strong className="timer-time">{clock(remaining)}</strong>
            {timer.kind === 'rest' && (
              <button
                className="secondary small-btn"
                onClick={() =>
                  setTimer({
                    ...timer,
                    endsAt: timer.endsAt + 15000,
                    total: timer.total + 15,
                  })
                }
              >
                +15s
              </button>
            )}
            <button className="secondary small-btn" onClick={() => setTimer(undefined)}>
              {timer.kind === 'rest' ? 'Skip' : 'Stop'}
            </button>
          </div>
        )}
        <BottomActions onBack={onDone}>
          <button className="primary" disabled={setCount === 0 || !validDate} onClick={save}>
            {setCount === 0 ? 'Enter reps to log sets' : `Finish workout (${setCount} sets)`}
          </button>
        </BottomActions>
      </footer>
    </div>
  )
}
