// Tamagotchi/Digimon-style pixel monsters with a branching evolution tree.
// Sprites are character grids; each char maps to a PALETTE colour ('.' = transparent).

export const PALETTE: Record<string, string> = {
  K: '#1d2027', // outline
  E: '#fbf7ea', // egg shell
  S: '#5fd38d', // egg spots
  D: '#14161c', // dark (ghost eyes, inside the crack)
  W: '#ffffff', // eye white / teeth
  G: '#5fd38d', // green body (recoloured by tier)
  B: '#c9f2d6', // green belly (recoloured by tier)
  H: '#f6c344', // horns / gold
  R: '#ef4444', // red
  M: '#e35d6a', // tongue / pink
  P: '#7c4dbd', // wing membrane / markings
  C: '#5eead4', // glowing eyes
  A: '#f6c344', // sparkles
  O: '#f28c38', // orange
  Y: '#fde68a', // pale yellow
  U: '#5b9cf5', // blue
  L: '#cfe3ff', // light blue
  N: '#8a5a3c', // brown
  X: '#8d939e', // stone grey
  V: '#6c5a9c', // dusk violet
  F: '#e6e0f5', // pale lavender
  T: '#2bb5a0', // teal
}

export const SCREEN = 32

type Frame = { rows: string[]; dx: number; dy: number }
type Pair = [string[], string[]] // [normal, eyes closed]

export const STAGE_NAMES = ['Egg', 'Baby I', 'Baby II', 'Child', 'Adult', 'Perfect', 'Ultimate', 'Super Ultimate']
/** Workouts (for that monster) needed to reach each stage. */
export const STAGE_MIN = [0, 1, 3, 7, 21, 50, 100, 200]
export const SUPER = STAGE_NAMES.length - 1

export type Form = {
  id: string
  name: string
  stage: number
  next: string[] // possible evolutions, picked at random
  frames: [Frame, Frame]
  fusion?: boolean // only reachable by fusing two Ultimates
}

const withRows = (base: string[], overrides: Record<number, string>) => base.map((row, i) => overrides[i] ?? row)
const mirror = (rows: string[]) => rows.map((r) => [...r].reverse().join(''))
const swap = (rows: string[], map: Record<string, string>) => rows.map((r) => [...r].map((c) => map[c] ?? c).join(''))
const swapPair = ([a, b]: Pair, map: Record<string, string>): Pair => [swap(a, map), swap(b, map)]
const blinkPair = (rows: string[], blink: Record<number, string>): Pair => [rows, withRows(rows, blink)]

/** Recolour `from` → `to` on the given rows (optionally every other pixel for stripes). */
const recolor = (rows: string[], ys: number[], from: string, to: string, striped = false) =>
  rows.map((r, y) =>
    ys.includes(y) ? [...r].map((c, x) => (c === from && (!striped || x % 2 === 0) ? to : c)).join('') : r,
  )

type Layer = [string[], number, number]

/** Overlay sprite layers onto a w×h grid; later layers draw on top. */
function compose(w: number, h: number, layers: Layer[]): string[] {
  const grid = Array.from({ length: h }, () => Array<string>(w).fill('.'))
  for (const [rows, x0, y0] of layers) {
    rows.forEach((row, y) => {
      ;[...row].forEach((c, x) => {
        if (c === '.') return
        if (!grid[y0 + y] || x0 + x < 0 || x0 + x >= w) throw new Error(`layer out of bounds at ${x0 + x},${y0 + y}`)
        grid[y0 + y][x0 + x] = c
      })
    })
  }
  return grid.map((r) => r.join(''))
}

/** Frame 0 = normal; frame 1 = blink + bob up a pixel. */
const idle = ([a, b]: Pair): [Frame, Frame] => [
  { rows: a, dx: 0, dy: 0 },
  { rows: b, dx: 0, dy: -1 },
]

