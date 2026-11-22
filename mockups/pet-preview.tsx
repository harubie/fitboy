import '@fontsource-variable/outfit'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PetSprite } from '../src/components/PetSprite'
import { FORMS, STAGE_MIN, STAGE_NAMES, tierName } from '../src/pet'
import '../src/App.css'

function Gallery() {
  const [frame, setFrame] = useState<0 | 1>(0)
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f ? 0 : 1)), 550)
    return () => clearInterval(id)
  }, [])
  const items = [
    ...FORMS.map((f) => ({ key: f.id, label: f.name, sub: `${STAGE_NAMES[f.stage]} · ${f.fusion ? 'fusion' : `${STAGE_MIN[f.stage]}+`}`, form: f.id, asleep: false, tier: 0 })),
    { key: 'zz', label: 'Sleepy Fang', sub: 'missed a day', form: 'fang', asleep: true, tier: 0 },
    ...[1, 3, 5].map((t) => ({ key: `t${t}`, label: `${tierName(t)} Ancient`, sub: `${200 + t * 100}+`, form: 'ancient', asleep: false, tier: t })),
  ]
  return (
    <div className="content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
      {items.map((it) => (
        <div key={it.key} className="pet">
          <div className="pet-screen" style={{ width: 110, height: 110, padding: 5 }}>
            <PetSprite form={it.form} frame={frame} asleep={it.asleep} tier={it.tier} />
          </div>
          <div className="pet-info">
            <span className="pet-name small">{it.label}</span>
            <span className="muted small">{it.sub}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Gallery />)
