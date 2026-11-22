// TEMPORARY mock-up comparing exercise guide visuals. Delete before commit.
import '@fontsource-variable/outfit'
import { createContext, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/App.css'

// Side-view sprite, facing right. H hair, S skin, T shirt, B shorts, W weight, K shoes.
const STAND = [
  '................',
  '......HHH.......',
  '.....HHHHH......',
  '.....HHSSS......',
  '......SSSS......',
  '.......SS.......',
  '......TTTT......',
  '.....TTTTSWW....',
  '.....TTTSSWW....',
  '.....TTTT.WW....',
  '.....TTTT.......',
  '.....TTTT.......',
  '.....BBBB.......',
  '.....BBBB.......',
  '......SS........',
  '......SS........',
  '......SS........',
  '......SS........',
  '......SS........',
  '......SS........',
  '......KKKK......',
]
const SQUAT = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '.....HHH........',
  '....HHHHH.......',
  '....HHSSS.......',
  '.....SSSS.......',
  '......SS........',
  '.....TTTT.......',
  '....TTTTSWW.....',
  '....TTTSSWW.....',
  '...TTTT..WW.....',
  '..TTTT..........',
  '.BBBBSSSSS......',
  '.BBBBSSSSSS.....',
  '........SS......',
  '.......SS.......',
  '......SS........',
  '......KKKK......',
]
const PAL: Record<string, string> = {
  H: '#3b2a20',
  S: '#e8b48a',
  T: '#4ade80',
  B: '#60a5fa',
  W: '#8b92a3',
  K: '#eef0f4',
}

function Frame({ rows, className }: { rows: string[]; className: string }) {
  return (
    <g className={className}>
      {rows.flatMap((r, y) =>
        [...r].map((c, x) => (c === '.' ? null : <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={PAL[c]} />)),
      )}
    </g>
  )
}

function PixelVisual() {
  return (
    <div className="g-visual g-pixel">
      <svg viewBox="0 0 16 22" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="0" y="21" width="16" height="1" fill="#2a2e38" />
        <Frame rows={STAND} className="f0" />
        <Frame rows={SQUAT} className="f1" />
      </svg>
    </div>
  )
}

type P = [number, number]
type Pose = { head: P; shoulder: P; elbow: P; hand: P; hip: P; knee: P; ankle: P; heel: P; toe: P }

const STANDING: Pose = {
  head: [102, 25],
  shoulder: [100, 50],
  elbow: [103, 82],
  hand: [117, 62],
  hip: [98, 101],
  knee: [100, 143],
  ankle: [100, 181],
  heel: [95, 188],
  toe: [119, 188],
}
const BOTTOM: Pose = {
  head: [114, 90],
  shoulder: [105, 111],
  elbow: [116, 141],
  hand: [127, 119],
  hip: [79, 156],
  knee: [122, 150],
  ankle: [100, 181],
  heel: [95, 188],
  toe: [119, 188],
}

const SOLID = {
  skin: '#d5d9e1',
  far: '#9ea5b3',
  line: '#0b0d11',
  lineFar: '#0b0d11',
  shorts: '#3a404c',
  shortsFar: '#2b303a',
  hair: '#4b5160',
  shoe: '#eef0f4',
  sole: '#8b92a3',
  plate: '#5b6270',
  plateHi: '#7c8494',
  bar: '#9ca3af',
  muscle: '#f87171',
}
const LINE: typeof SOLID = {
  skin: '#0b0d11',
  far: '#0b0d11',
  line: '#d5d9e1',
  lineFar: '#5b6270',
  shorts: '#1c2029',
  shortsFar: '#0b0d11',
  hair: '#1c2029',
  shoe: '#0b0d11',
  sole: '#5b6270',
  plate: '#1c2029',
  plateHi: '#2a2e38',
  bar: '#0b0d11',
  muscle: '#f87171',
}
const Pal = createContext(SOLID)

