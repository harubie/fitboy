export type Meal = {
  id: string
  date: string // YYYY-MM-DD (local)
  name: string
  calories: number
  protein: number
  estimated?: boolean
  ingredients?: { foodId: string; name: string; amount: number; unit: FoodUnit }[]
}

export type FoodUnit = 'servings' | 'g' | 'tbsp' | 'tsp' | 'eggs' | 'scoops'
export type SavedFood = {
  id: string
  name: string
  unit: FoodUnit
  serving: number
  calories: number
  protein: number
  pinned: boolean
  estimated?: boolean
}

export type Exercise = {
  id: string
  name: string
  sets: number
  reps: string // target, e.g. "8-12"; seconds when timed, otherwise measurement units if set
  target?: string // muscles worked, e.g. "Back & Biceps"
  effort?: string // e.g. "2 RIR"
  rest?: number // seconds between sets
  cue?: string // key form tip
  instructions?: string // user-written how-to steps, one per line
  timed?: boolean // sets are held for `reps` seconds (e.g. plank)
  measurement?: 'minutes' | 'metres'
}

export type WorkoutDay = {
  id: string
  name: string
  exercises: Exercise[]
  note?: string
}

export type SetLog = { weight: number; reps: number } // reps stores the exercise's reps, seconds, minutes or metres

export type SessionEntry = {
  exerciseId: string
  exerciseName: string
  timed?: boolean
  measurement?: Exercise['measurement']
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

export type MeterStyle = 'pixel' | 'bars' | 'classic'

export type Settings = {
  calorieGoal: number
  proteinGoal: number
  unit: 'kg' | 'lb'
  meterStyle: MeterStyle
}

export type ScreenProps = {
  data: AppData
  setData: (update: (prev: AppData) => AppData) => void
}

export type AppData = {
  settings: Settings
  meals: Meal[]
  savedFoods?: SavedFood[]
  routine: WorkoutDay[]
  sessions: Session[]
  checkIns: Record<string, CheckIn>
  monsters?: Monsters
}

export type Monster = {
  id: string
  born: string // date the egg was laid
  forms: string[] // evolution path; the last one is the current form
  base: number // workouts banked before `since` (or adjusted on devolve)
  since?: string // date it became active; undefined while in cryo sleep
  devolvedFor?: string // last-care date that already triggered a devolve
}

export type Monsters = {
  active: Monster
  cryo: Monster[]
  dex: string[] // every form ever discovered
}
