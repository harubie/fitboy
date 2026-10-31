import { useId, useState } from 'react'
import { displayDate, isLogDate } from '../logic'

export function LogDate({ date, today, onChange }: {
  date: string; today: string; onChange: (date: string) => void
}) {
  const id = useId()
  const [picking, setPicking] = useState(false)
  return (
    <section className="log-date">
      <button type="button" className="secondary block" aria-expanded={picking} aria-controls={id}
        onClick={() => setPicking(!picking)}>
        {isLogDate(date, today) ? `Logging for ${displayDate(date)}${date === today ? ' (today)' : ''}` : 'Choose a log date'}
        <span aria-hidden="true"> ▾</span>
      </button>
      {picking && (
        <label htmlFor={id}>Log date<input id={id} type="date" min="1000-01-01" max={today} value={date}
          onChange={(event) => onChange(event.target.value)} /></label>
      )}
      {!isLogDate(date, today) && <p className="muted small" role="alert">Choose a valid date on or before today.</p>}
    </section>
  )
}
