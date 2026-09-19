import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MonthCalendar from '../../../components/MonthCalendar'
import { dashboardApi } from '../../../api/dashboardApi'
import type { DashboardSummary } from '../../../types/dashboard'

export default function DashboardPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    dashboardApi.getSummary().then((res) => setData(res.data))
  }, [])

  if (!data) return <div className="muted">Loading...</div>

  return (
    <div className="fade-in">
      <div className="section-head">
        <div>
          <h1>{t('dashboard')}</h1>
          <p className="muted" style={{ margin: 0 }}>{t('teacherPerformance')}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <div className="label">{t('totalTeachers')}</div>
          <div className="value">{data.totalTeachers}</div>
        </div>
        <div className="stat">
          <div className="label">{t('activeTeachers')}</div>
          <div className="value">{data.activeTeachers}</div>
        </div>
        <div className="stat">
          <div className="label">{t('periodsAssigned')}</div>
          <div className="value">{data.totalPeriodsAssigned}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>{t('teacherPerformance')}</h3>
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {(data.teacherPerformance || []).map((teacher) => (
              <div key={teacher.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <strong>{teacher.fullName}</strong>
                  <span className="muted">{teacher.performanceScore ?? 0}%</span>
                </div>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {teacher.subject || '—'}
                </div>
                <div className="perf-bar">
                  <span style={{ width: `${Math.min(100, teacher.performanceScore || 0)}%` }} />
                </div>
              </div>
            ))}
            {!data.teacherPerformance?.length && <p className="muted">{t('teachers')}: 0</p>}
          </div>
        </div>
        <MonthCalendar />
      </div>
    </div>
  )
}
