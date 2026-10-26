import { Encyclopedia } from '../components/Encyclopedia'
import { BottomActions } from '../components/BottomActions'
import { PetSprite } from '../components/PetSprite'
import { Pet } from '../components/Pet'
import { dateKey, streak, workoutRuns } from '../logic'
import {
  canFuse,
  currentForm,
  devolvedNow,
  freeze,
  fuse,
  initialMonsters,
  monsterXp,
  neglectDays,
  reconcile,
  thaw,
} from '../monsters'
import { FORM_BY_ID, STAGE_NAMES, SUPER, tierFor, STAR_EVERY } from '../pet'
import { Icon } from '../components/Icon'
import type { AppData, Monster, Monsters, ScreenProps } from '../types'

function Card({ m, xp, children }: { m: Monster; xp: number; children?: React.ReactNode }) {
  const form = currentForm(m)
  return (
    <div className="monster-card">
      <div className="monster-thumb">
        <PetSprite form={form.id} frame={0} tier={form.stage === SUPER ? tierFor(xp) : 0} />
      </div>
      <div className="monster-meta">
        <strong>{form.name}</strong>
        <span className="muted small">
          {STAGE_NAMES[form.stage]} · Lv {xp}
        </span>
        {m.forms.length > 1 && (
          <span className="muted small">{m.forms.map((id) => FORM_BY_ID[id].name).join(' → ')}</span>
        )}
        {children}
      </div>
    </div>
  )
}

export function MonstersScreen({ data, setData, onDone }: ScreenProps & { onDone: () => void }) {
  const today = dateKey()
  const ms = data.monsters ?? initialMonsters(data, today)
  const active = ms.active
  const runs = workoutRuns(data)
  const update = (fn: (ms: Monsters, d: AppData) => Monsters) =>
    setData((d) => {
      const cur = d.monsters ?? initialMonsters(d, today)
      return { ...d, monsters: reconcile(fn(cur, d), d, today) }
    })

  const onFreeze = () => {
    if (confirm(`Put ${currentForm(active).name} into cryo sleep and hatch a new egg? You can thaw it any time.`))
      update((m, d) => freeze(m, d, today))
  }
  const onThaw = (m: Monster) => {
    if (confirm(`Wake ${currentForm(m).name}? ${currentForm(active).name} will take its place in cryo sleep.`))
      update((x, d) => thaw(x, m.id, d, today))
  }
  const onFuse = (m: Monster) => {
    if (
      confirm(
        `Fuse ${currentForm(active).name} with ${currentForm(m).name}? Both become one Chimera. This can't be undone.`,
      )
    )
      update((x, d) => fuse(x, m.id, d, today))
  }

  return (
    <div className="app">
      <main className="content">
        <header className="page-header">
          <h1>The Lair</h1>
        </header>

        <section className="card">
          <h2>Raising now</h2>
          <Pet
            monster={active}
            xp={monsterXp(active, data, today)}
            neglect={neglectDays(active, data, today)}
            devolved={devolvedNow(active, data, today)}
            stars={runs.reduce((sum, run) => sum + Math.floor(run / STAR_EVERY), 0)}
            starProgress={streak(data, today) > 0 ? (runs.at(-1) ?? 0) : 0}
          />
          <button className="secondary block" onClick={onFreeze}>
            <Icon name="snow" /> Cryo sleep &amp; hatch a new egg
          </button>
          <p className="muted small">
            Frozen monsters keep their level and never get hungry. Fuse two Ultimates to discover a secret form.
          </p>
        </section>

        <section className="card">
          <h2>Cryo pods ({ms.cryo.length})</h2>
          {ms.cryo.length === 0 && <p className="muted">Empty. Freeze a monster to start a new one.</p>}
          {ms.cryo.map((m) => (
            <Card key={m.id} m={m} xp={monsterXp(m, data, today)}>
              <div className="row gap">
                <button className="secondary small-btn" onClick={() => onThaw(m)}>
                  Thaw
                </button>
                {canFuse(active, m) && (
                  <button className="secondary small-btn" onClick={() => onFuse(m)}>
                    <Icon name="bolt" /> Fuse
                  </button>
                )}
              </div>
            </Card>
          ))}
        </section>

        <section className="card">
          <Encyclopedia dex={ms.dex} />
        </section>
      </main>
      <footer className="screen-footer">
        <BottomActions onBack={onDone} />
      </footer>
    </div>
  )
}
