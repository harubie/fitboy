import { useEffect, useState } from 'react'
import { Pet } from '../components/Pet'
import { addDays, dateKey, quickStartPlan, statusFor, streak, totalsFor, workoutRuns } from '../logic'
import { devolvedNow, initialMonsters, monsterXp, neglectDays, reconcile } from '../monsters'
import { STAR_EVERY } from '../pet'
import { Icon } from '../components/Icon'
import { Meters } from '../components/Meters'
import type { ScreenProps } from '../types'

type Props = ScreenProps & {
  onAddMeal: () => void
  onStartWorkout: (dayId: string) => void
  onOpenMonsters: () => void
}

export function Today({ data, setData, onAddMeal, onStartWorkout, onOpenMonsters }: Props) {
  const [now, setNow] = useState(() => new Date())
  // Re-evaluate "today" when the app is reopened (e.g. after midnight).
  useEffect(() => {
    const refresh = () => document.visibilityState === 'visible' && setNow(new Date())
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])
  const today = dateKey(now)
  const totals = totalsFor(data.meals, today)
  const meals = data.meals.filter((m) => m.date === today)
  const status = statusFor(data, today)
  const sessionToday = data.sessions.findLast((s) => s.date === today)
  const next = quickStartPlan(data.routine, data.sessions)
  const daysSinceMonday = (now.getDay() + 6) % 7
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - daysSinceMonday))
  const currentStreak = streak(data, today)
  const runs = workoutRuns(data)
  const monster = data.monsters?.active
  const stars = runs.reduce((sum, r) => sum + Math.floor(r / STAR_EVERY), 0)

  // Hatch the first egg, evolve, or devolve whenever the log or the day changes.
  useEffect(() => {
    setData((d) => {
      const ms = reconcile(d.monsters ?? initialMonsters(d, today), d, today)
      return ms === d.monsters ? d : { ...d, monsters: ms }
    })
  }, [data.sessions, data.checkIns, today, setData])

  const setCheckIn = (value: 'workout' | 'rest' | undefined) =>
    setData((d) => {
      const checkIns = { ...d.checkIns }
      if (value) checkIns[today] = value
      else delete checkIns[today]
      return { ...d, checkIns }
    })

  return (
    <>
      <header className="page-header">
        <h1>Today</h1>
        <span className="muted">
          {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
      </header>

      <section className="card">
        <Meters
          style={data.settings.meterStyle}
          protein={{ value: totals.protein, goal: data.settings.proteinGoal }}
          calories={{ value: totals.calories, goal: data.settings.calorieGoal }}
        />
      </section>

      <section className="card companion-card" aria-label="Your companion">
        {monster && (
          <Pet
            monster={monster}
            xp={monsterXp(monster, data, today)}
            neglect={neglectDays(monster, data, today)}
            devolved={devolvedNow(monster, data, today)}
            stars={stars}
            starProgress={currentStreak > 0 ? (runs.at(-1) ?? 0) : 0}
            onOpen={onOpenMonsters}
          />
        )}
      </section>

      <section className="card" aria-label="Workout and check-in">
        <div className="workout-heading">
          <h2>{status ? 'Today’s activity' : 'Next workout'}</h2>
          <span className="workout-streak">
            <Icon name="flame" /> {currentStreak > 0 ? `${currentStreak} day streak` : 'Start your streak!'}
          </span>
        </div>
        {!status && next && (
          <>
            <h3 className="workout-plan-name">{next.name}</h3>
            <p className="muted small">{next.exercises.length} exercises</p>
            <button className="primary block" onClick={() => onStartWorkout(next.id)}>
              Start workout <span aria-hidden="true">→</span>
            </button>
          </>
        )}
        {!status && !next && <p className="muted">Create a workout plan in Dojo to get started.</p>}
        <div className="week">
          {week.map((d) => {
            const s = statusFor(data, d)
            const [y, m, day] = d.split('-').map(Number)
            return (
              <div
                key={d}
                className={`week-day ${d === today ? 'today' : ''}`}
                aria-current={d === today ? 'date' : undefined}
              >
                <span className="muted small">
                  {new Date(y, m - 1, day).toLocaleDateString(undefined, { weekday: 'narrow' })}
                </span>
                <span className={`dot ${s ?? ''}`}>{s === 'workout' ? '✓' : s === 'rest' ? 'z' : ''}</span>
              </div>
            )
          })}
        </div>

        {sessionToday ? (
          <p className="ok">
            <Icon name="check" /> Worked out today: {sessionToday.dayName}
          </p>
        ) : status === 'workout' ? (
          <div className="row spread">
            <p className="ok">
              <Icon name="check" /> Marked as worked out
            </p>
            <button className="link" onClick={() => setCheckIn(undefined)}>
              Undo
            </button>
          </div>
        ) : status === 'rest' ? (
          <div className="row spread">
            <p className="muted">
              <Icon name="moon" /> Rest day
            </p>
            <button className="link" onClick={() => setCheckIn(undefined)}>
              Undo
            </button>
          </div>
        ) : (
          <>
            <div className="row gap">
              <button className="secondary grow" onClick={() => setCheckIn('workout')}>
                <Icon name="check" /> I worked out
              </button>
              <button className="secondary grow" onClick={() => setCheckIn('rest')}>
                <Icon name="moon" /> Rest day
              </button>
            </div>
          </>
        )}
      </section>

      <section className="card">
        <h2>Meals</h2>
        {meals.length === 0 && <p className="muted">Nothing logged yet — tap + to add.</p>}
        <ul className="list">
          {meals.map((m) => (
            <li key={m.id} className="row spread">
              <span>
                {m.name}
                <span className="muted small">
                  {' '}
                  · {m.protein}g · {m.calories} kcal
                </span>
              </span>
              <button
                className="icon"
                aria-label={`Delete ${m.name}`}
                onClick={() => setData((d) => ({ ...d, meals: d.meals.filter((x) => x.id !== m.id) }))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      <button className="fab" aria-label="Add meal" onClick={onAddMeal}>
        +
      </button>
    </>
  )
}
