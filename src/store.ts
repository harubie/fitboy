import { useEffect, useState } from 'react'
import { defaultData } from './logic'
import type { AppData } from './types'

export const STORAGE_KEY = 'fitboy-data-v1'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppData>
      const d = defaultData()
      return { ...d, ...parsed, settings: { ...d.settings, ...parsed.settings } }
    }
  } catch {
    // corrupted storage: fall back to defaults
  }
  return defaultData()
}

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    // Ask the browser not to evict our data under storage pressure.
    navigator.storage?.persist?.()
  }, [])

  return [data, setData] as const
}
