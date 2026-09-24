import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconButton } from '../../../components/ui'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

export default function WeekSchedule({ slots }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [weekOffset, setWeekOffset] = useState(0)
console.log("slots", slots);

  const navigationBounds = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const currentMonday = new Date(today)
    currentMonday.setHours(0, 0, 0, 0)
    currentMonday.setDate(today.getDate() + (currentDay === 0 ? -6 : 1 - currentDay))

    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const previousMonthDay = previousMonthStart.getDay()
    const firstAllowedMonday = new Date(previousMonthStart)
    firstAllowedMonday.setDate(
      previousMonthStart.getDate() + (previousMonthDay === 0 ? 1 : 1 - previousMonthDay),
    )

    const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)
    const nextMonthEndDay = nextMonthEnd.getDay()
    const lastAllowedMonday = new Date(nextMonthEnd)
    lastAllowedMonday.setDate(
      nextMonthEnd.getDate() - (nextMonthEndDay === 0 ? 6 : nextMonthEndDay - 1),
    )

    const daysFromCurrent = (date: Date) =>
      Math.round((date.getTime() - currentMonday.getTime()) / (1000 * 60 * 60 * 24))

    return {
      min: Math.floor(daysFromCurrent(firstAllowedMonday) / 7),
      max: Math.floor(daysFromCurrent(lastAllowedMonday) / 7),
    }
  }, [])

  const weekDates = useMemo(() => {
    const today = new Date()
    const day = today.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset + weekOffset * 7)

    return DAYS.map((_, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return date
    })
  }, [weekOffset])

  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  const dateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const weekRange = `${formatDate(weekDates[0])} - ${weekDates[4].toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`

  const map = useMemo(() => {
    const byDate = {}
    for (const s of slots || []) {
      if (s.date) {
        byDate[`${s.date}-${s.periodNumber}`] = s
      }
    }
    return byDate
  }, [slots])

  return (
    <div>
      <div className="legend-row">
        <div className="legend">
          <span className="badge badge-mandatory">{t('schedule.mandatory')}</span>
          <span className="badge badge-relief">{t('schedule.relief')}</span>
          <span className="badge badge-free">{t('schedule.free')}</span>
        </div>
        <div className="schedule-scroll-controls">
          <IconButton
            className="schedule-scroll-button"
            label={t('common.prev')}
            disabled={weekOffset <= navigationBounds.min}
            onClick={() => setWeekOffset((value) => value - 1)}
          >
            ‹
          </IconButton>
          <IconButton
            className="schedule-scroll-button"
            label={t('common.next')}
            disabled={weekOffset >= navigationBounds.max}
            onClick={() => setWeekOffset((value) => value + 1)}
          >
            ›
          </IconButton>
        </div>
      </div>
      <p className="muted schedule-week-range">{weekRange}</p>
      <p className="muted">{t('schedule.clickPeriod')}</p>
      <div className="schedule-grid">
        <div className="schedule-header">
          <span />
          {DAYS.map((d, index) => (
            <span key={d} className="schedule-day-header">
              <span>{t(d)}</span>
              <span className="schedule-date">{formatDate(weekDates[index])}</span>
            </span>
          ))}
        </div>
        {Array.from({ length: 8 }, (_, i) => i + 1).map((period) => (
          <div className="schedule-row" key={period}>
            <div className="day-label">P{period}</div>
            {DAYS.map((day, index) => {
              const slot = map[`${dateKey(weekDates[index])}-${period}`]
              if (!slot) {
                return (
                  <div key={day} className="period-cell FREE" style={{ opacity: 0.5, cursor: 'default' }}>
                    <span className="p-num">—</span>
                  </div>
                )
              }
              return (
                <button
                  key={day}
                  type="button"
                  className={`period-cell ${slot.periodType}`}
                  onClick={() => navigate(`/periods/${slot.id}`)}
                >
                  <span className="p-num">{t(slot.periodType.toLowerCase())}</span>
                  <span className="p-title">{slot.title || slot.subject || slot.periodType}</span>
                  {slot.className && <span className="p-num">{slot.className}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
