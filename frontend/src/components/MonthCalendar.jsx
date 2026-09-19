import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function MonthCalendar() {
  const { t } = useTranslation()
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

  return (
    <div className="card">
      <h3>{t('calendar')}</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        {monthName} · {t('today')}: {today}
      </p>
      <div className="calendar">
        {dows.map((d) => (
          <div key={d} className="dow">
            {d}
          </div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className={`day${d == null ? ' empty' : ''}${d === today ? ' today' : ''}`}>
            {d ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
}
