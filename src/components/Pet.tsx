import { useEffect, useState } from 'react'
import { NEGLECT_DAYS, currentForm } from '../monsters'
import { STAGE_MIN, STAGE_NAMES, STAR_EVERY, SUPER, TIER_EVERY, tierFor, tierName } from '../pet'
import type { Monster } from '../types'
import { Icon } from './Icon'
import { PetSprite } from './PetSprite'

const SEEN_KEY = 'fitboy-pet-seen'
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const plural = (n: number, word: string) => `${n} more ${word}${n === 1 ? '' : 's'}`

type PetProps = {
  monster: Monster
  xp: number // workouts this monster has eaten
  neglect: number // days since last workout/rest check-in
  devolved: boolean // already lost a stage during this neglect spell
  stars: number // lifetime stars, kept even when a streak breaks
  starProgress: number // workouts in the current streak toward the next star
  onOpen?: () => void
}

export function Pet({ monster, xp, neglect, devolved, stars, starProgress, onOpen }: PetProps) {
  const form = currentForm(monster)
  const tier = form.stage === SUPER ? tierFor(xp) : 0
  // Missing yesterday (and not logging yet today) makes it sleepy.
  const asleep = form.id !== 'egg' && neglect >= 2
  const [frame, setFrame] = useState<0 | 1>(0)
  const [evolved, setEvolved] = useState(false)

  useEffect(() => {
    if (reducedMotion()) return
    const id = setInterval(() => setFrame((f) => (f ? 0 : 1)), asleep ? 900 : 550)
    return () => clearInterval(id)
  }, [asleep])

  // Celebrate when this monster grows into a new form or colour.
  const key = `${monster.id}:${monster.forms.length}:${tier}`
  const [seen, setSeen] = useState(() => globalThis.localStorage?.getItem(SEEN_KEY))
  if (seen !== key) {
    setSeen(key)
    const [id, len, t] = (seen ?? '').split(':')
    if (id === monster.id && (monster.forms.length > Number(len) || tier > Number(t))) setEvolved(true)
  }

  useEffect(() => {
    localStorage.setItem(SEEN_KEY, key)
  }, [key])

  useEffect(() => {
    if (!evolved) return
    const t = setTimeout(() => setEvolved(false), 3000)
    return () => clearTimeout(t)
  }, [evolved])

  const untilDevolve = NEGLECT_DAYS - neglect
  let message: string
  if (form.id === 'egg') {
    message = 'Log a workout to hatch your egg. Rest days keep it warm, but only workouts feed it.'
  } else if (asleep) {
    message = devolved
      ? `It got hungry and shrank back to ${STAGE_NAMES[form.stage]}. Work out to wake it up!`
      : form.stage <= 1
        ? 'Zzz… it misses you. Log a workout or rest day to wake it.'
        : `Zzz… it misses you. ${plural(untilDevolve, 'day')} without a check-in and it devolves.`
  } else if (form.stage < SUPER && form.next.length) {
    message = `${plural(STAGE_MIN[form.stage + 1] - xp, 'workout')} until it evolves`
  } else {
    const toTier = TIER_EVERY - ((xp - STAGE_MIN[SUPER]) % TIER_EVERY)
    message = `${plural(toTier, 'workout')} until it turns ${tierName(tier + 1)}`
  }

  const name = `${tier ? `${tierName(tier)} ` : ''}${form.name}`
  const toward = starProgress % STAR_EVERY

  if (onOpen) {
    return (
      <button className="companion-link" onClick={onOpen} aria-label={`Enter the Lair: ${name}`}>
        <span className={`pet-screen ${evolved ? 'evolving' : ''}`}>
          <PetSprite form={form.id} frame={frame} asleep={asleep} tier={tier} />
          {evolved && <span className="pet-evolved">Evolved!</span>}
        </span>
        <span className="companion-copy">
          <strong>
            {name}
            {form.id !== 'egg' && <span className="muted small"> · Lv {xp}</span>}
          </strong>
          <span className="muted small">
            {form.id === 'egg'
              ? 'Your first workout hatches it.'
              : asleep
                ? 'Check in to wake it up.'
                : 'Every workout helps it grow.'}
          </span>
          <span className="companion-destination">
            The Lair <span aria-hidden="true">→</span>
          </span>
        </span>
      </button>
    )
  }

  return (
    <div className="pet">
      <div className={`pet-screen ${evolved ? 'evolving' : ''}`}>
        <PetSprite form={form.id} frame={frame} asleep={asleep} tier={tier} />
        {evolved && <div className="pet-evolved">Evolved!</div>}
      </div>
      <div className="pet-info">
        <span className="pet-name">
          {name}{' '}
          <span className="muted">
            · {STAGE_NAMES[form.stage]} · Lv {xp}
          </span>
        </span>
        <span className="muted small">{message}</span>
      </div>
      <details className="pet-stars">
        <summary>
          <span className="pet-star-count">
            <Icon name="star" /> {stars}
          </span>
          <span className="pet-star-progress">
            <span
              className="pet-star-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={STAR_EVERY}
              aria-valuenow={toward}
            >
              <span style={{ width: `${(toward / STAR_EVERY) * 100}%` }} />
            </span>
            <span className="muted small">
              {toward}/{STAR_EVERY} workouts to next star
            </span>
          </span>
          <span className="pet-star-help" aria-label="What are stars?">
            ?
          </span>
        </summary>
        <p className="muted small">
          Every {STAR_EVERY} workouts in one streak earns a star. Rest days don't count, but they keep the streak going.
          Stars are yours forever, no matter which monster you're raising.
        </p>
      </details>
    </div>
  )
}
