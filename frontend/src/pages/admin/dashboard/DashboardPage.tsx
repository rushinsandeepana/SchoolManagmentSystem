import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MonthCalendar from '../../../components/MonthCalendar'
import { dashboardApi } from '../../../api/dashboardApi'
import { ListControls } from '../../../components/ui'
import { useClientList } from '../../../hooks/useClientList'
import type { DashboardSummary, TeacherPerformance } from '../../../types/dashboard'

export default function DashboardPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const performance: TeacherPerformance[] = data?.teacherPerformance || []
  const list = useClientList(performance, {
    searchKeys: ['fullName', 'subject'],
    defaultPageSize: 5,
  })

  useEffect(() => {
    dashboardApi.getSummary().then((res) => setData(res.data))
  }, [])

  if (!data) return <div className="muted">{t('common.loading')}</div>

  return (
    <div className="fade-in">
      <div className="section-head">
        <div>
          <h1 className="text-2xl sm:text-3xl">{t('dashboard.title')}</h1>
          <p className="m-0 muted">{t('dashboard.teacherPerformance')}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <div className="label">{t('dashboard.totalTeachers')}</div>
          <div className="value">{data.totalTeachers}</div>
        </div>
        <div className="stat">
          <div className="label">{t('dashboard.activeTeachers')}</div>
          <div className="value">{data.activeTeachers}</div>
        </div>
        <div className="stat">
          <div className="label">{t('dashboard.periodsAssigned')}</div>
          <div className="value">{data.totalPeriodsAssigned}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>{t('dashboard.teacherPerformance')}</h3>
          <ListControls
            searchValue={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder={t('common.searchPlaceholder')}
            page={list.page}
            pageSize={list.pageSize}
            totalElements={list.totalElements}
            totalPages={list.totalPages}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          >
            <div className="grid gap-3.5">
              {list.content.map((teacher) => (
                <div key={teacher.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <strong className="break-words">{teacher.fullName}</strong>
                    <span className="muted shrink-0">{teacher.performanceScore ?? 0}%</span>
                  </div>
                  <div className="text-sm text-muted">{teacher.subject || '—'}</div>
                  <div className="perf-bar">
                    <span style={{ width: `${Math.min(100, teacher.performanceScore || 0)}%` }} />
                  </div>
                </div>
              ))}
              {!list.content.length && (
                <p className="muted">
                  {list.search ? t('common.noResults') : t('dashboard.emptyPerformance')}
                </p>
              )}
            </div>
          </ListControls>
        </div>
        <MonthCalendar />
      </div>
    </div>
  )
}
