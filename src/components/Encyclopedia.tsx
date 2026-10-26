import { useEffect, useState } from 'react'
import { FORMS, FORM_BY_ID, STAGE_MIN, STAGE_NAMES, formsAtStage, type Form } from '../pet'
import { PetSprite } from './PetSprite'

const parentsOf = (id: string) => FORMS.filter((f) => f.next.includes(id))

function Entry({ form, found }: { form: Form; found: Set<string> }) {
  const known = found.has(form.id)
  const [frame, setFrame] = useState<0 | 1>(0)
  useEffect(() => {
    if (!known || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setFrame((f) => (f ? 0 : 1)), 550)
    return () => clearInterval(id)
  }, [known])

  const names = (ids: string[]) => ids.map((id) => (found.has(id) ? FORM_BY_ID[id].name : '???')).join(', ')
  const parents = parentsOf(form.id).map((f) => f.id)
  // Locked entries only reveal the parents you've already found, as a hint.
  const from = form.fusion
    ? 'Fusing two Ultimates'
    : known
      ? names(parents)
      : names(parents.filter((id) => found.has(id))) || '???'

  return (
    <div className="dex-entry">
      <div className="dex-thumb big">
        <PetSprite form={form.id} frame={frame} silhouette={!known} />
      </div>
      <div className="monster-meta">
        <strong>{known ? form.name : '???'}</strong>
        <span className="muted small">
          {STAGE_NAMES[form.stage]} · {form.fusion ? 'fusion only' : `${STAGE_MIN[form.stage]}+ workouts`}
        </span>
        {from && <span className="small">Evolves from: {from}</span>}
        {known && form.next.length > 0 && <span className="small">Evolves into: {names(form.next)}</span>}
        {!known && <span className="muted small">Not discovered yet. Keep training to find it!</span>}
      </div>
    </div>
  )
}

/** Every monster form, grouped by stage; undiscovered ones are dark silhouettes. */
export function Encyclopedia({ dex }: { dex: string[] }) {
  const found = new Set(dex)
  const [selected, setSelected] = useState<string>()
  const count = FORMS.filter((f) => found.has(f.id)).length

  return (
    <>
      <div className="row spread">
        <h2>Beastiary</h2>
        <span className="muted">
          {count}/{FORMS.length} found
        </span>
      </div>
      <div className="dex-progress">
        <span style={{ width: `${(count / FORMS.length) * 100}%` }} />
      </div>
      {STAGE_NAMES.map((stage, i) => (
        <div key={stage} className="dex-stage">
          <span className="muted small">
            {stage} · {STAGE_MIN[i]}+ workouts
          </span>
          <div className="dex-grid">
            {formsAtStage(i).map((f) => (
              <button
                key={f.id}
                className={`dex-cell ${selected === f.id ? 'selected' : ''}`}
                onClick={() => setSelected(selected === f.id ? undefined : f.id)}
                aria-label={found.has(f.id) ? f.name : 'Undiscovered monster'}
              >
                <div className="dex-thumb">
                  <PetSprite form={f.id} frame={0} silhouette={!found.has(f.id)} />
                </div>
                <span className="small">{found.has(f.id) ? f.name : '???'}</span>
              </button>
            ))}
          </div>
          {selected && FORM_BY_ID[selected].stage === i && <Entry form={FORM_BY_ID[selected]} found={found} />}
        </div>
      ))}
    </>
  )
}