/** Composite scene; `layers(f)` returns the layers for frame f. */
const scene = (w: number, h: number, layers: (f: 0 | 1) => Layer[]): [Frame, Frame] => [
  { rows: compose(w, h, layers(0)), dx: 0, dy: 0 },
  { rows: compose(w, h, layers(1)), dx: 0, dy: -1 },
]

const sparkle = (f: 0 | 1, x: number, y: number): Layer => (f ? [['A'], x + 1, y + 1] : [PLUS, x, y])

const EGG = [
  '...KKKK...',
  '..KEEEEK..',
  '.KEEEESEK.',
  '.KESEEEEK.',
  'KEEEEEEEEK',
  'KEESSEEEEK',
  'KEESSEESEK',
  'KEEEEEEEEK',
  'KEEEEESSEK',
  '.KEEEEEEK.',
  '.KKEEEEKK.',
  '...KKKK...',
]

const HATCHLING = [
  '....KKKK....',
  '..KKGGGGKK..',
  '.KGGGGGGGGK.',
  '.KGWKGGWKGK.',
  'KGGWKGGWKGGK',
  'KGGGGMMGGGGK',
  'KGGGGGGGGGGK',
  'KEKKEKKEKKEK',
  'KEEEEEEEEEEK',
  '.KEEEEEEEEK.',
  '..KKKKKKKK..',
]

const GREMLIN = [
  '..KK......KK..',
  '..KHK....KHK..',
  '...KKKKKKKK...',
  '..KGGGGGGGGK..',
  '.KGGGGGGGGGGK.',
  '.KGWWKGGWWKGK.',
  '.KGWKKGGWKKGK.',
  '.KGGGGGGGGGGK.',
  'KKGGGKMMKGGGKK',
  'KGKGGGKKGGGKGK',
  'KKKBBBBBBBBKKK',
  '.KGBBBBBBBBGK.',
  '.KGGGGGGGGGGK.',
  '.KKKK....KKKK.',
]

const BRUTE = [
  '..HH..........HH..',
  '..KHH........HHK..',
  '...KHKKKKKKKKHK...',
  '..KGGGGGGGGGGGGK..',
  '..KRRRRRRRRRRRRK..',
  '..KGGGGGGGGGGGGK..',
  '..KGWWWKGGWWWKGK..',
  '..KGWWKKGGWWKKGK..',
  '..KGGGGGGGGGGGGK..',
  '..KGGKWKWKWKWKGK..',
  '..KGGGKKKKKKGGGK..',
  'KKKGGGGGGGGGGGGKKK',
  'KGKGGBBBBBBBBGGKGK',
  'KGKGBBBBBBBBBBGKGK',
  'KKKGBBBBBBBBBBGKKK',
  '..KGGBBBBBBBBGGK..',
  '..KGGGGKKKKGGGGK..',
  '..KKKKK....KKKKK..',
]

const BEAST = [
  '....HH..........HH....',
  '....KHH........HHK....',
  '.....KHKKKKKKKKHK.....',
  '....KGGGGGGGGGGGGK....',
  '....KRRRRRRRRRRRRK....',
  '....KGKKGGGGGGKKGK....',
  '....KGWWWKGGWWWKGK....',
  '....KGWWKKGGWWKKGK....',
  '....KGGGGGGGGGGGGK....',
  '....KGGKKKKKKKKGGK....',
  '....KGGKWKMMKWKGGK....',
  '....KGGGKKKKKKGGGK....',
  '..KKKGGGGGGGGGGGGKKK..',
  '.KGGKGBBBBBBBBBBGKGGK.',
  'KGGGKBBBBBBBBBBBBKGGGK',
  'KGGKKBBBBBBBBBBBBKKGGK',
  'KGGK.KBBBBBBBBBBK.KGGK',
  'KRRK.KGBBBBBBBBGK.KRRK',
  'KGGK.KGGGGGGGGGGK.KGGK',
  '.KK..KGGGGKKGGGGK..KK.',
  '.....KGGGK..KGGGK.....',
  '....KKKKKK..KKKKKK....',
]

