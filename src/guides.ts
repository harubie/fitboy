import type { Exercise } from './types'

export type GuideId = 'pulldown' | 'curl' | 'squat' | 'press' | 'crunch' | 'raises' | 'plank'
export type Guide = {
  id: GuideId
  names: string[]
  muscles: string
  steps: string[]
  avoid: string[]
  easier: string
  harder: string
  positions: [string, string]
}

const guides: Guide[] = [
  {
    id: 'pulldown',
    names: ['Lat Pulldowns', 'Lat Pulldown'],
    muscles: 'lats, upper back, biceps',
    steps: [
      'Adjust the thigh pad so your feet stay flat and your thighs are secure. Grip the bar slightly wider than your shoulders.',
      'Sit tall, brace your middle and lean back just slightly. Keep your ribs controlled.',
      'Pull your elbows down toward your sides, bringing the bar toward your upper chest.',
      'Let the bar rise slowly until your arms are extended, without lifting off the seat.',
    ],
    avoid: ['Pulling the bar behind your neck', 'Swinging backward to move the weight'],
    easier: 'Use a lighter weight.',
    harder: 'Add a little weight while keeping the return slow.',
    positions: ['Arms extended', 'Pull down'],
  },
  {
    id: 'curl',
    names: ['Dumbbell Bicep Curls', 'Dumbbell Bicep Curl', 'Dumbbell Biceps Curls', 'Dumbbell Biceps Curl'],
    muscles: 'biceps, forearms',
    steps: [
      'Stand tall with a dumbbell in each hand, arms by your sides and knees relaxed.',
      'Keep your upper arms close to your ribs. Turn your palms forward as you curl the weights.',
      'Bend your elbows to bring the weights toward your shoulders without moving your torso.',
      'Lower slowly until your arms are nearly straight.',
    ],
    avoid: ['Swinging your back to lift the weights', 'Letting your elbows drift far forward'],
    easier: 'Use lighter dumbbells.',
    harder: 'Lower for three seconds before the next rep.',
    positions: ['Arms down', 'Curl up'],
  },
  {
    id: 'squat',
    names: ['Goblet Squats', 'Goblet Squat'],
    muscles: 'quads, glutes',
    steps: [
      'Hold a dumbbell upright close to your chest. Stand with feet about shoulder-width apart and toes turned out slightly.',
      'Brace your middle, bend your knees and sit down between your hips. Keep your whole foot on the floor.',
      'Lower as far as you can comfortably control, letting your knees track in line with your toes.',
      'Push through your whole foot to stand, keeping the dumbbell close to your chest.',
    ],
    avoid: ['Heels lifting off the floor', 'Knees collapsing inward'],
    easier: 'Try a bodyweight squat to a bench.',
    harder: 'Add a little weight or pause briefly at the bottom.',
    positions: ['Stand', 'Lower'],
  },
  {
    id: 'press',
    names: ['Dumbbell Chest Press', 'Dumbbell Bench Press'],
    muscles: 'chest, front shoulders, triceps',
    steps: [
      'Lie on a flat bench with feet firmly on the floor. Hold the dumbbells above your chest with wrists straight.',
      'Keep your shoulder blades gently back against the bench. Angle your upper arms about 30–60 degrees from your torso.',
      'Lower the weights slowly toward the sides of your chest, stopping at a comfortable depth.',
      'Press upward without bouncing or knocking the dumbbells together. Ask gym staff for help getting into position if needed.',
    ],
    avoid: ['Flaring your elbows straight out to the sides', 'Letting your wrists bend backward'],
    easier: 'Use lighter dumbbells or a chest press machine.',
    harder: 'Add a small amount of weight with the same control.',
    positions: ['Lower', 'Press up'],
  },
  {
    id: 'crunch',
    names: ['Cable Crunches', 'Cable Crunch'],
    muscles: 'abdominals',
    steps: [
      'Attach a rope to a high pulley. Kneel facing it and hold the rope beside your temples.',
      'Brace your middle and keep your hips relatively still. Start with a light weight.',
      'Curl your ribs toward your pelvis, rounding through your upper body rather than pulling with your arms.',
      'Slowly uncurl to the starting position without letting the weight stack slam.',
    ],
    avoid: ['Sitting your hips back instead of curling your trunk', 'Yanking the rope with your arms or neck'],
    easier: 'Try a floor crunch without weight.',
    harder: 'Increase the cable weight slightly.',
    positions: ['Kneel tall', 'Curl down'],
  },
  {
    id: 'raises',
    names: ["Captain's Chair Raises", "Captain's Chair Raise", 'Captains Chair Raises'],
    muscles: 'abdominals, hip flexors',
    steps: [
      'Step into the chair, place your forearms on the pads and hold the handles. Keep your back against the support.',
      'Press down through your forearms so your shoulders stay away from your ears.',
      'Bend your knees and lift them toward your chest, gently curling your pelvis upward.',
      'Lower your legs slowly to the start without swinging.',
    ],
    avoid: ['Swinging your legs for momentum', 'Shrugging into your shoulders'],
    easier: 'Lift your bent knees through a smaller range.',
    harder: 'Gradually straighten your legs while lifting.',
    positions: ['Legs down', 'Knees up'],
  },
  {
    id: 'plank',
    names: ['Plank', 'Forearm Plank'],
    muscles: 'core, glutes, shoulders',
    steps: [
      'Place your forearms on the floor, elbows under your shoulders. Extend your legs and balance on your toes.',
      'Brace your middle and squeeze your glutes so your head, hips and heels form a long line.',
      'Look down and breathe steadily throughout the hold.',
      'Stop when you can no longer keep that position. Rest before your next hold.',
    ],
    avoid: ['Letting your lower back sag', 'Holding your breath or lifting your hips too high'],
    easier: 'Keep your knees on the floor.',
    harder: 'Extend the hold a little while maintaining your position.',
    positions: ['Set up', 'Hold & breathe'],
  },
]

const normalise = (name: string) => name.trim().toLowerCase().replaceAll('’', "'").replace(/\s+/g, ' ')

export function exerciseGuide(name: string): Guide | undefined {
  const key = normalise(name)
  return guides.find((guide) => guide.names.some((alias) => normalise(alias) === key))
}

export function guideSteps(exercise: Pick<Exercise, 'name' | 'instructions'>): string[] {
  const custom = exercise.instructions
    ?.split('\n')
    .map((step) => step.trim())
    .filter(Boolean)
  return custom?.length ? custom : (exerciseGuide(exercise.name)?.steps ?? [])
}
