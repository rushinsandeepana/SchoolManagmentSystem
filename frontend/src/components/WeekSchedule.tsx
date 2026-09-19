import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

export default function WeekSchedule({ slots }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const map = useMemo(() => {
    const m = {}
    for (const s of slots || []) {
      m[`${s.dayOfWeek}-${s.periodNumber}`] = s
    }
    return m
  }, [slots])

  return (
    <div>
      <div className="legend">
        <span className="badge badge-mandatory">{t('schedule.mandatory')}</span>
        <span className="badge badge-relief">{t('schedule.relief')}</span>
        <span className="badge badge-free">{t('schedule.free')}</span>
      </div>
      <p className="muted">{t('schedule.clickPeriod')}</p>
      <div className="schedule-grid">
        <div className="schedule-header">
          <span />
          {DAYS.map((d) => (
            <span key={d}>{t(d)}</span>
          ))}
        </div>
        {Array.from({ length: 8 }, (_, i) => i + 1).map((period) => (
          <div className="schedule-row" key={period}>
            <div className="day-label">P{period}</div>
            {DAYS.map((day) => {
              const slot = map[`${day}-${period}`]
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