const WING = [
  'K.......',
  'KK......',
  'KPK.....',
  'KPPK....',
  'KPPPK...',
  'KPPPPK..',
  'KPPPPPK.',
  'KPKPPPPK',
  'KK.KPPPK',
  'K...KPPK',
  '....KKPK',
  '......KK',
]

const CROWN = [
  '.K..KK..K.',
  'KHKKHHKKHK',
  'KHHHRRHHHK',
  'KKKKKKKKKK',
]

const BIG_HORN = [
  'KK...',
  'KHK..',
  'KHHK.',
  '.KHHK',
  '..KHH',
  '...KH',
]

const PLUS = ['.A.', 'AAA', '.A.']

const SPROUT = [
  '..KK....KK..',
  '.KGGK..KGGK.',
  '.KGGGKKGGGK.',
  'KGGGGGGGGGGK',
  'KGGKWGGKWGGK',
  'KGGKKGGKKGGK',
  'KGGGGMMGGGGK',
  'KGBBBBBBBBGK',
  '.KGGGGGGGGK.',
  '..KKK..KKK..',
]

const EMBIT = [
  '......KK......',
  '.....KYYK.....',
  '....KYRRYK....',
  '...KKYRRYKK...',
  '..KOOKKKKOOK..',
  '.KOOOOOOOOOOK.',
  '.KOWWKOOWWKOK.',
  '.KOWKKOOWKKOK.',
  '.KOOOOOOOOOOK.',
  '.KOOKWKKWKOOK.',
  '.KKOOKKKKOOKK.',
  'KOKYYYYYYYYKOK',
  '.KOYYYYYYYYOK.',
  '..KOOOKKOOOK..',
  '..KKKK..KKKK..',
]

const FROSTBUN = [
  '..KK......KK..',
  '.KLUK....KULK.',
  '.KLUK....KULK.',
  '.KLUK....KULK.',
  '..KUKKKKKKUK..',
  '..KUUUUUUUUK..',
  '.KUUUUUUUUUUK.',
  '.KUWWKUUWWKUK.',
  '.KUWKKUUWKKUK.',
  '.KULLUUUULLUK.',
  '.KUUUUMMUUUUK.',
  '..KUUUUUUUUK..',
  '.KUKWWWWWWKUK.',
  '.KUKWWWWWWKUK.',
  '..KUUKKKKUUK..',
  '..KKKK..KKKK..',
]

const SHELLBACK = [
  '.......KKKKKK.......',
  '.....KKNNYYNNKK.....',
  '....KNNYNNNNYNNK....',
  '...KNYNNNYYNNNYNK...',
  '..KNNNNYNNNNYNNNNK..',
  '..KKKKKKKKKKKKKKKK..',
  '..KTTTTTTTTTTTTTTK..',
  '..KTTWWKTTTTWWKTTK..',
  '..KTTWKKTTTTWKKTTK..',
  '..KTTTTTTMMTTTTTTK..',
  '.KKKTTTTTTTTTTTTKKK.',
  'KTTKNNNNNNNNNNNNKTTK',
  'KTTKKKKKKKKKKKKKKTTK',
  '.KK.KTTTK..KTTTK.KK.',
  '....KKKKK..KKKKK....',
]

const FANG = [
  '..KK..........KK..',
  '..KVK........KVK..',
  '..KVVK......KVVK..',
  '..KVVVKKKKKKVVVK..',
  '..KVVVVVVVVVVVVK..',
  '.KVVVVVVVVVVVVVVK.',
  '.KVVWWWKVVKWWWVVK.',
  '.KVVVWWKVVKWWVVVK.',
  '.KVVVVVVVVVVVVVVK.',
  '..KVVVVKKKKVVVVK..',
  '..KVVVKWKKWKVVVK..',
  '...KVVVKKKKVVVK...',
  '..KKVVFFFFFFVVKK..',
  '.KVKVFFFFFFFFVKVK.',
  '.KVKVVFFFFFFVVKVK.',
  '.KKKVVVVVVVVVVKKK.',
  '...KVVVVKKVVVVK...',
  '...KKKKK..KKKKK...',
]

