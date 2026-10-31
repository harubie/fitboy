import { useState } from 'react'
import { FOOD_UNITS, isSavedFood, nutritionNumber } from '../foods'
import { uid } from '../logic'
import type { SavedFood } from '../types'

export function FoodEditor({ food, foods, onSave, onClose }: {
  food?: SavedFood; foods: SavedFood[]; onSave: (food: SavedFood) => void; onClose: () => void
}) {
  const [error, setError] = useState('')
  return (
    <form className="card form" onSubmit={(event) => {
      event.preventDefault()
      const fields = new FormData(event.currentTarget)
      const name = String(fields.get('name')).trim()
      const unit = String(fields.get('unit'))
      const calories = nutritionNumber(String(fields.get('calories')))
      const protein = nutritionNumber(String(fields.get('protein')))
      const next = {
        id: food?.id ?? uid(), name, unit, serving: Number(fields.get('serving')),
        calories, protein, pinned: food?.pinned ?? true, estimated: fields.get('estimated') === 'on',
      }
      if (!isSavedFood(next)) { setError('Enter a name, a positive serving size, and finite, non-negative nutrition values.'); return }
      if (foods.some((entry) => entry.id !== next.id && entry.name.trim().toLowerCase() === name.toLowerCase())) {
        setError('That name already exists. Include the brand or serving to distinguish it.')
        return
      }
      onSave(next)
    }}>
      <h2>{food ? 'Edit food' : 'New food'}</h2>
      <p className="muted small">Enter your label values once. No automatic nutrition lookup.</p>
      <label>Name<input name="name" required defaultValue={food?.name} placeholder="e.g. My chilli sauce" /></label>
      <div className="row gap">
        <label className="grow">Serving size<input name="serving" type="number" inputMode="decimal" min="0" step="any" required defaultValue={food?.serving ?? 1} /></label>
        <label className="grow">Serving unit<select name="unit" defaultValue={food?.unit ?? 'servings'}>
          {FOOD_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
        </select></label>
      </div>
      <p className="muted small">Nutrition below is for that serving, not automatically per 100 g. For spoons, use the label's defined serving; spoon sizes and product weights vary.</p>
      <div className="row gap">
        <label className="grow">Calories<input name="calories" type="number" inputMode="decimal" min="0" step="any" required defaultValue={food?.calories} /></label>
        <label className="grow">Protein (g)<input name="protein" type="number" inputMode="decimal" min="0" step="any" required defaultValue={food?.protein} /></label>
      </div>
      <label className="check-row"><input type="checkbox" name="estimated" defaultChecked={food?.estimated} />These numbers are an estimate</label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row gap">
        <button type="button" className="secondary grow" onClick={onClose}>Cancel</button>
        <button className="primary grow">Save food</button>
      </div>
    </form>
  )
}
