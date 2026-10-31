import { useEffect } from 'react'
import { Pet } from '../components/Pet'
import { addDays, displayDate, isLogDate, quickStartPlan, statusFor, streak, totalsFor, weekHeading, workoutRuns } from '../logic'
import { useLogDate } from '../useLogDate'
import { devolvedNow, initialMonsters, monsterXp, neglectDays, reconcile } from '../monsters'
import { STAR_EVERY } from '../pet'
import { Icon } from '../components/Icon'
import { Meters } from '../components/Meters'
import type { ScreenProps } from '../types'

type Props = ScreenProps & {
  onAddMeal: (date?: string) => void
  onStartWorkout: (dayId: string, date?: string) => void
  onOpenMonsters: () => void
  initialDate?: string
  onDateChange?: (date: string) => void
}

export function Today({ data, setData, onAddMeal, onStartWorkout, onOpenMonsters, initialDate, onDateChange }: Props) {
  const { date, setDate, today, validDate } = useLogDate(initialDate)
  useEffect(() => { onDateChange?.(date) }, [date, onDateChange])
  const [year, month, day] = (validDate ? date : today).split('-').map(Number)
  const now = new Date(year, month - 1, day)
  const totals = totalsFor(data.meals, date)
  const meals = data.meals.filter((m) => m.date === date)
  const status = statusFor(data, date)
  const sessionToday = data.sessions.findLast((s) => s.date === date)
  const next = quickStartPlan(data.routine, data.sessions)
  const daysSinceMonday = (now.getDay() + 6) % 7
  const week = Array.from({ length: 7 }, (_, i) => addDays(validDate ? date : today, i - daysSinceMonday))
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

  const setCheckIn = (value: 'workout' | 'rest' | undefined) => {
    if (!isLogDate(date)) { alert('Choose a valid check-in date on or before today.'); return }
    setData((d) => {
      const checkIns = { ...d.checkIns }
      if (value) checkIns[date] = value
      else delete checkIns[date]
      return { ...d, checkIns }
    })
  }

  return (
    <>
      <header className="page-header">
        <h1>{date === today ? 'Today' : 'Daily log'}</h1>
        <span className="muted">
          {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
      </header>
      <section className="card day-navigation" aria-label="Choose a day">
        <div className="row spread">
          <button className="secondary" aria-label="Previous week"
            disabled={!isLogDate(addDays(week[0], -7), today)}
            onClick={() => setDate(addDays(date, -7))}>←</button>
          <span className="muted small">{weekHeading(week[0], week[6])}</span>
          <button className="secondary" aria-label="Next week" disabled={week[6] >= today}
            onClick={() => setDate(addDays(date, 7) > today ? today : addDays(date, 7))}>→</button>
        </div>
        <div className="week">
          {week.map((d) => {
            const s = statusFor(data, d)
            const [y, m, day] = d.split('-').map(Number)
            return (
              <button type="button" key={d} className={`week-day ${d === today ? 'today' : ''}`}
                aria-current={d === today ? 'date' : undefined} aria-pressed={d === date}
                aria-label={`${displayDate(d)}: ${s ?? 'not checked in'}`} disabled={d > today} onClick={() => setDate(d)}>
                <span className="muted small">{new Date(y, m - 1, day).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <strong>{day}</strong>
                <span className={`dot ${s ?? ''}`}>{s === 'workout' ? '✓' : s === 'rest' ? 'z' : ''}</span>
              </button>
            )
          })}
        </div>
      </section>

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
          <h2>{status ? (date === today ? 'Today’s activity' : 'Activity') : 'Next workout'}</h2>
          <span className="workout-streak">
            <Icon name="flame" /> {currentStreak > 0 ? `${currentStreak} day streak` : 'Start your streak!'}
          </span>
        </div>
        {!status && next && (
          <>
            <h3 className="workout-plan-name">{next.name}</h3>
            <p className="muted small">{next.exercises.length} exercises</p>
            <button className="primary block" disabled={!validDate} onClick={() => onStartWorkout(next.id, date)}>
              Start workout <span aria-hidden="true">→</span>
            </button>
          </>
        )}
        {!status && !next && <p className="muted">Create a workout plan in Dojo to get started.</p>}
        {sessionToday ? (
          <p className="ok">
            <Icon name="check" /> Worked out {date === today ? 'today' : `on ${displayDate(date)}`}: {sessionToday.dayName}
            <span className="muted small"> · To change this to a rest day, delete the session in Dojo history.</span>
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
              <button className="secondary grow" disabled={!validDate} onClick={() => setCheckIn('workout')}>
                <Icon name="check" /> I worked out
              </button>
              <button className="secondary grow" disabled={!validDate} onClick={() => setCheckIn('rest')}>
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
                  · {m.calories} kcal · {m.protein}g{m.estimated ? ' · estimated' : ''}
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

      <button className="fab" aria-label="Add meal" disabled={!validDate} onClick={() => onAddMeal(date)}>
        +
      </button>
    </>
  )
}
