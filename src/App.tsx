import { useCallback, useEffect, useState } from 'react'
import { AddMeal } from './screens/AddMeal'
import { MonstersScreen } from './screens/MonstersScreen'
import { PlanEditor } from './screens/PlanEditor'
import { SessionScreen } from './screens/SessionScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { Today } from './screens/Today'
import { Workouts } from './screens/Workouts'
import { useAppData } from './store'
import '@fontsource-variable/outfit'
import { Icon } from './components/Icon'
import { ExerciseGuide } from './components/ExerciseGuide'
import type { Exercise } from './types'
import './App.css'

type Tab = 'today' | 'workouts' | 'settings'
type Overlay =
  | { kind: 'addMeal' }
  | { kind: 'monsters' }
  | { kind: 'session'; dayId: string }
  | { kind: 'plan'; dayId?: string }
  | null

const TABS = [
  ['today', 'nest', 'Base'],
  ['workouts', 'torii', 'Dojo'],
  ['settings', 'shield', 'Gear'],
] as const

export default function App() {
  const [data, setData] = useAppData()
  const [tab, setTab] = useState<Tab>('today')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [guide, setGuide] = useState<Exercise | null>(null)

  // Make the Android back button close sub-screens instead of leaving the app.
  useEffect(() => {
    const onPop = () => {
      if (guide) setGuide(null)
      else setOverlay(null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [guide])

  const open = useCallback((o: NonNullable<Overlay>) => {
    history.pushState({ overlay: true }, '')
    setOverlay(o)
  }, [])
  const close = useCallback(() => history.back(), [])
  const startWorkout = (dayId: string) => open({ kind: 'session', dayId })
  const openGuide = (exercise: Exercise) => {
    history.pushState({ ...history.state, exerciseGuide: true }, '')
    setGuide(exercise)
  }

  const renderScreen = () => {
    if (overlay?.kind === 'addMeal') return <AddMeal data={data} setData={setData} onDone={close} />
    if (overlay?.kind === 'monsters') return <MonstersScreen data={data} setData={setData} onDone={close} />
    if (overlay?.kind === 'plan')
      return (
        <PlanEditor key={overlay.dayId ?? 'new'} dayId={overlay.dayId} data={data} setData={setData} onDone={close} />
      )
    if (overlay?.kind === 'session') {
      const day = data.routine.find((d) => d.id === overlay.dayId)
      if (day) return <SessionScreen day={day} data={data} setData={setData} onDone={close} onGuide={openGuide} />
    }

    return (
      <div className="app">
        <main className="content">
          {tab === 'today' && (
            <Today
              data={data}
              setData={setData}
              onAddMeal={() => open({ kind: 'addMeal' })}
              onStartWorkout={startWorkout}
              onOpenMonsters={() => open({ kind: 'monsters' })}
            />
          )}
          {tab === 'workouts' && (
            <Workouts
              data={data}
              setData={setData}
              onStart={startWorkout}
              onEdit={(dayId) => open({ kind: 'plan', dayId })}
              onGuide={openGuide}
            />
          )}
          {tab === 'settings' && <SettingsScreen data={data} setData={setData} />}
        </main>
        <nav className="tabbar">
          {TABS.map(([id, icon, label]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              <Icon name={icon} className="tab-icon" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    )
  }

  return (
    <>
      {renderScreen()}
      {guide && <ExerciseGuide exercise={guide} onClose={close} />}
    </>
  )
}
