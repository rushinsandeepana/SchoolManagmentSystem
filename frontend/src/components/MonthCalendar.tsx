import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { PeriodSlot } from '../types/period'

type MonthCalendarProps = {
  slots?: PeriodSlot[]
}

export default function MonthCalendar({ slots = [] }: MonthCalendarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const list = []
    for (let i = 0; i < firstDow; i++) list.push(null)
    for (let d = 1; d <= daysInMonth; d++) list.push(d)
    return list
  }, [year, month])

  const monthName = now.toLocaleString(undefined, { month: 'long', year: 'numeric' })
  const dows = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const slotsByDay = useMemo(() => {
    const grouped: Record<string, PeriodSlot[]> = {}
    for (const slot of slots) {
      grouped[slot.dayOfWeek] = [...(grouped[slot.dayOfWeek] || []), slot]
    }
    return grouped
  }, [slots])

  return (
    <div className="card">
      <h3>{t('schedule.calendar')}</h3>
      <p className="mt-0 muted">
        {monthName} · {t('schedule.today')}: {today}
      </p>
      <div className="calendar">
        {dows.map((d) => (
          <div key={d} className="dow">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d == null) return <div key={i} className="day empty" />

          const date = new Date(year, month, d)
          const isWeekend = date.getDay() === 0 || date.getDay() === 6
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
          const daySlots = isWeekend ? [] : slotsByDay[dayName] || []

          return (
            <div
              key={i}
              className={`day${d === today ? ' today' : ''}${isWeekend ? ' disabled' : ''}`}
              aria-disabled={isWeekend}
            >
              <span className="day-number">{d}</span>
              {daySlots.slice(0, 3).map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className={`month-slot ${slot.periodType}`}
                  onClick={() => navigate(`/periods/${slot.id}`)}
                >
                  {slot.title || slot.subject || t(slot.periodType.toLowerCase())}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
