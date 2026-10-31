import { useEffect, useId, useRef, useState } from 'react'
import type { SavedFood } from '../types'

export function FoodPortion({ food, initial, onAdd, onClose, onEdit }: {
  food: SavedFood; initial: number; onAdd: (amount: number) => void; onClose: () => void; onEdit: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [amount, setAmount] = useState(String(initial))
  const [exact, setExact] = useState(false)
  const value = Number(amount)
  const calories = food.calories * (value / food.serving)
  const protein = food.protein * (value / food.serving)
  const valid = Number.isFinite(value) && value > 0 && Number.isFinite(calories) && Number.isFinite(protein)
  const spoon = food.unit === 'tbsp' || food.unit === 'tsp'
  const step = food.unit === 'g' ? 25 : spoon ? 0.5 : 1
  const shortcuts = food.unit === 'g' ? [25, 50, 100, 150] : spoon ? [0.5, 1, 1.5, 2] : [1, 2, 3, 4]
  useEffect(() => {
    const element = dialog.current!
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => {
      element.close()
      document.body.style.overflow = overflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])
  return (
    <dialog ref={dialog} className="food-sheet" aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}>
      <div className="row spread">
        <h2 id={titleId}>{food.name}</h2>
        <button type="button" className="icon" aria-label="Close portion picker" onClick={onClose}>×</button>
      </div>
      <p className="muted small">{food.estimated ? 'Estimated' : 'Saved'} values per {food.serving} {food.unit}: {food.calories} kcal · {food.protein} g protein</p>
      <button type="button" className="link" onClick={onEdit}>Edit food values</button>
      <div className="food-stepper">
        <button type="button" className="secondary" aria-label="Decrease amount" disabled={!valid || value <= step}
          onClick={() => setAmount(String(Math.max(step, value - step)))}>−</button>
        <strong aria-live="polite">{amount || '0'} <span className="muted small">{food.unit}</span></strong>
        <button type="button" className="secondary" aria-label="Increase amount" disabled={!valid}
          onClick={() => setAmount(String(value + step))}>+</button>
      </div>
      <div className="food-shortcuts">
        {shortcuts.map((quantity) => (
          <button type="button" className={value === quantity ? 'primary' : 'secondary'} aria-pressed={value === quantity}
            key={quantity} onClick={() => setAmount(String(quantity))}>{quantity} {food.unit}</button>
        ))}
      </div>
      <button type="button" className="secondary block" aria-expanded={exact} onClick={() => setExact(!exact)}>Enter exact amount</button>
      {exact && <label>Amount ({food.unit})<input type="number" inputMode="decimal" min="0" step="any"
        value={amount} onChange={(event) => setAmount(event.target.value)} /></label>}
      <p className="food-portion-total" aria-live="polite">{valid
        ? `${Math.round(calories)} kcal · ${Math.round(protein * 10) / 10} g protein`
        : 'Choose a positive amount that produces finite nutrition totals.'}</p>
      <button type="button" className="primary block" disabled={!valid} onClick={() => onAdd(value)}>Add to meal</button>
    </dialog>
  )
}