const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]]
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]]
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k]
const unit = (a: P): P => {
  const l = Math.hypot(a[0], a[1]) || 1
  return [a[0] / l, a[1] / l]
}
const lerp = (a: P, b: P, t: number): P => add(a, mul(sub(b, a), t))
const pts = (ps: P[]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')

/** Piecewise-linear profile through [t, value] knots. */
function prof(knots: [number, number][], t: number) {
  for (let i = 1; i < knots.length; i++)
    if (t <= knots[i][0]) {
      const [t0, v0] = knots[i - 1]
      const [t1, v1] = knots[i]
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0)
    }
  return knots[knots.length - 1][1]
}

/** Organic limb between a and b: separate profiles for the two sides (side 1 = "front" normal). */
function shape(a: P, b: P, front: [number, number][], back: [number, number][], t0 = 0, t1 = 1, n = 18) {
  const u = unit(sub(b, a))
  const nf: P = [u[1], -u[0]]
  const left: P[] = []
  const right: P[] = []
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n
    const c = lerp(a, b, t)
    left.push(add(c, mul(nf, prof(front, t))))
    right.push(add(c, mul(nf, -prof(back, t))))
  }
  return pts([...left, ...right.reverse()])
}

function Part({ d, fill, far }: { d: string; fill: string; far?: boolean }) {
  const C = useContext(Pal)
  return <polygon points={d} fill={fill} stroke={far ? C.lineFar : C.line} strokeWidth="1.1" strokeLinejoin="round" />
}

// Radii profiles (front side, back side) along each segment.
const UPPER_ARM_F: [number, number][] = [[-0.1, 2], [0, 4.6], [0.45, 5.2], [1, 3.6], [1.1, 1.5]]
const UPPER_ARM_B: [number, number][] = [[-0.1, 2], [0, 4.6], [0.4, 5.6], [1, 3.6], [1.1, 1.5]]
const FOREARM: [number, number][] = [[-0.08, 2], [0, 3.6], [0.25, 4.3], [1, 2.4], [1.12, 1.2]]
const THIGH_F: [number, number][] = [[0, 9], [0.35, 8.6], [0.85, 5.6], [1, 5], [1.08, 2.5]]
const THIGH_B: [number, number][] = [[0, 8], [0.4, 7], [1, 5], [1.08, 2.5]]
const SHIN_F: [number, number][] = [[-0.05, 3], [0, 4.4], [0.5, 3.4], [1, 2.6], [1.05, 1.5]]
const SHIN_B: [number, number][] = [[-0.05, 3], [0, 4.6], [0.3, 6], [0.75, 3.3], [1, 2.8], [1.05, 1.5]]
const SHORTS: [number, number][] = [[-0.16, 5], [-0.06, 9.5], [0.1, 10], [0.42, 8.6]]
// Torso from hip (t=0) to shoulder (t=1): front = belly/chest, back = glutes/back.
const TORSO_F: [number, number][] = [[-0.14, 3], [-0.05, 8], [0.12, 9], [0.38, 7.5], [0.55, 9], [0.74, 13], [0.9, 11], [1.08, 4]]
const TORSO_B: [number, number][] = [[-0.14, 4], [-0.04, 12], [0.1, 13], [0.28, 9], [0.42, 7.5], [0.62, 9], [0.82, 11.5], [1, 9.5], [1.08, 4]]

