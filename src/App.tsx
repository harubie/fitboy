import { useCallback, useEffect, useState } from 'react'
import { AddMeal } from './screens/AddMeal'
import { SessionScreen } from './screens/SessionScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { Today } from './screens/Today'
import { Workouts } from './screens/Workouts'
import { useAppData } from './store'
import './App.css'

type Tab = 'today' | 'workouts' | 'settings'
type Overlay = { kind: 'addMeal' } | { kind: 'session'; dayId: string } | null

const TABS = [
  ['today', '🏠', 'Today'],
  ['workouts', '🏋️', 'Workouts'],
  ['settings', '⚙️', 'Settings'],
] as const

export default function App() {
  const [data, setData] = useAppData()
  const [tab, setTab] = useState<Tab>('today')
  const [overlay, setOverlay] = useState<Overlay>(null)

  // Make the Android back button close sub-screens instead of leaving the app.
  useEffect(() => {
    const onPop = () => setOverlay(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const open = useCallback((o: NonNullable<Overlay>) => {
    history.pushState({ overlay: true }, '')
    setOverlay(o)
  }, [])
  const close = useCallback(() => history.back(), [])
  const startWorkout = (dayId: string) => open({ kind: 'session', dayId })

  if (overlay?.kind === 'addMeal') return <AddMeal data={data} setData={setData} onDone={close} />
  if (overlay?.kind === 'session') {
    const day = data.routine.find((d) => d.id === overlay.dayId)
    if (day) return <SessionScreen day={day} data={data} setData={setData} onDone={close} />
  }

  return (
    <div className="app">
      <main className="content">
        {tab === 'today' && (
          <Today data={data} setData={setData} onAddMeal={() => open({ kind: 'addMeal' })} onStartWorkout={startWorkout} />
        )}
        {tab === 'workouts' && <Workouts data={data} setData={setData} onStart={startWorkout} />}
        {tab === 'settings' && <SettingsScreen data={data} setData={setData} />}
      </main>
      <nav className="tabbar">
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            <span className="tab-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
