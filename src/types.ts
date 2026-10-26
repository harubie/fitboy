export type Meal = {
  id: string
  date: string // YYYY-MM-DD (local)
  name: string
  calories: number
  protein: number
}

export type Exercise = {
  id: string
  name: string
  sets: number
  reps: string // target, e.g. "8-12"
}

export type WorkoutDay = {
  id: string
  name: string
  exercises: Exercise[]
}

export type SetLog = { weight: number; reps: number }

export type SessionEntry = {
  exerciseId: string
  exerciseName: string
  sets: SetLog[]
}

export type Session = {
  id: string
  date: string
  dayId: string
  dayName: string
  entries: SessionEntry[]
}

export type CheckIn = 'workout' | 'rest'

export type Settings = {
  calorieGoal: number
  proteinGoal: number
  unit: 'kg' | 'lb'
}

export type ScreenProps = {
  data: AppData
  setData: (update: (prev: AppData) => AppData) => void
}

export type AppData = {
  settings: Settings
  meals: Meal[]
  routine: WorkoutDay[]
  sessions: Session[]
  checkIns: Record<string, CheckIn>
}
