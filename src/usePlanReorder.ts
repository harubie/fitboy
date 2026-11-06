import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { moveWorkoutDay } from './logic'
import type { ScreenProps, WorkoutDay } from './types'

export function usePlanReorder(routine: WorkoutDay[], setData: ScreenProps['setData']) {
  const listRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string; pointerId: number; y: number; order: WorkoutDay[]; startIndex: number } | null>(null)
  const [preview, setPreview] = useState<WorkoutDay[]>()
  const [draggingId, setDraggingId] = useState<string>()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (!draggingId) return
    let frame: number
    const update = () => {
      const active = drag.current
      if (!active || !listRef.current) return
      const cards = [...listRef.current.querySelectorAll<HTMLElement>('[data-plan-id]')]
      const from = active.order.findIndex((day) => day.id === active.id)
      let destination = from
      for (const card of cards) {
        const targetId = card.dataset.planId
        if (!targetId) continue
        const to = active.order.findIndex((day) => day.id === targetId)
        const rect = card.getBoundingClientRect()
        const middle = rect.top + rect.height / 2
        if (to < from && active.y < middle) destination = Math.min(destination, to)
        if (to > from && active.y > middle) destination = Math.max(destination, to)
      }
      if (destination !== from) {
        active.order = moveWorkoutDay(active.order, active.id, destination)
        setPreview(active.order)
      }
    }
    const scroll = () => {
      const active = drag.current
      if (!active) return
      const bottom = window.innerHeight - 96
      const delta = active.y < 80 ? -Math.min(12, (80 - active.y) / 4)
        : active.y > bottom ? Math.min(12, (active.y - bottom) / 4) : 0
      if (delta) window.scrollBy(0, delta)
      update()
      frame = requestAnimationFrame(scroll)
    }
    const move = (event: globalThis.PointerEvent) => {
      if (event.pointerId !== drag.current?.pointerId) return
      drag.current.y = event.clientY
      event.preventDefault()
    }
    const finish = (save: boolean) => {
      const active = drag.current
      if (!active) return
      const position = active.order.findIndex((day) => day.id === active.id)
      if (save && position !== active.startIndex) {
        setData((data) => ({ ...data, routine: moveWorkoutDay(data.routine, active.id, position) }))
        setAnnouncement(`${active.order[position].name} moved to position ${position + 1} of ${active.order.length}.`)
      } else setAnnouncement(save ? 'Order unchanged.' : 'Reordering cancelled.')
      drag.current = null
      setPreview(undefined)
      setDraggingId(undefined)
    }
    const up = (event: globalThis.PointerEvent) => {
      if (event.pointerId !== drag.current?.pointerId) return
      drag.current.y = event.clientY
      update()
      finish(true)
    }
    const cancel = () => finish(false)
    const pointerCancel = (event: globalThis.PointerEvent) => {
      if (event.pointerId === drag.current?.pointerId) cancel()
    }
    const key = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); cancel() }
    }
    frame = requestAnimationFrame(scroll)
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', pointerCancel)
    window.addEventListener('blur', cancel)
    window.addEventListener('keydown', key)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', pointerCancel)
      window.removeEventListener('blur', cancel)
      window.removeEventListener('keydown', key)
    }
  }, [draggingId, setData])

  const start = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    if (!event.isPrimary || event.button !== 0 || drag.current) return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    drag.current = { id, pointerId: event.pointerId, y: event.clientY, order: routine,
      startIndex: routine.findIndex((day) => day.id === id) }
    setPreview(routine)
    setDraggingId(id)
    setAnnouncement('Dragging workout day. Release to save, or press Escape to cancel.')
  }
  const keyboard = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (drag.current || !['ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const from = routine.findIndex((day) => day.id === id)
    const to = from + (event.key === 'ArrowUp' ? -1 : 1)
    if (to < 0 || to >= routine.length) return
    setData((data) => ({ ...data, routine: moveWorkoutDay(data.routine, id, to) }))
    setAnnouncement(`${routine[from].name} moved to position ${to + 1} of ${routine.length}.`)
  }

  return { listRef, days: preview ?? routine, draggingId, announcement, start, keyboard }
}
