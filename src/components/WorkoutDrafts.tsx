import { displayDate } from '../logic'
import type { ScreenProps } from '../types'

export function WorkoutDrafts({ data, setData, onResume }: ScreenProps & { onResume: (dayId: string) => void }) {
  if (!data.workoutDrafts?.length) return null

  return (
    <section className="card" aria-label="Unfinished workouts">
      <h2>Unfinished workouts</h2>
      <p className="muted small">Your progress is saved on this device until you finish or discard it.</p>
      <ul className="list">
        {data.workoutDrafts.map((draft) => (
          <li key={draft.day.id}>
            <strong>{draft.day.name}</strong>
            <p className="muted small">Logging for {displayDate(draft.date)}</p>
            <div className="row gap">
              <button className="primary grow" onClick={() => onResume(draft.day.id)}>Resume</button>
              <button className="secondary" onClick={() => {
                if (confirm(`Discard the unfinished ${draft.day.name} workout?`)) {
                  setData((current) => ({
                    ...current,
                    workoutDrafts: (current.workoutDrafts ?? []).filter((item) => item.day.id !== draft.day.id),
                  }))
                }
              }}>Discard</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
