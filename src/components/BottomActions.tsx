import type { ReactNode } from 'react'

export function BottomActions({ onBack, children }: { onBack: () => void; children?: ReactNode }) {
  return (
    <div className="bottom-actions">
      <button className="secondary" onClick={onBack}>
        ← Back
      </button>
      {children}
    </div>
  )
}