const SPOOK = [
  '.....KKKKKK.....',
  '...KKFFFFFFKK...',
  '..KFFFFFFFFFFK..',
  '.KFFFFFFFFFFFFK.',
  '.KFFDDFFFFDDFFK.',
  '.KFDDDDFFDDDDFK.',
  '.KFDDDDFFDDDDFK.',
  '.KFFDDFFFFDDFFK.',
  '.KFFFFFKKFFFFFK.',
  'KFFFFFKMMKFFFFFK',
  'KFKFFFFKKFFFFKFK',
  'KKKFFFFFFFFFFKKK',
  '.KFFFFFFFFFFFFK.',
  '.KFFFKFFFFKFFFK.',
  '.KFK.KFKKFK.KFK.',
  '..K...K..K...K..',
]

const GOLEM = [
  '.......KKKKKKKK.......',
  '......KXXXXXXXXK......',
  '.....KXXXXXXXXXXK.....',
  '.....KXCCKXXKCCXK.....',
  '.....KXXXXXXXXXXK.....',
  '.....KXKKKKKKKKXK.....',
  '..KKKKKXXXXXXXXKKKKK..',
  '.KXXXXKKKKKKKKKKXXXXK.',
  'KXXGXXKXXXXXXXXKXXGXXK',
  'KXXXXXKXXXGXXXXKXXXXXK',
  'KXXXXXKXXXXXXXXKXXXXXK',
  'KXXXXXKXXXXXXGXKXXXXXK',
  '.KXXXKKXXXXXXXXKKXXXK.',
  '.KKKKKKXXXGXXXXKKKKKK.',
  '......KXXXXXXXXK......',
  '.....KXXXXKKXXXXK.....',
  '....KXXXXK..KXXXXK....',
  '....KKKKKK..KKKKKK....',
]

const SMALL_WING = ['K....', 'KK...', 'KRK..', 'KRRK.', 'KRRRK', '.KKKK']

const SCYTHE = [
  '.KKKKK.',
  'KWWWWWK',
  '.KKKKWK',
  ...Array<string>(13).fill('....KNK'),
]

const CLUB = ['.KKK.', 'KNNNK', 'KNKNK', 'KNNNK', '.KNK.', '.KNK.', '.KNK.', '.KNK.', '.KKK.']

const HALO = ['.AAAAAA.', 'A......A', '.AAAAAA.']

// Blink pairs for every body.
const P_HATCH = blinkPair(HATCHLING, { 3: '.KGKGGGKGGK.', 4: 'KGKGKGKGKGGK' })
const P_SPROUT = blinkPair(SPROUT, { 4: 'KGGGGGGGGGGK' })
const P_GREMLIN = blinkPair(GREMLIN, { 5: '.KGGGGGGGGGGK.', 6: '.KGKKKGGKKKGK.' })
const P_EMBIT = blinkPair(EMBIT, { 6: '.KOOOOOOOOOOK.', 7: '.KOKKKOOKKKOK.' })
const P_FROST = blinkPair(FROSTBUN, { 7: '.KUUUUUUUUUUK.', 8: '.KUKKKUUKKKUK.' })
const P_BRUTE = blinkPair(BRUTE, { 6: '..KGGGGGGGGGGGGK..', 7: '..KGKKKKGGKKKKGK..' })
const P_SHELL = blinkPair(SHELLBACK, { 7: '..KTTTTTTTTTTTTTTK..', 8: '..KTTKKKTTTTKKKTTK..' })
const P_FANG = blinkPair(FANG, { 6: '.KVVVVVVVVVVVVVVK.', 7: '.KVVKKKKVVKKKKVVK.' })
const P_SPOOK: Pair = [SPOOK, withRows(SPOOK, { 5: '.KFDWDDFFDWDDFK.' })]
const P_BEAST = blinkPair(BEAST, { 6: '....KGGGGGGGGGGGGK....', 7: '....KGKKKKGGKKKKGK....' })
const P_GOLEM = blinkPair(GOLEM, { 3: '.....KXKKKXXKKKXK.....' })

