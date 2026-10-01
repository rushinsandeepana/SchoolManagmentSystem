import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardCheck } from 'lucide-react'
import { Button, DataTable, SelectField } from '../../../components/ui'
import { useClientList } from '../../../hooks/useClientList'
import {
  EXCEPTION_STATUSES,
  getStatusLabel,
  statusBadgeClass,
} from './attendanceUtils'
import type { AttendanceStatus, ExceptionStatus, TeacherAttendanceException } from '../../../types/attendance'
import type { Teacher } from '../../../types/teacher'

type RosterRow = {
  id: number
  fullName: string
  username: string
  status: AttendanceStatus
  remark?: string
  isException: boolean
}

type AttendanceRosterCardProps = {
  teachers: Teacher[]
  exceptions: TeacherAttendanceException[]
  loading: boolean
  onMarkException: (teacherId: number, teacherName: string, status: ExceptionStatus) => void
  onUpdateExceptionStatus: (teacherId: number, status: ExceptionStatus) => void
  onMarkPresent: (teacherId: number) => void
}

export default function AttendanceRosterCard({
  teachers,
  exceptions,
  loading,
  onMarkException,
  onUpdateExceptionStatus,
  onMarkPresent,
}: AttendanceRosterCardProps) {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttendanceStatus>('ALL')

  const exceptionMap = useMemo(() => {
    return new Map(exceptions.map((item) => [item.teacherId, item]))
  }, [exceptions])

  const rosterRows = useMemo<RosterRow[]>(() => {
    return teachers.map((teacher) => {
      const exception = exceptionMap.get(teacher.id)
      return {
        id: teacher.id,
        fullName: teacher.fullName,
        username: teacher.username,
        status: exception?.status ?? 'PRESENT',
        remark: exception?.remark,
        isException: Boolean(exception),
      }
    })
  }, [teachers, exceptionMap])

  const filteredRoster = useMemo(() => {
    if (statusFilter === 'ALL') return rosterRows
    return rosterRows.filter((row) => row.status === statusFilter)
  }, [rosterRows, statusFilter])

  const list = useClientList(filteredRoster, {
    searchKeys: ['fullName', 'username'],
    defaultPageSize: 10,
  })

  const columns = useMemo(
    () => [
      { key: 'fullName', label: t('teacher.fullName') },
      { key: 'username', label: t('auth.username') },
      {
        key: 'status',
        label: t('attendance.columns.status'),
        render: (row: RosterRow) => (
          <span className={statusBadgeClass(row.status)}>
            {getStatusLabel(row.status, t)}
          </span>
        ),
      },
      {
        key: 'remark',
        label: t('attendance.columns.remark'),
        render: (row: RosterRow) => row.remark || '—',
      },
      {
        key: 'actions',
        label: t('common.actions'),
        render: (row: RosterRow) => (
          <div className="ui-action-group">
            {row.isException ? (
              <>
                <SelectField
                  value={row.status}
                  onChange={(event) =>
                    onUpdateExceptionStatus(row.id, event.target.value as ExceptionStatus)
                  }
                  options={EXCEPTION_STATUSES.map((st) => ({
                    value: st,
                    label: getStatusLabel(st, t),
                  }))}
                  className="min-w-[8.5rem]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onMarkPresent(row.id)}
                >
                  {t('attendance.markPresent')}
                </Button>
              </>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {EXCEPTION_STATUSES.map((st) => (
                  <Button
                    key={st}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onMarkException(row.id, row.fullName, st)}
                  >
                    {getStatusLabel(st, t)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ),
      },
    ],
    [t, onMarkException, onUpdateExceptionStatus, onMarkPresent]
  )

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <ClipboardCheck className="size-5 text-primary shrink-0" aria-hidden />
          <h2 className="m-0 text-lg font-semibold">{t('attendance.fullRoster')}</h2>
          <span className="muted text-sm">
            ({teachers.length} {t('attendance.teachers')})
          </span>
        </div>
        <SelectField
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as 'ALL' | AttendanceStatus)
          }
          options={[
            { value: 'ALL', label: t('attendance.filterAll') },
            { value: 'PRESENT', label: t('attendance.status.present') },
            { value: 'ABSENT', label: t('attendance.status.absent') },
            { value: 'LEAVE', label: t('attendance.status.leave') },
            { value: 'HALF_DAY', label: t('attendance.status.halfDay') },
          ]}
          className="min-w-[10rem]"
        />
      </div>

      <DataTable
        columns={columns}
        data={list.content}
        getRowKey={(row) => row.id}
        emptyMessage={
          loading
            ? t('common.loading')
            : list.search || statusFilter !== 'ALL'
              ? t('common.noResults')
              : t('attendance.emptyRoster')
        }
        searchable
        searchValue={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder={t('attendance.searchTeachers')}
        page={list.page}
        pageSize={list.pageSize}
        totalElements={list.totalElements}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
        loading={loading}
      />
    </div>
  )
}