function Figure({ p, ghost, muscles }: { p: Pose; ghost?: boolean; muscles?: boolean }) {
  const C = useContext(Pal)
  const tU = unit(sub(p.shoulder, p.hip))
  const neckBase = add(p.shoulder, mul(tU, 2))
  const hd = unit(sub(p.head, neckBase))
  const headAngle = (Math.atan2(hd[1], hd[0]) * 180) / Math.PI + 90
  const leg = (dx: number, skin: string, shorts: string) => {
    const far = dx !== 0
    const o: P = [dx, 0]
    const h = add(p.hip, o)
    const k = add(p.knee, o)
    const an = add(p.ankle, o)
    return (
      <g>
        <Part d={shape(an, k, SHIN_B.map(([t, v]) => [1 - t, v]).reverse() as [number, number][], SHIN_F.map(([t, v]) => [1 - t, v]).reverse() as [number, number][])} fill={skin} far={far} />
        <Part d={shape(h, k, THIGH_F, THIGH_B)} fill={skin} far={far} />
        <Part d={shape(h, k, SHORTS, SHORTS, -0.16, 0.42, 12)} fill={shorts} far={far} />
        <Shoe far={far} heel={add(p.heel, o)} toe={add(p.toe, o)} ankle={an} />
      </g>
    )
  }
  const arm = (dx: number, skin: string) => {
    const far = dx !== 0
    const o: P = [dx, 0]
    return (
      <g>
        <Part d={shape(add(p.shoulder, o), add(p.elbow, o), UPPER_ARM_F, UPPER_ARM_B, -0.1, 1.1)} fill={skin} far={far} />
        <Part d={shape(add(p.elbow, o), add(p.hand, o), FOREARM, FOREARM, -0.08, 1.12)} fill={skin} far={far} />
      </g>
    )
  }
  return (
    <g opacity={ghost ? (C === LINE ? 0.3 : 0.13) : 1}>
      {!ghost && <ellipse cx={(p.heel[0] + p.toe[0]) / 2} cy="190" rx="26" ry="3" fill="#000" opacity="0.45" />}
      {leg(-3, C.far, C.shortsFar)}
      {arm(-3, C.far)}
      {/* neck + head */}
      <Part d={shape(neckBase, p.head, [[0, 4.6], [1, 4.2]], [[0, 5], [1, 4.4]], 0, 0.75, 4)} fill={C.skin} />
      <g transform={`translate(${p.head[0]} ${p.head[1]}) rotate(${headAngle})`}>
        <ellipse rx="10.5" ry="12" fill={C.skin} stroke={C.line} strokeWidth="1.1" />
        <path d="M 10 -2 L 13 2 L 10 3.5" fill={C.skin} stroke={C.line} strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M -10.5 -1 C -11 -12 -2 -14.5 6 -11 C 9 -9.5 10.5 -7 10.5 -5 C 4 -9 -2 -6 -6 -1 Z" fill={C.hair} stroke={C.line} strokeWidth="1.1" />
      </g>
      {/* torso + shorts */}
      <Part d={shape(p.hip, p.shoulder, TORSO_B, TORSO_F, -0.14, 1.08, 26)} fill={C.skin} />
      <Part d={shape(p.hip, p.shoulder, TORSO_B.map(([t, v]) => [t, v + 0.8]), TORSO_F.map(([t, v]) => [t, v + 0.8]), -0.14, 0.2, 10)} fill={C.shorts} />
      <Dumbbell at={p.hand} />
      {arm(0, C.skin)}
      <circle cx={p.hand[0]} cy={p.hand[1]} r="4" fill={C.skin} stroke={C.line} strokeWidth="1.1" />
      {leg(0, C.skin, C.shorts)}
      {muscles && (
        <>
          {/* quads: front of thigh; glutes: back of hips */}
          <polygon points={shape(p.hip, p.knee, THIGH_F.map(([t, v]) => [t, v - 0.8]), [[0, -1], [1, -0.5]], 0.42, 0.9, 10)} fill={C.muscle} opacity="0.85" />
          <ellipse
            cx={p.hip[0] + tU[1] * 6 + tU[0] * 2}
            cy={p.hip[1] - tU[0] * 6 + tU[1] * 2}
            rx="6.5"
            ry="8"
            transform={`rotate(${(Math.atan2(tU[1], tU[0]) * 180) / Math.PI + 90} ${p.hip[0] + tU[1] * 6 + tU[0] * 2} ${p.hip[1] - tU[0] * 6 + tU[1] * 2})`}
            fill={C.muscle}
            opacity="0.8"
          />
        </>
      )}
    </g>
  )
}