const P_DRAKE = swapPair(P_BRUTE, { G: 'O', B: 'Y', R: 'O' })
const P_ONI = swapPair(P_BRUTE, { G: 'R', R: 'H', B: 'M' })
const P_WYVERN = swapPair(P_BEAST, { G: 'O', B: 'Y', R: 'H' })
const P_SERAPH = swapPair(P_BEAST, { G: 'Y', B: 'W', R: 'H' })
const P_DIRE = swapPair(P_FANG, { V: 'X', W: 'C' })
const P_WRAITH = swapPair(P_SPOOK, { F: 'V', D: 'R' })
const P_BEHEMOTH = swapPair(P_GOLEM, { X: 'N' })
const mythicBody = (rows: string[]) => recolor(recolor(rows, [6, 7], 'W', 'C'), [14, 16, 18], 'B', 'P', true)
const P_MYTHIC: Pair = [mythicBody(P_BEAST[0]), mythicBody(P_BEAST[1])]

const RED_WING = swap(WING, { P: 'R' })
const WHITE_WING = swap(WING, { P: 'W' })

/** Winged Beast-type layout used by several late forms (30×26 canvas, body at 4,4). */
const winged = (body: Pair, wing: string[], extras: (f: 0 | 1) => Layer[] = () => [], h = 26, by = 4) =>
  scene(30, h, (f) => [[wing, 0, by + 1 + f], [mirror(wing), 22, by + 1 + f], [body[f], 4, by], ...extras(f)])

const wraithLayers = (body: Pair, f: 0 | 1, x: number, y: number): Layer[] => [
  [body[f], x, y + 2],
  [SCYTHE, x + 11, y],
]

const ancientLayers = (f: 0 | 1): Layer[] => [
  [WING, 1, 9 + f],
  [mirror(WING), 23, 9 + f],
  [BIG_HORN, 5, 4],
  [mirror(BIG_HORN), 22, 4],
  [P_MYTHIC[f], 5, 8],
  [CROWN, 11, 7],
  ...([[0, 2], [29, 0], [12, 0], [0, 22], [29, 21]] as const).map(([x, y]) => sparkle(f, x, y)),
]

/** Fusion: left half keeps the tier colour, right half turns blue with red wings. */
const fuseHalves = (rows: string[]) =>
  rows.map((r) =>
    [...r].map((c, x) => (x < r.length / 2 ? c : ({ G: 'U', B: 'L', P: 'R' } as Record<string, string>)[c] ?? c)).join(''),
  )

const F = (id: string, name: string, stage: number, next: string[], frames: [Frame, Frame], fusion = false): Form => ({
  id,
  name,
  stage,
  next,
  frames,
  fusion,
})

