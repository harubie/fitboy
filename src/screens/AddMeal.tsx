import { useState } from 'react'
import { dateKey, recentMeals, uid } from '../logic'
import type { ScreenProps } from '../types'

const num = (s: string) => Math.max(0, Number(s) || 0)

export function AddMeal({ data, setData, onDone }: ScreenProps & { onDone: () => void }) {
  const [name, setName] = useState('')
  const [protein, setProtein] = useState('')
  const [calories, setCalories] = useState('')
  const recent = recentMeals(data.meals)
  const canSave = num(protein) > 0 || num(calories) > 0

  const save = () => {
    if (!canSave) return
    setData((d) => ({
      ...d,
      meals: [
        ...d.meals,
        { id: uid(), date: dateKey(), name: name.trim() || 'Meal', protein: num(protein), calories: num(calories) },
      ],
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
          <h1>Add food</h1>
        </header>

        <form
          className="card form"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken & rice" />
          </label>
          <div className="row gap">
            <label className="grow">
              Protein (g)
              <input inputMode="decimal" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" />
            </label>
            <label className="grow">
              Calories
              <input inputMode="decimal" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" />
            </label>
          </div>
          <button className="primary block" disabled={!canSave}>
            Add
          </button>
        </form>

        {recent.length > 0 && (
          <section className="card">
            <h2>Quick add</h2>
            <p className="muted small">Tap to fill in a recent meal.</p>
            <div className="chips">
              {recent.map((m) => (
                <button
                  key={m.id}
                  className="chip"
                  onClick={() => {
                    setName(m.name)
                    setProtein(String(m.protein))
                    setCalories(String(m.calories))
                  }}
                >
                  {m.name} <span className="muted">· {m.protein}g</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
