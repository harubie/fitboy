import { defaultData, uid } from '../logic'
import { loadData, STORAGE_KEY } from '../store'
import type { AppData, Exercise, ScreenProps, WorkoutDay } from '../types'

export function SettingsScreen({ data, setData }: ScreenProps) {
  const setSettings = (patch: Partial<AppData['settings']>) =>
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))

  const updateDay = (dayId: string, fn: (day: WorkoutDay) => WorkoutDay) =>
    setData((d) => ({ ...d, routine: d.routine.map((x) => (x.id === dayId ? fn(x) : x)) }))

  const updateExercise = (dayId: string, exId: string, patch: Partial<Exercise>) =>
    updateDay(dayId, (day) => ({
      ...day,
      exercises: day.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)),
    }))

  const moveDay = (i: number, dir: -1 | 1) =>
    setData((d) => {
      const routine = [...d.routine]
      const j = i + dir
      if (j < 0 || j >= routine.length) return d
      ;[routine[i], routine[j]] = [routine[j], routine[i]]
      return { ...d, routine }
    })

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fitboy-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData
      if (!Array.isArray(parsed.meals) || !Array.isArray(parsed.routine)) throw new Error('bad file')
      if (!confirm('Replace all current data with this backup?')) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      setData(() => loadData())
    } catch {
      alert('That file is not a valid Fitboy backup.')
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <section className="card form">
        <h2>Daily goals</h2>
        <div className="row gap">
          <label className="grow">
            Protein (g)
            <input
              inputMode="numeric"
              value={data.settings.proteinGoal || ''}
              onChange={(e) => setSettings({ proteinGoal: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="grow">
            Calories
            <input
              inputMode="numeric"
              value={data.settings.calorieGoal || ''}
              onChange={(e) => setSettings({ calorieGoal: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        <label>
          Weight unit
          <select value={data.settings.unit} onChange={(e) => setSettings({ unit: e.target.value as 'kg' | 'lb' })}>
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </label>
      </section>

      <section className="card">
        <h2>Workout routine</h2>
        <p className="muted small">Days rotate in this order. "Up next" follows your last logged workout.</p>
        {data.routine.map((day, i) => (
          <div key={day.id} className="routine-day">
            <div className="row gap">
              <input
                className="grow day-name"
                aria-label="Day name"
                value={day.name}
                onChange={(e) => updateDay(day.id, (d) => ({ ...d, name: e.target.value }))}
              />
              <button className="icon" aria-label="Move up" onClick={() => moveDay(i, -1)}>
                ↑
              </button>
              <button className="icon" aria-label="Move down" onClick={() => moveDay(i, 1)}>
                ↓
              </button>
              <button
                className="icon"
                aria-label={`Delete ${day.name}`}
                onClick={() => {
                  if (confirm(`Delete "${day.name}"?`))
                    setData((d) => ({ ...d, routine: d.routine.filter((x) => x.id !== day.id) }))
                }}
              >
                ✕
              </button>
            </div>
            {day.exercises.map((ex) => (
              <div key={ex.id} className="exercise-edit">
                <input
                  aria-label="Exercise name"
                  value={ex.name}
                  onChange={(e) => updateExercise(day.id, ex.id, { name: e.target.value })}
                />
                <input
                  aria-label="Sets"
                  inputMode="numeric"
                  value={ex.sets || ''}
                  onChange={(e) => updateExercise(day.id, ex.id, { sets: Number(e.target.value) || 0 })}
                />
                <span className="muted">×</span>
                <input
                  aria-label="Reps"
                  value={ex.reps}
                  onChange={(e) => updateExercise(day.id, ex.id, { reps: e.target.value })}
                />
                <button
                  className="icon"
                  aria-label={`Remove ${ex.name}`}
                  onClick={() =>
                    updateDay(day.id, (d) => ({ ...d, exercises: d.exercises.filter((x) => x.id !== ex.id) }))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="link"
              onClick={() =>
                updateDay(day.id, (d) => ({
                  ...d,
                  exercises: [...d.exercises, { id: uid(), name: 'New exercise', sets: 3, reps: '8-12' }],
                }))
              }
            >
              + Add exercise
            </button>
          </div>
        ))}
        <button
          className="secondary block"
          onClick={() =>
            setData((d) => ({
              ...d,
              routine: [...d.routine, { id: uid(), name: `Day ${d.routine.length + 1}`, exercises: [] }],
            }))
          }
        >
          + Add workout day
        </button>
      </section>

      <section className="card">
        <h2>Backup</h2>
        <p className="muted small">Your data lives only on this phone. Export a backup now and then.</p>
        <div className="row gap">
          <button className="secondary grow" onClick={exportData}>
            Export
          </button>
          <label className="secondary grow file-btn">
            Import
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
            />
          </label>
        </div>
        <button
          className="link danger"
          onClick={() => {
            if (confirm('Erase ALL data and start fresh?')) setData(() => defaultData())
          }}
        >
          Reset everything
        </button>
      </section>
    </>
  )
}