function Shoe({ heel, toe, ankle, far }: { heel: P; toe: P; ankle: P; far?: boolean }) {
  const C = useContext(Pal)
  const top = add(ankle, [3, -1])
  return (
    <g>
      <path
        d={`M ${heel[0] - 1} ${heel[1]} L ${toe[0] + 2} ${toe[1]} Q ${toe[0] + 3} ${toe[1] - 6} ${toe[0] - 7} ${toe[1] - 7} L ${top[0]} ${top[1]} Q ${heel[0] - 3} ${ankle[1] - 1} ${heel[0] - 1} ${heel[1]} Z`}
        fill={C.shoe}
        stroke={far ? C.lineFar : C.line}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <rect x={heel[0] - 2} y={heel[1] - 2} width={toe[0] - heel[0] + 4} height="2.5" rx="1" fill={C.sole} />
    </g>
  )
}

function Dumbbell({ at }: { at: P }) {
  const C = useContext(Pal)
  const [x, y] = [at[0] + 2, at[1]]
  const plate = (py: number) => (
    <g>
      <rect x={x - 9} y={py} width="18" height="8" rx="1.5" fill={C.plate} stroke={C.line} strokeWidth="1" />
      <rect x={x - 9} y={py + 1.5} width="18" height="2" fill={C.plateHi} />
    </g>
  )
  return (
    <g>
      <rect x={x - 2.2} y={y - 13} width="4.4" height="26" fill={C.bar} stroke={C.line} strokeWidth="1" />
      {plate(y - 20)}
      {plate(y + 12)}
    </g>
  )
}

function Callout({ x, y, tx, ty, text, anchor = 'start' }: { x: number; y: number; tx: number; ty: number; text: string; anchor?: 'start' | 'end' }) {
  return (
    <g>
      <line x1={x} y1={y} x2={tx} y2={ty} stroke="#4ade80" strokeWidth="1.2" />
      <circle cx={x} cy={y} r="2.5" fill="#4ade80" />
      <text x={tx + (anchor === 'start' ? 3 : -3)} y={ty + 3.5} fill="#eef0f4" fontSize="10.5" fontWeight="600" textAnchor={anchor}>
        {text}
      </text>
    </g>
  )
}

function DiagramVisual() {
  return (
    <div className="g-visual g-diagram">
      <svg viewBox="0 0 340 215" aria-hidden="true" style={{ fontFamily: 'Outfit Variable, sans-serif' }}>
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#fbbf24" />
          </marker>
        </defs>
        <rect x="8" y="190" width="324" height="2" fill="#2a2e38" />
        {/* Start */}
        <g transform="translate(-40 0)">
          <Figure p={STANDING} />
        </g>
        <text x="60" y="207" fill="#8b92a3" fontSize="10" textAnchor="middle">1 · Start</text>
        {/* Bottom, with ghost of start */}
        <g transform="translate(120 0)">
          <Figure p={STANDING} ghost />
          <Figure p={BOTTOM} muscles />
          <path d="M 88 104 Q 64 124 70 144" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#ah)" />
        </g>
        <text x="220" y="207" fill="#8b92a3" fontSize="10" textAnchor="middle">2 · Bottom</text>
        <Callout x={229} y={124} tx={266} ty={80} text="Chest up" />
        <Callout x={246} y={148} tx={266} ty={128} text="Knees out" />
        <Callout x={215} y={187} tx={266} ty={172} text="Heels down" />
        <Callout x={188} y={154} tx={160} ty={128} text="Hips back" anchor="end" />
      </svg>
    </div>
  )
}

