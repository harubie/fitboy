import { useEffect, useId, useRef, useState } from 'react'
import { exerciseGuide, guideSteps } from '../guides'
import type { Exercise } from '../types'
import { ExerciseVisual } from './ExerciseVisual'

export function ExerciseGuide({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [animation, setAnimation] = useState(true)
  const guide = exerciseGuide(exercise.name)
  const steps = guideSteps(exercise)
  const muscles = guide?.muscles || exercise.target?.trim()

  useEffect(() => {
    const element = dialog.current!
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => {
      element.close()
      document.body.style.overflow = overflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialog}
      className="exercise-guide"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onClose()
        }
      }}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="exercise-guide-content">
        <div className="guide-grab" />
        <header className="row spread">
          <h2 id={titleId}>{exercise.name}</h2>
        </header>
        {guide && (
          <>
            <div className="seg-picker guide-tabs" role="group" aria-label="Guide visual">
              <button aria-pressed={animation} className={animation ? 'active' : ''} onClick={() => setAnimation(true)}>
                Animation
              </button>
              <button
                aria-pressed={!animation}
                className={!animation ? 'active' : ''}
                onClick={() => setAnimation(false)}
              >
                Diagram
              </button>
            </div>
            <ExerciseVisual guide={guide} animation={animation} />
          </>
        )}
        {muscles && (
          <p className="guide-muscles small">
            <span aria-hidden="true" /> <strong>Works:</strong> {muscles}
          </p>
        )}
        <h3>How to</h3>
        {steps.length > 0 ? (
          <ol className="guide-steps">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        ) : (
          <p className="muted small">
            No step-by-step guide for this exercise yet. Add your own in Edit plan → More details → How-to steps.
          </p>
        )}
        {exercise.cue && (
          <p className="cue small">
            <strong>Your form tip:</strong> {exercise.cue}
          </p>
        )}
        {!guide && (
          <p className="muted small">Illustrations are available for the seven Full Body template exercises.</p>
        )}
        {guide && (
          <>
            <h3>Avoid</h3>
            <ul className="guide-avoid">
              {guide.avoid.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <dl className="guide-variations">
              <div>
                <dt>Easier</dt>
                <dd>{guide.easier}</dd>
              </div>
              <div>
                <dt>Harder</dt>
                <dd>{guide.harder}</dd>
              </div>
            </dl>
          </>
        )}
        <p className="muted small guide-safety">
          Start light. Stop if you feel sharp pain or dizziness, and ask a qualified trainer if you are unsure of your
          form.
        </p>
      </div>
      <footer className="guide-footer">
        <button className="secondary" aria-label="Close exercise guide" onClick={onClose}>
          Close guide
        </button>
      </footer>
    </dialog>
  )
}
