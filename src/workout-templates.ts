import { FULL_BODY_NAME, fullBodyDay, uid } from './logic'
import type { Exercise, WorkoutDay } from './types'

type TemplateExercise = Omit<Exercise, 'id'>
const exercise = (name: string, sets: number, reps: string, cue?: string): TemplateExercise => ({
  name, sets, reps, ...(cue ? { cue } : {}),
})
const days: { name: string; exercises: TemplateExercise[]; note?: string }[] = [
  {
    name: 'Day 1: Chest & Triceps',
    exercises: [
      exercise('Incline Dumbbell Press', 3, '8-10', 'Focus on a heavy compound movement.'),
      exercise('Flat Barbell Bench Press', 3, '8-10'),
      exercise('High-to-Low Cable Flyes', 3, '12-15', 'Targets lower chest.'),
      exercise('Low-to-High Cable Flyes', 3, '12-15', 'Targets upper chest.'),
      exercise('Tricep Rope Pushdowns', 3, '12-15', 'High volume.'),
      exercise('Straight Bar Tricep Pushdowns', 3, '10-12'),
      exercise('Overhead Cable Tricep Extensions', 3, '12', 'Alternative: dumbbell kickbacks.'),
      exercise('Bodyweight Dips', 3, 'failure', 'Finisher.'),
    ],
  },
  {
    name: 'Day 2: Back & Biceps',
    exercises: [
      exercise('Wide-Grip Lat Pulldowns', 3, '10-12'),
      exercise('Seated Cable Rows', 3, '10-12', 'Alternative: chest-supported T-bar rows.'),
      exercise('Single-Arm Dumbbell Rows', 3, '8-10'),
      exercise('Bodyweight Pull-Ups', 3, 'failure'),
      exercise('Heavy Barbell Bicep Curls', 3, '6-8', 'Low volume, heavy weight.'),
      exercise('Dumbbell Incline Bicep Curls', 3, '12', 'Stretches the long head.'),
      exercise('Dumbbell Hammer Curls', 3, '12-15', 'Builds forearm and bicep thickness.'),
      exercise('Cable Preacher Curls', 3, '15', 'High-volume isolation finisher.'),
    ],
  },
  {
    name: 'Day 3: Shoulders & Abs',
    exercises: [
      exercise('Seated Dumbbell Shoulder Press', 3, '8-10'),
      exercise('Standing Dumbbell Lateral Raises', 4, '12-15', 'Crucial for the V-taper look.'),
      exercise('Cable Lateral Raises', 3, '15', 'Constant tension on side delts.'),
      exercise('Dumbbell Rear Delt Flyes', 4, '15', 'Alternative: Reverse Pec Deck.'),
      exercise('Hanging Leg Raises', 3, 'failure', 'Focus on controlling the lower negative.'),
      exercise('Cable Crunches', 3, '12-15', 'Weighted resistance to grow the abs.'),
      exercise('Decline Bench Sit-Ups', 3, '15-20'),
    ],
  },
  {
    name: 'Day 4: Legs & Cardio',
    exercises: [
      exercise('Barbell Back Squats', 3, '6-8', 'Alternative: heavy Hack Squats.'),
      exercise('Leg Press', 3, '10-12'),
      exercise('Leg Extensions', 4, '12-15', 'Quad isolation.'),
      exercise('Seated Hamstring Curls', 4, '12-15'),
      exercise('Standing Calf Raises', 4, '15-20'),
      { ...exercise('Incline Treadmill Walking', 1, '20-30', 'Moderate intensity cardio.'), measurement: 'minutes' },
    ],
  },
  {
    name: 'Day 5: Full-Body Retargeting',
    note: 'This day is customized to fix "lagging" body parts. To escape the skinny-fat look, use this day to hit your Upper Chest, Lateral Delts, and Upper Back again to widen your frame and make your waist look naturally smaller.',
    exercises: [
      exercise('Incline Dumbbell Flyes', 3, '12'),
      exercise('Dumbbell Lateral Raises', 4, '15'),
      exercise('Lat Pulldowns (Underhand Grip)', 3, '10-12'),
      exercise('Cable Rope Face Pulls', 3, '15'),
      exercise("Captain's Chair Leg Raises", 3, 'failure'),
    ],
  },
  {
    name: 'Day 6: Hybrid Routine & Conditioning',
    exercises: [
      exercise('Dumbbell Clean and Press', 3, '8', 'Full-body explosive movement.'),
      exercise('Kettlebell Swings', 3, '15'),
      { ...exercise("Dumbbell Farmer's Walks", 3, '50', 'Builds core and forearm strength.'), measurement: 'metres' },
      { ...exercise('Stairmaster or Rowing Machine', 1, '20-30', 'High-intensity active conditioning.'), measurement: 'minutes' },
    ],
  },
]

export const workoutTemplates: { name: string; create: () => WorkoutDay }[] = [
  { name: FULL_BODY_NAME, create: fullBodyDay },
  ...days.map((day) => ({
    name: day.name,
    create: (): WorkoutDay => ({
      ...day, id: uid(), exercises: day.exercises.map((exercise) => ({ ...exercise, id: uid() })),
    }),
  })),
]