export const FORMS: Form[] = [
  F('egg', 'Mystery Egg', 0, ['hatchling'], [
    { rows: EGG, dx: -1, dy: 0 },
    { rows: EGG, dx: 1, dy: 0 },
  ]),
  F('hatchling', 'Hatchling', 1, ['sprout'], idle(P_HATCH)),
  F('sprout', 'Sprout', 2, ['gremlin', 'embit', 'frostbun'], idle(P_SPROUT)),

  F('gremlin', 'Gremlin', 3, ['brute', 'fang', 'spook'], idle(P_GREMLIN)),
  F('embit', 'Embit', 3, ['drake', 'brute', 'shellback'], idle(P_EMBIT)),
  F('frostbun', 'Frostbun', 3, ['shellback', 'spook', 'fang'], idle(P_FROST)),

  F('brute', 'Brute', 4, ['beast', 'oni', 'golem'], idle(P_BRUTE)),
  F('drake', 'Drake', 4, ['wyvern', 'titan', 'oni'],
    scene(26, 18, (f) => [[SMALL_WING, 0, 6 + f], [mirror(SMALL_WING), 21, 6 + f], [P_DRAKE[f], 4, 0]])),
  F('shellback', 'Shellback', 4, ['golem', 'beast'], idle(P_SHELL)),
  F('fang', 'Fang', 4, ['direwolf', 'titan'], idle(P_FANG)),
  F('spook', 'Spook', 4, ['wraith', 'direwolf'], idle(P_SPOOK)),

  F('beast', 'Beast', 5, ['legend', 'behemoth'], idle(P_BEAST)),
  F('titan', 'Titan', 5, ['legend', 'seraph'], winged(P_BEAST, WING, () => [], 24, 2)),
  F('wyvern', 'Wyvern', 5, ['seraph', 'mythic'], winged(P_WYVERN, RED_WING, () => [], 24, 2)),
  F('golem', 'Golem', 5, ['behemoth'], idle(P_GOLEM)),
  F('direwolf', 'Direwolf', 5, ['mythic', 'phantom'],
    scene(20, 22, (f) => [[BIG_HORN, 0, 0], [mirror(BIG_HORN), 15, 0], [P_DIRE[f], 1, 4]])),
  F('wraith', 'Wraith', 5, ['phantom', 'mythic'], scene(22, 18, (f) => wraithLayers(P_WRAITH, f, 2, 0))),
  F('oni', 'Oni', 5, ['behemoth', 'legend'],
    scene(26, 22, (f) => [[P_ONI[f], 3, 4], [BIG_HORN, 2, 0], [mirror(BIG_HORN), 19, 0], [CLUB, 21, 8]])),

  F('legend', 'Legend', 6, ['ancient'],
    winged(P_BEAST, WING, (f) => [[CROWN, 10, 3], sparkle(f, 0, 0), sparkle(f, 27, 1)])),
  F('mythic', 'Mythic', 6, ['ancient'],
    winged(P_MYTHIC, WING, (f) => [[CROWN, 10, 3], ...([[0, 0], [27, 1], [0, 18], [27, 17]] as const).map(([x, y]) => sparkle(f, x, y))])),
  F('seraph', 'Seraph', 6, ['ancient'],
    winged(P_SERAPH, WHITE_WING, (f) => [[HALO, 11, 0], sparkle(f, 0, 0), sparkle(f, 27, 1)])),
  F('behemoth', 'Behemoth', 6, ['ancient'],
    scene(26, 24, (f) => [
      [BIG_HORN, 5, 1],
      [mirror(BIG_HORN), 16, 1],
      [P_BEHEMOTH[f], 2, 6],
      [CROWN, 8, 3],
      sparkle(f, 0, 0),
      sparkle(f, 23, 0),
    ])),
  F('phantom', 'Phantom King', 6, ['ancient'],
    scene(24, 22, (f) => [
      ...wraithLayers(swapPair(P_WRAITH, { R: 'C' }), f, 3, 4),
      [CROWN, 6, 4],
      sparkle(f, 0, 0),
      sparkle(f, 21, 2),
    ])),

  F('ancient', 'Ancient', 7, [], scene(32, 30, ancientLayers)),
  F('chimera', 'Chimera', 7, [],
    scene(32, 30, ancientLayers).map((fr) => ({ ...fr, rows: fuseHalves(fr.rows) })) as [Frame, Frame], true),
]

