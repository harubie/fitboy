import '@fontsource-variable/outfit'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PetSprite } from '../src/components/PetSprite'
import { Icon } from '../src/components/Icon'
import '../src/App.css'
import './home-mock.css'

const concepts = [
  {
    id: 'combined',
    name: '1. Workout + reward',
    note: 'One card: a compact companion greeting, then your next workout and check-in.',
  },
  {
    id: 'split',
    name: '3. Separate cards',
    note: 'A compact Lair card above your workout. A little personality, with training still the main action.',
  },
]

export function HomeMock() {
  const [active, setActive] = useState(false)
  const [frame, setFrame] = useState<0 | 1>(0)
  const [action, setAction] = useState('')
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setFrame((f) => (f ? 0 : 1)), 550)
    return () => clearInterval(timer)
  }, [])
  return (
    <main className="home-concepts">
      <header className="concept-intro">
        <span className="concept-eyebrow">BASE / DESIGN PLAYGROUND</span>
        <h1>A little monster. A clear next workout.</h1>
        <p className="muted">Two refinements of C. Preview only - your saved data is untouched.</p>
        <div className="seg-picker" role="group" aria-label="Preview streak state">
          <button aria-pressed={!active} className={!active ? 'active' : ''} onClick={() => setActive(false)}>
            New start
          </button>
          <button aria-pressed={active} className={active ? 'active' : ''} onClick={() => setActive(true)}>
            7-day streak
          </button>
        </div>
      </header>
      <div className="concept-grid workout-concepts">
        {concepts.map(({ id, name, note }) => (
          <section className="concept" key={id} aria-label={name}>
            <h2>{name}</h2>
            <p className="muted concept-note">{note}</p>
            <div className="concept-phone">
              <header className="concept-day">
                <strong>Today</strong>
                <span className="muted small">Monday, 26 Oct</span>
              </header>
              <div className="concept-meters" aria-label="Example nutrition progress">
                <div>
                  <span>
                    Protein <strong>90 / 150g</strong>
                  </span>
                  <progress value={90} max={150} />
                </div>
                <div>
                  <span>
                    Calories <strong>1,000 / 2,500</strong>
                  </span>
                  <progress value={1000} max={2500} />
                </div>
              </div>
              <div className={`concept-stack layout-${id}`}>
                <section className="card concept-reward" aria-label="Monster reward">
                  <button
                    className="concept-reward-link"
                    onClick={() =>
                      setAction('The Lair would open here. Evolution, stars, cryo and the Beastiary live there.')
                    }
                  >
                    <span className="pet-screen">
                      <PetSprite form={active ? 'fang' : 'egg'} frame={frame} />
                    </span>
                    <span className="concept-reward-copy">
                      <strong>
                        {active ? 'Fang' : 'Mystery Egg'}
                        {active && <span className="muted small"> · Lv 7</span>}
                      </strong>
                      <span className="muted small">
                        {active ? 'Every workout helps it grow.' : 'Your first workout hatches it.'}
                      </span>
                      <span className="concept-reward-destination">
                        The Lair <span aria-hidden="true">&rarr;</span>
                      </span>
                    </span>
                  </button>
                </section>
                <section className="card concept-workout" aria-label="Next workout">
                  <div className="concept-workout-heading">
                    <span className="concept-eyebrow">NEXT WORKOUT</span>
                    <span className="concept-workout-streak">
                      <Icon name="flame" />
                      {active ? '7-day streak' : 'Start your streak'}
                    </span>
                  </div>
                  <h3 className="concept-workout-title">90-Day Full Body</h3>
                  <p className="muted small">7 exercises · Full body</p>
                  <button
                    className="primary block"
                    onClick={() =>
                      setAction('Your workout session would open here. This mockup does not log anything.')
                    }
                  >
                    Start workout <span aria-hidden="true">&rarr;</span>
                  </button>
                  <div className="concept-week" aria-label="Example weekly activity">
                    {['T', 'W', 'T', 'F', 'S', 'S', 'M'].map((day, index) => (
                      <span key={index}>
                        <span>{day}</span>
                        <span
                          className={`concept-dot ${active ? 'complete' : ''}`}
                          aria-label={active ? 'Checked in' : 'No check-in'}
                        />
                      </span>
                    ))}
                  </div>
                  <div className="concept-checkins">
                    <button onClick={() => setAction('Workout check-in preview only. Nothing saved.')}>
                      <Icon name="check" /> I worked out
                    </button>
                    <button onClick={() => setAction('Rest-day check-in preview only. Nothing saved.')}>
                      <Icon name="moon" /> Rest day
                    </button>
                  </div>
                </section>
              </div>
              <div className="concept-meals">
                <h2>Meals</h2>
                <span className="muted small">Your food log continues here.</span>
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="concept-feedback" role="status">
        {action || 'Try switching between a new start and an active streak.'}
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<HomeMock />)
