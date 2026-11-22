import '@fontsource-variable/outfit'
import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/App.css'
import './food-preview.css'

type Food = { name: string; unit: string; serving: number; calories: number; protein: number; pinned: boolean }
const sampleFoods: Food[] = [
  { name: 'Egg', unit: 'eggs', serving: 1, calories: 70, protein: 6, pinned: true },
  { name: 'Cottage cheese', unit: 'g', serving: 100, calories: 90, protein: 12, pinned: true },
  { name: 'Greek yogurt', unit: 'g', serving: 100, calories: 65, protein: 10, pinned: false },
  { name: 'Chicken breast', unit: 'g', serving: 100, calories: 165, protein: 31, pinned: false },
  { name: 'Rice (cooked)', unit: 'g', serving: 100, calories: 130, protein: 3, pinned: false },
  { name: 'Protein shake', unit: 'scoops', serving: 1, calories: 120, protein: 24, pinned: true },
  { name: 'Chilli sauce (sample)', unit: 'tbsp', serving: 1, calories: 20, protein: 0, pinned: true },
]

function PortionPicker({ food, initial, onAdd, onClose }: {
  food: Food; initial: number; onAdd: (amount: number) => void; onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [amount, setAmount] = useState(String(initial))
  const [exact, setExact] = useState(false)
  const value = Number(amount)
  const valid = Number.isFinite(value) && value > 0
  const step = food.unit === 'g' ? 25 : food.unit === 'tbsp' ? 0.5 : 1
  const shortcuts = food.unit === 'g' ? [25, 50, 100, 150] : food.unit === 'tbsp' ? [0.5, 1, 1.5, 2] : [1, 2, 3, 4]
  useEffect(() => {
    const element = dialog.current!
    const previousFocus = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])
  return (
    <dialog ref={dialog} className="food-sheet" aria-labelledby="portion-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}>
      <div className="row spread">
        <h2 id="portion-title">{food.name}</h2>
        <button className="icon" aria-label="Close portion picker" onClick={onClose}>×</button>
      </div>
      <p className="muted small">Per {food.serving} {food.unit}: {food.calories} kcal · {food.protein} g protein</p>
      {food.unit === 'tbsp' && <p className="muted small">Illustrative values, not Maggi label data. In the real app, use your bottle's values for its defined tablespoon serving.</p>}
      <div className="food-stepper">
        <button className="secondary" aria-label="Decrease amount" disabled={value <= step}
          onClick={() => setAmount(String(Math.max(step, value - step)))}>−</button>
        <strong aria-live="polite">{amount || '0'} <span className="muted small">{food.unit}</span></strong>
        <button className="secondary" aria-label="Increase amount"
          onClick={() => setAmount(String(value + step))}>+</button>
      </div>
      <div className="food-shortcuts">
        {shortcuts.map((quantity) => (
          <button className={value === quantity ? 'primary' : 'secondary'} aria-pressed={value === quantity}
            key={quantity} onClick={() => setAmount(String(quantity))}>{quantity} {food.unit}</button>
        ))}
      </div>
      <button className="secondary block" aria-expanded={exact} onClick={() => setExact(!exact)}>Enter exact amount</button>
      {exact && <label>Amount ({food.unit})<input type="number" inputMode="decimal" min="0" step="any"
        value={amount} onChange={(event) => setAmount(event.target.value)} /></label>}
      <p className="food-portion-total">{valid ? `${Math.round(food.calories * value / food.serving)} kcal · ${Math.round(food.protein * value / food.serving * 10) / 10} g protein` : 'Choose an amount greater than zero.'}</p>
      <button className="primary block" disabled={!valid} onClick={() => onAdd(value)}>Add to meal</button>
    </dialog>
  )
}

export function FoodPreview() {
  const [path, setPath] = useState('Build a meal')
  const [quickName, setQuickName] = useState('')
  const [quickCalories, setQuickCalories] = useState('')
  const [quickProtein, setQuickProtein] = useState('')
  const [estimated, setEstimated] = useState(false)
  const [foods, setFoods] = useState(sampleFoods)
  const [tab, setTab] = useState('Pinned')
  const [recent, setRecent] = useState(['Greek yogurt', 'Chicken breast', 'Rice (cooked)'])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [items, setItems] = useState<{ food: Food; amount: number }[]>([])
  const [selected, setSelected] = useState<Food>()
  const [newFood, setNewFood] = useState(false)
  const [message, setMessage] = useState('')
  const matches = foods.filter((food) => (showSearch || tab === 'All foods' || (tab === 'Pinned' ? food.pinned : recent.includes(food.name)))
    && food.name.toLowerCase().includes(search.trim().toLowerCase()))
  const totals = items.reduce((total, item) => {
    const quantity = item.amount / item.food.serving
    return {
      calories: total.calories + item.food.calories * quantity,
      protein: total.protein + item.food.protein * quantity,
    }
  }, { calories: 0, protein: 0 })
  const quickValid = [quickCalories, quickProtein].every((value) =>
    value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0)
    && (Number(quickCalories) > 0 || Number(quickProtein) > 0)
  const displayedTotals = path === 'Build a meal' ? totals : {
    calories: quickValid ? Number(quickCalories) : 0,
    protein: quickValid ? Number(quickProtein) : 0,
  }

  return (
    <div className="app food-demo">
      <main className="content">
        <header className="page-header"><h1>Add food</h1></header>
        <p className="muted small">Concept preview only. Sample nutrition values; nothing is saved.</p>
        <div className="seg-picker food-tabs" role="group" aria-label="Logging method">
          {['Quick total', 'Build a meal'].map((label) => <button key={label} className={path === label ? 'active' : ''}
            aria-pressed={path === label} onClick={() => { setPath(label); setMessage('') }}>{label}</button>)}
        </div>
        {path === 'Quick total' ? <section className="card form">
          <h2>Log one total</h2>
          <p className="muted small">Already have the numbers? No need to enter every ingredient.</p>
          <label>Meal name (optional)<input placeholder="e.g. 3 eggs with chilli sauce" value={quickName}
            onChange={(event) => { setQuickName(event.target.value); setMessage('') }} /></label>
          <div className="row gap">
            <label className="grow">Calories<input type="number" inputMode="decimal" min="0" step="any"
              value={quickCalories} onChange={(event) => { setQuickCalories(event.target.value); setMessage('') }} /></label>
            <label className="grow">Protein (g)<input type="number" inputMode="decimal" min="0" step="any"
              value={quickProtein} onChange={(event) => { setQuickProtein(event.target.value); setMessage('') }} /></label>
          </div>
          <label className="check-row"><input type="checkbox" checked={estimated}
            onChange={(event) => { setEstimated(event.target.checked); setMessage('') }} />These numbers are an estimate</label>
          <p className="muted small">Use this for a rough total, including one from AI. The demo does not look up or calculate nutrition from the meal name.</p>
        </section> : <>
        <p className="muted small">Pick ingredients and portions. Sauces can use tablespoon shortcuts.</p>
        <section className="card">
          <h2>Your foods</h2>
          <div className="seg-picker food-tabs" role="group" aria-label="Food list">
            {['Pinned', 'Recent', 'All foods'].map((label) => <button key={label} className={tab === label ? 'active' : ''}
              aria-pressed={tab === label} onClick={() => { setTab(label); setSearch(''); setShowSearch(false) }}>{label}</button>)}
          </div>
          <div className="food-grid">
            {matches.map((food) => (
              <div className="food-tile" key={food.name}>
                <button className="secondary food-pick" onClick={() => setSelected(food)}>
                  <strong>{food.name}</strong><span className="muted small">{food.serving} {food.unit}</span>
                </button>
                <button className="icon food-pin" aria-label={`${food.pinned ? 'Unpin' : 'Pin'} ${food.name}`}
                  aria-pressed={food.pinned} onClick={() => setFoods((current) => current.map((entry) =>
                    entry.name === food.name ? { ...entry, pinned: !entry.pinned } : entry))}>{food.pinned ? '★' : '☆'}</button>
              </div>
            ))}
          </div>
          {!matches.length && <p className="muted small">No foods here. Try All foods or add a new food.</p>}
          <div className="row gap food-tools">
            <button className="secondary grow" aria-expanded={showSearch} onClick={() => {
              setShowSearch(!showSearch); setSearch('')
            }}>Search foods</button>
            <button className="secondary grow" aria-expanded={newFood} onClick={() => setNewFood(!newFood)}>+ New food</button>
          </div>
          {showSearch && <label>Search all foods<input placeholder="Food name" value={search}
            onChange={(event) => setSearch(event.target.value)} /></label>}
        </section>
        {newFood && <form className="card form" onSubmit={(event) => {
          event.preventDefault()
          const fields = new FormData(event.currentTarget)
          const name = String(fields.get('name')).trim()
          if (!name) { event.currentTarget.reportValidity(); return }
          const food: Food = { name, unit: 'servings', serving: 1, pinned: true,
            calories: Number(fields.get('calories')), protein: Number(fields.get('protein')) }
          if (foods.some((entry) => entry.name.toLowerCase() === name.toLowerCase())) {
            setMessage('That name is already saved in the demo. Use a distinct brand or serving name.')
            return
          }
          setFoods((current) => [...current, food]); setNewFood(false); setTab('Pinned')
          setSelected(food); setMessage('')
        }}>
          <h2>New food</h2>
          <p className="muted small">Enter your label values once. Available until this preview is refreshed.</p>
          <label>Name and serving<input name="name" required pattern=".*\S.*" placeholder="e.g. My yogurt, 1 tub" /></label>
          <div className="row gap">
            <label className="grow">Calories<input name="calories" type="number" inputMode="decimal" min="0" step="any" required /></label>
            <label className="grow">Protein (g)<input name="protein" type="number" inputMode="decimal" min="0" step="any" required /></label>
          </div>
          <button className="primary block">Use food (demo)</button>
        </form>}
        <section className="card">
          <h2>This meal</h2>
          {!items.length && <p className="muted small">Tap a food, choose an amount, then add another ingredient.</p>}
          {items.map((item) => <div className="row spread food-meal-item" key={item.food.name}>
            <button className="secondary grow" onClick={() => setSelected(item.food)}>
              {item.food.name} · {item.amount} {item.food.unit} <span className="muted small">Edit</span>
            </button>
            <button className="icon" aria-label={`Remove ${item.food.name}`} onClick={() => {
              setItems((current) => current.filter((entry) => entry.food.name !== item.food.name)); setMessage('')
            }}>×</button>
          </div>)}
        </section>
        </>}
        <p className="muted small" role="status">{message}</p>
      </main>
      <footer className="screen-footer food-total">
        <div className="row spread"><span className="muted small">{path === 'Quick total' && estimated ? 'Estimated total' : 'Meal total'}</span><strong aria-live="polite">{Math.round(displayedTotals.calories)} kcal · {Math.round(displayedTotals.protein * 10) / 10} g protein</strong></div>
        <button className="primary block" disabled={path === 'Quick total' ? !quickValid : !items.length} onClick={() =>
          setMessage(path === 'Quick total'
            ? `Demo: ${quickName.trim() || 'Meal'} logged${estimated ? ' as an estimate' : ''}. No data was saved to your real meals.`
            : 'Demo meal logged. No data was saved to your real meals.')}>Log meal (demo)</button>
      </footer>
      {selected && <PortionPicker key={selected.name} food={selected}
        initial={items.find((item) => item.food.name === selected.name)?.amount ?? selected.serving}
        onClose={() => setSelected(undefined)} onAdd={(amount) => {
          setItems((current) => current.some((item) => item.food.name === selected.name)
            ? current.map((item) => item.food.name === selected.name ? { food: selected, amount } : item)
            : [...current, { food: selected, amount }])
          setRecent((current) => [selected.name, ...current.filter((name) => name !== selected.name)].slice(0, 8))
          setMessage(''); setSelected(undefined)
        }} />}
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<FoodPreview />)
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount())
