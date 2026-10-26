// Pixel-art icons drawn to match the monster sprites. '#' uses the current text colour.
const COLORS: Record<string, string> = {
  '#': 'currentColor',
  Y: '#f6c945',
  O: '#f08a3c',
  B: '#8fd3f5',
  G: '#4ade80',
  M: '#f3e3a1',
  E: '#f6c945',
}

const ICONS = {
  nest: [
    '.....##.....',
    '....####....',
    '...######...',
    '...#..###...',
    '..##..####..',
    '..########..',
    '...######...',
    '#..........#',
    '############',
    '.##.####.##.',
    '..########..',
    '....####....',
  ],
  torii: [
    '#..........#',
    '############',
    '.##########.',
    '..##....##..',
    '############',
    '..##....##..',
    '..##....##..',
    '..##....##..',
    '..##....##..',
    '..##....##..',
    '.####..####.',
    '............',
  ],
  shield: [
    '############',
    '############',
    '#####..#####',
    '#####..#####',
    '###......###',
    '###......###',
    '#####..#####',
    '.####..####.',
    '.####..####.',
    '..########..',
    '...######...',
    '....####....',
  ],
  lair: [
    '............',
    '....####....',
    '..########..',
    '.####..####.',
    '.##......##.',
    '###......###',
    '##..E..E..##',
    '##........##',
    '##........##',
    '###......###',
    '############',
    '............',
  ],
  flame: [
    '.....O......',
    '.....OO.....',
    '....OOO.....',
    '....OOOO.O..',
    '...OOOOOOO..',
    '..OOOOYOOOO.',
    '..OOOYYOOOO.',
    '.OOOYYYYOOO.',
    '.OOYYYYYYOO.',
    '.OOYYYYYYOO.',
    '..OOYYYYOO..',
    '...OOOOOO...',
  ],
  star: [
    '.....YY.....',
    '.....YY.....',
    '....YYYY....',
    'YYYYYYYYYYYY',
    '.YYYYYYYYYY.',
    '..YYYYYYYY..',
    '...YYYYYY...',
    '...YYYYYY...',
    '..YYYYYYYY..',
    '..YYY..YYY..',
    '.YYY....YYY.',
    '.YY......YY.',
  ],
  snow: [
    'B....B....B',
    '.B..BBB..B.',
    '..B..B..B..',
    '...B.B.B...',
    '....BBB....',
    'BBBBBBBBBBB',
    '....BBB....',
    '...B.B.B...',
    '..B..B..B..',
    '.B..BBB..B.',
    'B....B....B',
  ],
  bolt: [
    '......YYYY.',
    '.....YYYY..',
    '....YYYY...',
    '...YYYY....',
    '..YYYYYYYY.',
    '.YYYYYYYY..',
    '.....YYY...',
    '....YYY....',
    '...YYY.....',
    '..YY.......',
    '.Y.........',
  ],
  check: [
    '..........GG',
    '.........GGG',
    '........GGG.',
    '.......GGG..',
    'GG....GGG...',
    'GGG..GGG....',
    '.GGGGGG.....',
    '..GGGG......',
    '...GG.......',
  ],
  moon: [
    '...MMMM...',
    '.MMMM.....',
    '.MMM......',
    'MMM.......',
    'MMM.......',
    'MMM.......',
    'MMM.......',
    '.MMM......',
    '.MMMM....M',
    '...MMMMMM.',
  ],
  trophy: [
    'YYYYYYYYYY',
    'Y.YYYYYY.Y',
    'Y.YYYYYY.Y',
    '.YYYYYYYY.',
    '..YYYYYY..',
    '...YYYY...',
    '....YY....',
    '....YY....',
    '..YYYYYY..',
    '..YYYYYY..',
  ],
  chevron: ['##....', '.##...', '..##..', '...##.', '..##..', '.##...', '##....'],
} satisfies Record<string, string[]>

export type IconName = keyof typeof ICONS

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const rows = ICONS[name]
  const w = Math.max(...rows.map((r) => r.length))
  const size = Math.max(w, rows.length)
  // Centre non-square icons in a square box so they line up with text.
  const ox = (size - w) / 2
  const oy = (size - rows.length) / 2
  return (
    <svg className={`icon-px ${className}`} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === '.' ? null : <rect key={`${x},${y}`} x={x + ox} y={y + oy} width="1" height="1" fill={COLORS[c]} />,
        ),
      )}
    </svg>
  )
}
