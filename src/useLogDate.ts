import { useEffect, useRef, useState } from 'react'
import { dateKey, isLogDate } from './logic'

export function useLogDate(initialDate?: string) {
  const [today, setToday] = useState(dateKey)
  const [date, setDate] = useState(() => initialDate ?? dateKey())
  const previousToday = useRef(today)
  useEffect(() => {
    const refresh = () => {
      const next = dateKey()
      const previous = previousToday.current
      previousToday.current = next
      setToday(next)
      setDate((current) => current === previous ? next : current)
    }
    const timer = setInterval(refresh, 30_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return { date, setDate, today, validDate: isLogDate(date, today) }
}
