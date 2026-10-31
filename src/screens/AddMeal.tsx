import { useState } from 'react'
import { BottomActions } from '../components/BottomActions'
import { FoodEditor } from '../components/FoodEditor'
import { FoodPortion } from '../components/FoodPortion'
import { LogDate } from '../components/LogDate'
import { useLogDate } from '../useLogDate'
import { foodCatalog, foodTotals, nutritionNumber } from '../foods'
import type { Ingredient } from '../foods'
import { displayDate, isLogDate, recentMeals, uid } from '../logic'
import type { Meal, SavedFood, ScreenProps } from '../types'
import '../food-logging.css'

export function AddMeal({ data, setData, onDone, initialDate, onSavedDate }: ScreenProps & {
  onDone: () => void; initialDate?: string; onSavedDate?: (date: string) => void
}) {
  const { date, setDate, today, validDate } = useLogDate(initialDate)
  const [path, setPath] = useState<'quick' | 'build'>('quick')
  const [name, setName] = useState('')
  const [buildName, setBuildName] = useState('')
  const [protein, setProtein] = useState('')
  const [calories, setCalories] = useState('')
  const [estimated, setEstimated] = useState(false)
  const [tab, setTab] = useState('Pinned')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [items, setItems] = useState<Ingredient[]>([])
  const [selected, setSelected] = useState<SavedFood>()
  const [editing, setEditing] = useState<{ food?: SavedFood }>()
  const [error, setError] = useState('')
  const catalog = foodCatalog(data)
  const recent = recentMeals(data.meals)
  const foodIdsByName = new Map(catalog.map((food) => [food.name.trim().toLowerCase(), food.id]))
  const recentIds = [...new Set([...data.meals].reverse().flatMap((meal) =>
    meal.ingredients?.map((item) => item.foodId) ?? [foodIdsByName.get(meal.name.trim().toLowerCase()) ?? '']))].slice(0, 8)
  const list = tab === 'Recent' ? recentIds.flatMap((id) => catalog.filter((food) => food.id === id))
    : catalog.filter((food) => tab === 'All foods' || food.pinned)
  const matches = (showSearch ? catalog : list).filter((food) => food.name.toLowerCase().includes(search.trim().toLowerCase()))
  const quickCalories = nutritionNumber(calories)
  const quickProtein = nutritionNumber(protein)
  const quickValid = quickCalories !== undefined && quickProtein !== undefined && (quickCalories > 0 || quickProtein > 0)
  const totals = path === 'quick' ? { calories: quickCalories ?? 0, protein: quickProtein ?? 0 } : foodTotals(items)
  const canSave = validDate && (path === 'quick' ? quickValid : items.length > 0 && (totals.calories > 0 || totals.protein > 0))

  const saveFood = (food: SavedFood) => {
    setData((d) => {
      const saved = d.savedFoods ?? []
      return { ...d, savedFoods: saved.some((entry) => entry.id === food.id)
        ? saved.map((entry) => entry.id === food.id ? food : entry) : [...saved, food] }
    })
  }

  const save = () => {
    if (!isLogDate(date)) { setError('Choose a valid food date on or before today.'); return }
    if (!canSave) { setError('Enter non-negative nutrition with at least one positive value, or add food to your meal.'); return }
    const meal: Meal = {
      id: uid(), date, name: (path === 'quick' ? name : buildName).trim() || (path === 'build'
        ? items.map(({ food, amount }) => `${food.name} (${amount} ${food.unit})`).join(' + ') : 'Meal'),
      ...totals,
      estimated: path === 'quick' ? estimated : items.some(({ food }) => food.estimated),
      ...(path === 'build' ? { ingredients: items.map(({ food, amount }) => ({
        foodId: food.id, name: food.name, amount, unit: food.unit,
      })) } : {}),
    }
    setData((d) => ({
      ...d,
      meals: [...d.meals, meal],
      ...(path === 'build' ? { savedFoods: [
        ...(d.savedFoods ?? []),
        ...items.map(({ food }) => food).filter((food) => !(d.savedFoods ?? []).some((entry) => entry.id === food.id)),
      ] } : {}),
    }))
    onSavedDate?.(date)
    onDone()
  }

  return (
    <div className="app food-logging">
      <main className="content">
        <header className="page-header"><h1>Add food</h1></header>
        <LogDate date={date} today={today} onChange={setDate} />
        <div className="seg-picker food-tabs" role="group" aria-label="Logging method">
          <button type="button" className={path === 'quick' ? 'active' : ''} aria-pressed={path === 'quick'}
            onClick={() => { setPath('quick'); setError('') }}>Quick total</button>
          <button type="button" className={path === 'build' ? 'active' : ''} aria-pressed={path === 'build'}
            onClick={() => { setPath('build'); setError('') }}>Build a meal</button>
        </div>
        <form id="add-food" className="card form" onSubmit={(event) => { event.preventDefault(); save() }}>
          <label>
            Name (optional)
            <input value={path === 'quick' ? name : buildName} onChange={(event) =>
              path === 'quick' ? setName(event.target.value) : setBuildName(event.target.value)}
              placeholder={path === 'quick' ? 'e.g. 3 eggs with chilli sauce' : 'Leave blank to use ingredient names'} />
          </label>
          {path === 'quick' && <>
            <div className="row gap">
              <label className="grow">Calories<input type="number" inputMode="decimal" min="0" step="any" value={calories}
                onChange={(event) => setCalories(event.target.value)} placeholder="0" /></label>
              <label className="grow">Protein (g)<input type="number" inputMode="decimal" min="0" step="any" value={protein}
                onChange={(event) => setProtein(event.target.value)} placeholder="0" /></label>
            </div>
            <label className="check-row"><input type="checkbox" checked={estimated}
              onChange={(event) => setEstimated(event.target.checked)} />These numbers are an estimate</label>
            <p className="muted small">Enter your total, including an estimate from AI if you choose. The app does not look up nutrition from the name.</p>
          </>}
        </form>
        {path === 'quick' && recent.length > 0 && <section className="card">
          <h2>Quick add</h2>
          <p className="muted small">Tap to fill in a recent meal. Build a meal can access all previous foods.</p>
          <div className="chips">{recent.map((meal) => <button type="button" key={meal.id} className="chip" onClick={() => {
            setName(meal.name); setCalories(String(meal.calories)); setProtein(String(meal.protein))
            setEstimated(meal.estimated ?? false); setError('')
          }}>{meal.name} <span className="muted">· {meal.calories} kcal · {meal.protein} g</span></button>)}</div>
        </section>}
        {path === 'build' && <>
          <section className="card">
            <h2>Your foods</h2>
            <div className="seg-picker food-tabs" role="group" aria-label="Food list">
              {['Pinned', 'Recent', 'All foods'].map((label) => <button type="button" key={label}
                className={tab === label ? 'active' : ''} aria-pressed={tab === label}
                onClick={() => { setTab(label); setSearch(''); setShowSearch(false) }}>{label}</button>)}
            </div>
            <div className="row gap food-tools">
              <button type="button" className="secondary grow" aria-expanded={showSearch}
                onClick={() => { setShowSearch(!showSearch); setSearch('') }}>Search foods</button>
              <button type="button" className="secondary grow" onClick={() => setEditing({})}>+ New food</button>
            </div>
            {showSearch && <label>Search all foods<input value={search} placeholder="Food name"
              onChange={(event) => setSearch(event.target.value)} /></label>}
            <div className="food-grid">{matches.map((food) => <div className="food-tile" key={food.id}>
              <button type="button" className="secondary food-pick" onClick={() => setSelected(food)}>
                <strong>{food.name}</strong><span className="muted small">{food.serving} {food.unit}{food.estimated ? ' · estimated' : ''}</span>
              </button>
              <button type="button" className="icon food-pin" aria-label={`${food.pinned ? 'Unpin' : 'Pin'} ${food.name}`}
                aria-pressed={food.pinned} onClick={() => saveFood({ ...food, pinned: !food.pinned })}>{food.pinned ? '★' : '☆'}</button>
            </div>)}</div>
            {!matches.length && <p className="muted small">{tab === 'Pinned' && !showSearch
              ? 'Pin foods from All foods, or tap + New food.' : 'No matching foods. Tap + New food to add one.'}</p>}
            <p className="muted small">Older meal totals are one serving of the entire meal, not individual ingredients.</p>
          </section>
          {editing && <FoodEditor key={editing.food?.id ?? 'new'} food={editing.food} foods={catalog}
            onClose={() => setEditing(undefined)} onSave={(food) => {
              const nextItems = items.map((item) => item.food.id === food.id ? { ...item, food } : item)
              try { foodTotals(nextItems) }
              catch (cause) {
                if (!(cause instanceof Error)) throw cause
                setError(cause.message); return
              }
              saveFood(food)
              setItems(nextItems)
              setEditing(undefined); setSelected(food); setTab('Pinned'); setError('')
            }} />}
          <section className="card">
            <h2>This meal</h2>
            {!items.length && <p className="muted small">Tap a food, choose an amount, then add another ingredient.</p>}
            {items.map((item) => <div className="row spread food-meal-item" key={item.food.id}>
              <button type="button" className="secondary grow" onClick={() => setSelected(catalog.find((food) => food.id === item.food.id) ?? item.food)}>
                {item.food.name} · {item.amount} {item.food.unit} <span className="muted small">Edit</span>
              </button>
              <button type="button" className="icon" aria-label={`Remove ${item.food.name}`} onClick={() =>
                setItems((current) => current.filter((entry) => entry.food.id !== item.food.id))}>×</button>
            </div>)}
          </section>
        </>}
        {error && <p className="error" role="alert">{error}</p>}
      </main>
      <footer className="screen-footer food-total">
        <div className="row spread">
          <span className="muted small">{(path === 'quick' ? estimated : items.some(({ food }) => food.estimated)) ? 'Estimated total' : 'Meal total'} · {displayDate(date)}</span>
          <strong aria-live="polite">{Math.round(totals.calories)} kcal · {Math.round(totals.protein * 10) / 10} g protein</strong>
        </div>
        <BottomActions onBack={onDone}>
          <button className="primary" form="add-food" disabled={!canSave}>{path === 'quick' ? 'Add' : 'Log meal'}</button>
        </BottomActions>
      </footer>
      {selected && <FoodPortion key={selected.id} food={selected}
        initial={items.find((item) => item.food.id === selected.id)?.amount ?? selected.serving}
        onClose={() => setSelected(undefined)}
        onEdit={() => { setEditing({ food: selected }); setSelected(undefined) }}
        onAdd={(amount) => {
          const next = items.some((item) => item.food.id === selected.id)
            ? items.map((item) => item.food.id === selected.id ? { food: selected, amount } : item)
            : [...items, { food: selected, amount }]
          try { foodTotals(next) }
          catch (cause) {
            if (!(cause instanceof Error)) throw cause
            setError(cause.message); setSelected(undefined); return
          }
          setItems(next); setSelected(undefined); setError('')
        }} />}
    </div>
  )
}
