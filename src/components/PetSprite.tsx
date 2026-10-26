import { framePixels, viewFor } from '../pet'

type Props = { form: string; frame: 0 | 1; asleep?: boolean; tier?: number; silhouette?: boolean }

export function PetSprite({ form, frame, asleep = false, tier = 0, silhouette = false }: Props) {
  const v = viewFor(form)
  return (
    <svg viewBox={`${v.x} ${v.y} ${v.size} ${v.size}`} shapeRendering="crispEdges" aria-hidden="true">
      <rect x={v.x + 1} y={v.y + v.size - 1} width={v.size - 2} height="1" className="pet-ground" />
      {framePixels(form, frame, asleep, tier).map((p) => (
        <rect key={`${p.x},${p.y}`} x={p.x} y={p.y} width="1" height="1" fill={silhouette ? '#3a4030' : p.color} />
      ))}
    </svg>
  )
}