function AnatomicalVisual() {
  return (
    <div className="g-visual g-anatomy">
      <svg viewBox="0 0 340 245" role="img" aria-label="Goblet squat: standing and lowered positions, with quads and glutes highlighted.">
        <g stroke="#cbd0da" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#0b0d11">
          <g transform="translate(-27 0)">
            <path d="M95 42 L94 50 C86 52 83 58 85 70 C87 82 89 91 85 104 C80 116 83 128 87 139 L90 176 L88 187 Q98 191 116 188 Q120 185 114 183 L103 180 L104 148 C110 129 109 118 106 105 C103 95 104 85 109 74 L109 58 Q108 52 104 50 L104 43" />
            <path d="M94 43 C88 38 88 29 91 23 C94 17 105 17 108 23 L110 31 L113 34 L109 36 L108 41 Q104 47 99 44" />
            <path d="M95 29 Q98 26 99 31 L98 35 M95 39 L100 42" fill="none" />
            <path d="M88 59 C93 52 101 54 104 62 C106 68 104 78 104 85 Q109 82 116 65 Q119 60 123 63 Q126 66 122 72 L111 94 Q106 101 99 95 C94 87 91 76 90 69" />
            <path d="M95 64 Q101 67 100 78 M99 84 L103 91 M89 78 Q91 83 90 89 M89 100 Q96 102 103 100 M89 111 C95 119 98 131 96 142 M103 113 Q106 124 101 137 M95 149 Q99 157 97 169 M91 176 L101 178" fill="none" strokeWidth="1" />
            <path d="M119 60 L119 46 M119 68 L119 80 M113 42 L125 42 L125 48 L113 48 Z M113 79 L125 79 L125 85 L113 85 Z" />
          </g>
          <g>
            <path d="M197 110 C191 117 184 130 178 144 C174 155 181 163 194 164 L224 159 C219 170 212 179 210 188 L209 198 Q224 202 242 199 Q245 196 239 194 L222 190 C228 181 238 170 244 159 Q250 149 242 143 L214 139 Q224 122 226 112" stroke="#68717f" />
            <path d="M217 90 L214 99 C202 99 197 105 193 118 L178 148 C174 156 178 163 188 165 C202 168 221 163 238 160 C232 169 222 180 218 191 L217 201 Q234 205 254 202 Q259 199 251 196 L230 193 L250 164 C256 155 253 147 244 145 L212 143 C218 134 224 122 228 111 L229 102 L227 95" />
            <path d="M218 94 C211 91 207 85 209 77 C210 68 221 65 227 70 Q232 74 231 80 L234 84 L230 86 L229 92 Q225 98 218 94 Z" />
            <path d="M215 78 Q219 75 220 80 L219 84 M219 90 L224 93" fill="none" />
            <path d="M187 147 C183 145 178 149 179 156 Q181 163 191 162 L198 158 Q194 150 187 147 Z M204 147 C217 147 233 149 242 151 Q245 154 241 156 C227 155 215 158 204 159 Q209 153 204 147 Z" fill="#f87171" fillOpacity=".6" stroke="none" />
            <path d="M201 112 Q203 121 197 130 M196 135 L191 143 M211 118 Q213 125 207 133 M199 146 Q204 151 201 159 M214 150 Q227 150 236 153 M226 174 Q229 181 224 188 M219 191 L229 193" fill="none" strokeWidth="1" />
            <path d="M249 111 L249 95 M249 120 L249 136 M243 90 L255 90 L255 96 L243 96 Z M243 135 L255 135 L255 141 L243 141 Z" />
            <path d="M220 104 C228 104 230 115 230 122 L232 133 Q239 128 244 115 Q247 109 251 113 Q253 115 249 121 L241 140 C238 146 232 149 227 143 C222 136 216 124 215 117 Q213 108 220 104 Z" />
            <path d="M221 110 Q226 114 225 122 M225 130 L229 139 M237 133 L244 121" fill="none" strokeWidth="1" />
          </g>
        </g>
        <g fill="#8b92a3" fontFamily="Outfit Variable, sans-serif" fontSize="11" textAnchor="middle">
          <text x="72" y="224">1 · Stand</text>
          <text x="218" y="224">2 · Lower</text>
        </g>
        <path d="M137 95 Q150 109 150 126 M145 121 L150 127 L155 121" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function Sheet({ title, visual, tab }: { title: string; visual: React.ReactNode; tab: 'Pixel' | 'Diagram' }) {
  return (
    <div>
      <h2 className="g-col-title">{title}</h2>
      <div className="g-phone">
        <div className="g-dim">
          <div className="muted small">Workout screen behind…</div>
        </div>
        <div className="g-sheet">
          <div className="g-grab" />
          <div className="row spread">
            <h2 style={{ margin: 0 }}>Goblet Squats</h2>
            <span className="muted">✕</span>
          </div>
          <div className="muted small">Legs &amp; Glutes · Beginner</div>
          <div className="seg-picker g-tabs">
            {(['Pixel', 'Diagram'] as const).map((t) => (
              <button key={t} className={t === tab ? 'active' : ''}>
                {t === 'Pixel' ? 'Animation' : 'Diagram'}
              </button>
            ))}
          </div>
          {visual}
          {tab === 'Diagram' && (
            <div className="g-legend muted small">
              <span>
                <i className="g-swatch" /> Works: quads, glutes
              </span>
            </div>
          )}
          <h3>How to</h3>
          <ol className="g-steps">
            <li>Hold a dumbbell upright against your chest, feet shoulder-width.</li>
            <li>Sit your hips back and down, chest up, until thighs are below parallel.</li>
            <li>Push your knees out with your elbows at the bottom.</li>
            <li>Drive through your whole foot to stand back up.</li>
          </ol>
          <h3>Avoid</h3>
          <ul className="g-avoid">
            <li>Heels lifting off the floor</li>
            <li>Knees caving inward</li>
          </ul>
          <div className="g-vars small">
            <span>
              <span className="muted">Easier</span> Bodyweight squat
            </span>
            <span>
              <span className="muted">Harder</span> Split squat
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Mock() {
  return (
    <div className="g-cols">
      <Sheet title="New · anatomical line drawing" tab="Diagram" visual={<AnatomicalVisual />} />
      <Sheet title="Animation tab" tab="Pixel" visual={<PixelVisual />} />
      <Pal.Provider value={LINE}>
        <Sheet title="Previous · mannequin outline" tab="Diagram" visual={<DiagramVisual />} />
      </Pal.Provider>
    </div>
  )
}

const css = `
.g-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,360px));gap:1.5rem;justify-content:center;padding:1rem}
.g-col-title{font-size:1rem;margin:0 0 .5rem}
.g-phone{position:relative;height:760px;border:1px solid var(--border);border-radius:24px;overflow:hidden;background:var(--bg)}
.g-dim{position:absolute;inset:0;padding:1rem;background:rgba(0,0,0,.55)}
.g-sheet{position:absolute;left:0;right:0;bottom:0;max-height:92%;overflow:auto;background:var(--card);border-radius:20px 20px 0 0;padding:.5rem 1rem 1.25rem;border-top:1px solid var(--border)}
.g-grab{width:40px;height:4px;border-radius:2px;background:var(--border);margin:0 auto .75rem}
.g-visual{position:relative;margin:.75rem 0 .25rem;border-radius:14px;overflow:hidden;background:#0b0d11;aspect-ratio:850/569}
.g-pixel svg{position:absolute;inset:8% 0;height:84%;width:100%}
.g-diagram{aspect-ratio:340/215}.g-diagram svg{display:block;width:100%;height:100%}
.g-anatomy{aspect-ratio:340/245}.g-anatomy svg{display:block;width:100%;height:100%}
.g-tabs{grid-template-columns:1fr 1fr;margin-top:.75rem}.g-tabs button{min-height:36px}
.g-visual .f1{animation:gflip 1.8s steps(1) infinite}
.g-visual .f0{animation:gflip 1.8s steps(1) infinite reverse}
@keyframes gflip{0%{opacity:0}50%{opacity:1}}
.g-legend{display:flex;gap:1rem;justify-content:center}
.g-swatch{display:inline-block;width:.7em;height:.7em;border-radius:3px;background:#f87171;margin-right:.25rem}
.g-sheet h3{font-size:.95rem;margin:.9rem 0 .3rem}
.g-steps,.g-avoid{margin:0;padding-left:1.2rem;line-height:1.45}
.g-avoid li::marker{color:var(--danger)}
.g-vars{display:flex;justify-content:space-between;margin-top:.9rem;padding-top:.75rem;border-top:1px solid var(--border)}
`
const style = document.createElement('style')
style.textContent = css
document.head.appendChild(style)
createRoot(document.getElementById('root')!).render(<Mock />)
