import { useState } from 'react'
import { BottomActions } from '../components/BottomActions'
import { uid } from '../logic'
import { workoutTemplates } from '../workout-templates'
import type { Exercise, ScreenProps, WorkoutDay } from '../types'

const blankExercise = (): Exercise => ({ id: uid(), name: '', sets: 3, reps: '10-12', rest: 90 })

export function PlanEditor({ dayId, data, setData, onDone }: ScreenProps & { dayId?: string; onDone: () => void }) {
  const existing = data.routine.find((d) => d.id === dayId)
  const [draft, setDraft] = useState<WorkoutDay>(
    () => existing ?? { id: uid(), name: '', exercises: [blankExercise()] },
  )
  const [dirty, setDirty] = useState(false)

  const edit = (fn: (d: WorkoutDay) => WorkoutDay) => {
    setDraft(fn)
    setDirty(true)
  }
  const updateEx = (id: string, patch: Partial<Exercise>) =>
    edit((d) => ({ ...d, exercises: d.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  const moveEx = (i: number, dir: -1 | 1) =>
    edit((d) => {
      const j = i + dir
      if (j < 0 || j >= d.exercises.length) return d
      const exercises = [...d.exercises]
      ;[exercises[i], exercises[j]] = [exercises[j], exercises[i]]
      return { ...d, exercises }
    })

  const isBlank = !existing && draft.exercises.every((e) => !e.name.trim())
  const applyTemplate = (create: () => WorkoutDay) => {
    const t = create()
    edit((d) => ({ ...d, name: d.name.trim() || t.name, exercises: t.exercises, note: t.note }))
  }

  const exercises = draft.exercises.map((e) => ({ ...e, name: e.name.trim() })).filter((e) => e.name)
  const canSave = exercises.length > 0

  const save = () => {
    const plan = { ...draft, name: draft.name.trim() || 'My plan', exercises }
    setData((d) => ({
      ...d,
      routine: d.routine.some((x) => x.id === plan.id)
        ? d.routine.map((x) => (x.id === plan.id ? plan : x))
        : [...d.routine, plan],
    }))
    onDone()
  }

  const back = () => {
    if (!dirty || confirm('Discard your changes?')) onDone()
  }

  const remove = () => {
    if (!existing || !confirm(`Delete "${existing.name}"? Your logged workouts stay in History.`)) return
    setData((d) => ({ ...d, routine: d.routine.filter((x) => x.id !== existing.id) }))
    onDone()
  }

  return (
    <div className="app">
      <main className="content">
        <header className="page-header">
          <h1>{existing ? 'Edit plan' : 'New plan'}</h1>
        </header>

        <section className="card form">
          <label>
            Plan name
            <input
              value={draft.name}
              placeholder="e.g. Upper body, Cardio, Leg day"
              onChange={(e) => edit((d) => ({ ...d, name: e.target.value }))}
            />
          </label>
          <label>
            Plan notes
            <textarea rows={2} value={draft.note ?? ''} onChange={(event) =>
              edit((d) => ({ ...d, note: event.target.value || undefined }))} />
          </label>
        </section>

        {isBlank && (
          <section className="card">
            <h2>Start from a template</h2>
            <p className="muted small">
              Choose a plan to fill in its exercises and targets. You can tweak it before saving.
            </p>
            {workoutTemplates.map((template) => (
              <button key={template.name} className="secondary block" onClick={() => applyTemplate(template.create)}>
                {template.name}
              </button>
            ))}
          </section>
        )}

        {draft.exercises.map((ex, i) => (
          <section key={ex.id} className="card form plan-ex">
            <div className="row gap">
              <input
                className="grow plan-ex-name"
                aria-label={`Exercise ${i + 1} name`}
                placeholder={`Exercise ${i + 1}`}
                value={ex.name}
                onChange={(e) => updateEx(ex.id, { name: e.target.value })}
              />
              <button className="icon" aria-label="Move up" disabled={i === 0} onClick={() => moveEx(i, -1)}>
                ↑
              </button>
              <button
                className="icon"
                aria-label="Move down"
                disabled={i === draft.exercises.length - 1}
                onClick={() => moveEx(i, 1)}
              >
                ↓
              </button>
              <button
                className="icon"
                aria-label={`Remove ${ex.name || `exercise ${i + 1}`}`}
                onClick={() => edit((d) => ({ ...d, exercises: d.exercises.filter((x) => x.id !== ex.id) }))}
              >
                ✕
              </button>
            </div>
            <div className="plan-ex-grid">
              <label>
                Sets
                <input
                  inputMode="numeric"
                  value={ex.sets || ''}
                  onChange={(e) => updateEx(ex.id, { sets: Number(e.target.value) || 0 })}
                />
              </label>
              <label>
                {ex.measurement === 'minutes' ? 'Minutes' : ex.measurement === 'metres' ? 'Metres' : ex.timed ? 'Seconds' : 'Reps'}
                <input value={ex.reps} onChange={(e) => updateEx(ex.id, { reps: e.target.value })} />
              </label>
              <label>
                Rest (s)
                <input
                  inputMode="numeric"
                  value={ex.rest ?? ''}
                  onChange={(e) => updateEx(ex.id, { rest: Number(e.target.value) || undefined })}
                />
              </label>
            </div>
            <label>
              Log as
              <select value={ex.measurement ?? (ex.timed ? 'seconds' : 'reps')} onChange={(event) => {
                const value = event.target.value
                updateEx(ex.id, {
                  timed: value === 'seconds' || undefined,
                  measurement: value === 'minutes' || value === 'metres' ? value : undefined,
                })
              }}>
                <option value="reps">Reps</option>
                <option value="seconds">Seconds (timed hold)</option>
                <option value="minutes">Minutes (cardio)</option>
                <option value="metres">Metres (distance)</option>
              </select>
            </label>
            <details>
              <summary className="muted small">More details: muscles, effort, form tip, how-to steps</summary>
              <label>
                Muscles worked
                <input
                  value={ex.target ?? ''}
                  placeholder="e.g. Back & Biceps"
                  onChange={(e) => updateEx(ex.id, { target: e.target.value || undefined })}
                />
              </label>
              <label>
                Effort
                <input
                  value={ex.effort ?? ''}
                  placeholder="e.g. 2 RIR"
                  onChange={(e) => updateEx(ex.id, { effort: e.target.value || undefined })}
                />
              </label>
              <label>
                Form tip
                <textarea
                  rows={2}
                  value={ex.cue ?? ''}
                  placeholder="e.g. Pull the bar to your collarbone"
                  onChange={(e) => updateEx(ex.id, { cue: e.target.value || undefined })}
                />
              </label>
              <label>
                How-to steps (one per line)
                <textarea
                  rows={4}
                  value={ex.instructions ?? ''}
                  placeholder="Leave blank to use the built-in guide, if available."
                  onChange={(e) => updateEx(ex.id, { instructions: e.target.value || undefined })}
                />
              </label>
            </details>
          </section>
        ))}

        <button
          className="secondary block"
          onClick={() => edit((d) => ({ ...d, exercises: [...d.exercises, blankExercise()] }))}
        >
          + Add exercise
        </button>

        {existing && (
          <button className="danger block" onClick={remove}>
            Delete plan
          </button>
        )}
      </main>
      <footer className="screen-footer">
        <BottomActions onBack={back}>
          <button className="primary" disabled={!canSave} onClick={save}>
            {canSave ? 'Save plan' : 'Name at least one exercise'}
          </button>
        </BottomActions>
      </footer>
    </div>
  )
}