export const FORM_BY_ID: Record<string, Form> = Object.fromEntries(FORMS.map((f) => [f.id, f]))
export const formsAtStage = (stage: number) => FORMS.filter((f) => f.stage === stage)

/** Past Super Ultimate the body changes colour every 100 workouts, forever. */
export const TIER_EVERY = 100
const TIERS = [
  { name: 'Emerald', G: '#5fd38d', B: '#c9f2d6' },
  { name: 'Sapphire', G: '#5b9cf5', B: '#d3e3fd' },
  { name: 'Amethyst', G: '#a57cf2', B: '#e6dcfd' },
  { name: 'Golden', G: '#f0b43c', B: '#fdecc8' },
  { name: 'Obsidian', G: '#535c70', B: '#a9b1c2' },
]

export function tierFor(workouts: number): number {
  const over = workouts - STAGE_MIN[SUPER]
  return over < 0 ? 0 : Math.floor(over / TIER_EVERY)
}

export function tierName(tier: number): string {
  if (tier < TIERS.length) return TIERS[tier].name
  const n = tier - TIERS.length + 1
  return n === 1 ? 'Prismatic' : `Prismatic ${n}`
}

function tierColors(tier: number, frame: 0 | 1): { G: string; B: string } {
  if (tier < TIERS.length) return TIERS[tier]
  // Prismatic: a new hue every tier that shimmers between frames.
  const hue = (tier * 67 + frame * 40) % 360
  return { G: `hsl(${hue} 70% 58%)`, B: `hsl(${hue} 80% 88%)` }
}

/** Stage reached with this many workouts. */
export function stageFor(workouts: number): number {
  let s = 0
  STAGE_MIN.forEach((min, i) => {
    if (workouts >= min) s = i
  })
  return s
}

/** One ⭐ per 30 workouts in a streak; kept forever. */
export const STAR_EVERY = 30

export type View = { x: number; y: number; size: number }

/** Small forms get a zoomed-in camera; it pulls back once they outgrow it. */
export function viewFor(formId: string): View {
  const rows = FORM_BY_ID[formId].frames[0].rows
  return rows.length <= 22 && rows[0].length <= 22 ? { x: 4, y: 8, size: 24 } : { x: 0, y: 0, size: SCREEN }
}

// "Zz" drawn when sleepy; the second frame adds a bigger Z.
const SMALL_Z = ['KKKK', '..K.', '.K..', 'KKKK']
const BIG_Z = ['KKKKK', '...K.', '..K..', '.K...', 'KKKKK']

export type Pixel = { x: number; y: number; color: string }

function stamp(rows: string[], x0: number, y0: number, out: Pixel[], palette: Record<string, string>) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = palette[row[x]]
      if (color) out.push({ x: x0 + x, y: y0 + y, color })
    }
  })
}

/** Pixels for a frame, bottom-centred on the screen (last row is the ground). */
export function framePixels(formId: string, frame: 0 | 1, asleep = false, tier = 0): Pixel[] {
  const out: Pixel[] = []
  const palette = { ...PALETTE, ...tierColors(tier, frame) }
  const frames = FORM_BY_ID[formId].frames
  // Asleep: eyes stay shut (the blink frame) and it stops bouncing.
  const f = asleep ? frames[1] : frames[frame]
  const dx = asleep ? 0 : f.dx
  const dy = asleep ? 0 : f.dy
  const w = f.rows[0].length
  const h = f.rows.length
  stamp(f.rows, Math.floor((SCREEN - w) / 2) + dx, SCREEN - 1 - h + dy, out, palette)
  if (asleep) {
    // Zzz in the gap above the sprite: small Z, then a bigger one on the next frame.
    const v = viewFor(formId)
    const top = SCREEN - 1 - h
    const z = frame === 1 ? BIG_Z : SMALL_Z
    stamp(z, v.x + v.size - 7, Math.max(v.y, top - z.length - 1), out, palette)
  }
  return out
}
