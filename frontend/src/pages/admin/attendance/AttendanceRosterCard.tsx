import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { ClipboardCheck } from 'lucide-react'
import { Button, DataTable, SelectField, TimeRangeField } from '../../../components/ui'
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
  startTime?: string
  endTime?: string
}

type AttendanceRosterCardProps = {
  teachers: Teacher[]
  exceptions: TeacherAttendanceException[]
  loading: boolean
  onMarkException: (
    teacherId: number,
    teacherName: string,
    status: ExceptionStatus,
    remark?: string,
    startTime?: string,
    endTime?: string
  ) => void
  onUpdateExceptionStatus: (teacherId: number, status: ExceptionStatus, remark?: string, startTime?: string, endTime?: string) => void
  onMarkPresent: (teacherId: number) => void
}

type PickerState = {
  teacherId: number
  teacherName: string
  action: 'mark' | 'update'
  type: 'halfDay' | 'shortLeave'
  anchor: HTMLElement
}

// const PRESENT_START_TIME = '07:30'
// const PRESENT_END_TIME = '13:30'
const STATUS_BUTTON_CODES: Record<AttendanceStatus | 'SHORT_LEAVE', string> = {
  PRESENT: 'PR',
  ABSENT: 'AB',
  LEAVE: 'LV',
  SHORT_LEAVE: 'SL',
  HALF_DAY: 'HD',
}

const normalizeTimeValue = (time?: string | null) => {
  if (typeof time !== 'string') return undefined

  const trimmed = time.trim()
  const match = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(trimmed)
  if (!match || trimmed === '-') return undefined

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return undefined

  return `${match[1].padStart(2, '0')}:${match[2]}`
}

const formatRosterTime = (time?: string) => {
  if (!time) return '—'

  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!match) return '—'

  const hours24 = Number(match[1])
  const minutes = Number(match[2])
  if (Number.isNaN(hours24) || Number.isNaN(minutes) || hours24 < 0 || hours24 > 23 || minutes < 0 || minutes > 59) {
    return '—'
  }

  const hours12 = hours24 % 12 || 12
  const period = hours24 < 12 ? 'AM' : 'PM'
  return `${hours12}.${match[2]} ${period}`
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
  const [picker, setPicker] = useState<PickerState | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [pickerPosition, setPickerPosition] = useState<{ top: number; left: number } | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const actionRefs = useRef(new Map<number, HTMLDivElement>())

  const openPicker = useCallback((
    row: RosterRow,
    action: PickerState['action'],
    type: PickerState['type'],
    anchor: HTMLElement | null
  ) => {
    if (!anchor) return
    setStartTime('')
    setEndTime('')
    setPicker({ teacherId: row.id, teacherName: row.fullName, action, type, anchor })
    setPickerPosition(null)
  }, [])

  useEffect(() => {
    if (!picker) return undefined

    const updatePickerPosition = () => {
      const anchorRect = picker.anchor.getBoundingClientRect()
      const pickerHeight = pickerRef.current?.offsetHeight ?? 240
      const pickerWidth = pickerRef.current?.offsetWidth ?? 320
      const spaceBelow = window.innerHeight - anchorRect.bottom
      const top = spaceBelow >= pickerHeight + 8
        ? anchorRect.bottom + 8
        : Math.max(8, anchorRect.top - pickerHeight - 8)
      const left = Math.min(
        Math.max(8, anchorRect.left),
        Math.max(8, window.innerWidth - pickerWidth - 8)
      )

      setPickerPosition({ top, left })
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!pickerRef.current?.contains(target) && !picker.anchor.contains(target)) {
        setPicker(null)
      }
    }

    updatePickerPosition()
    document.addEventListener('mousedown', closeOnOutsideClick)
    window.addEventListener('resize', updatePickerPosition)
    window.addEventListener('scroll', updatePickerPosition, true)
    const resizeObserver = pickerRef.current
      ? new ResizeObserver(updatePickerPosition)
      : null
    if (pickerRef.current) resizeObserver?.observe(pickerRef.current)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      window.removeEventListener('resize', updatePickerPosition)
      window.removeEventListener('scroll', updatePickerPosition, true)
      resizeObserver?.disconnect()
    }
  }, [picker])

  const savePickerSelection = (status: ExceptionStatus, remark: string, startTime?: string, endTime?: string) => {
    if (!picker) return

    if (picker.action === 'mark') {
      onMarkException(picker.teacherId, picker.teacherName, status, remark, startTime, endTime)
    } else {
      onUpdateExceptionStatus(picker.teacherId, status, remark, startTime, endTime)
    }
    setPicker(null)
  }

  const handleStatusSelection = useCallback((row: RosterRow, value: string) => {
    if (value === 'HALF_DAY') {
      openPicker(row, 'update', 'halfDay', actionRefs.current.get(row.id) ?? null)
    } else if (value === 'SHORT_LEAVE') {
      openPicker(row, 'update', 'shortLeave', actionRefs.current.get(row.id) ?? null)
    } else {
      onUpdateExceptionStatus(row.id, value as ExceptionStatus)
    }
  }, [onUpdateExceptionStatus, openPicker])

  const exceptionMap = useMemo(() => {
    return new Map(exceptions.map((item) => [item.teacherId, item]))
  }, [exceptions])

  const rosterRows = useMemo<RosterRow[]>(() => {
    return teachers.map((teacher) => {
      const exception = exceptionMap.get(teacher.id)
      const status = exception?.status ?? 'PRESENT'
      const startTime = normalizeTimeValue(exception?.startTime)
      const endTime = normalizeTimeValue(exception?.endTime)

      return {
        id: teacher.id,
        fullName: teacher.fullName,
        username: teacher.username,
        status,
        remark: exception?.remark,
        startTime,
        endTime,
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
          <span className={statusBadgeClass(
            row.status,
            row.status === 'SHORT_LEAVE' ||
              (row.status === 'LEAVE' && Boolean(row.startTime && row.endTime))
          )}>
            {row.status === 'SHORT_LEAVE' ||
              (row.status === 'LEAVE' && row.startTime && row.endTime)
              ? t('attendance.shortLeave')
              : getStatusLabel(row.status, t)}
          </span>
        ),
      },
      {
        key: 'remark',
        label: t('attendance.columns.remark'),
        render: (row: RosterRow) => row.remark || '—',
      },
      {
        key: 'leaveDuration',
        label: t('attendance.columns.leaveDuration'),
        render: (row: RosterRow) => {
          const startTime = normalizeTimeValue(row.startTime)
          const endTime = normalizeTimeValue(row.endTime)
          if (!startTime || !endTime) return '—'

          const formatTime = (time: string) => {
            const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
            if (!match) return '—'

            const hours = Number(match[1])
            const minutes = Number(match[2])
            if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
              return '—'
            }

            const date = new Date()
            date.setHours(hours, minutes, 0, 0)

            return date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
          }

          return `${formatTime(startTime)} to ${formatTime(endTime)}`
        },
      },
      {
        key: 'actions',
        label: t('common.actions'),
        render: (row: RosterRow) => (
          <div
            ref={(element) => {
              if (element) actionRefs.current.set(row.id, element)
              else actionRefs.current.delete(row.id)
            }}
            className="ui-action-group"
          >
              {row.isException ? (
                <>
                  <SelectField
                    value={
                      row.status === 'SHORT_LEAVE' ||
                      (row.status === 'LEAVE' && row.startTime && row.endTime)
                        ? 'SHORT_LEAVE'
                        : row.status
                    }
                    onChange={(event) => handleStatusSelection(row, event.target.value)}
                    options={[
                      ...EXCEPTION_STATUSES.map((st) => ({
                        value: st,
                        label: getStatusLabel(st, t),
                      })),
                      { value: 'SHORT_LEAVE', label: t('attendance.shortLeave') },
                    ]}
                    className="min-w-[8.5rem]"
                  />
                  <Button
                    type="button"
                    variant="secondary2"
                    size="sm"
                    title={t('attendance.markPresent')}
                    aria-label={t('attendance.markPresent')}
                    onClick={() => onMarkPresent(row.id)}
                  >
                    {STATUS_BUTTON_CODES.PRESENT}
                  </Button>
                </>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {EXCEPTION_STATUSES.map((st) => (
                    <Button
                      key={st}
                      type="button"
                      variant="secondary2"
                      size="sm"
                      title={getStatusLabel(st, t)}
                      aria-label={getStatusLabel(st, t)}
                      onClick={() =>
                        st === 'HALF_DAY'
                          ? openPicker(
                              row,
                              'mark',
                              'halfDay',
                              actionRefs.current.get(row.id) ?? null
                            )
                          : onMarkException(row.id, row.fullName, st)
                      }
                    >
                      {STATUS_BUTTON_CODES[st]}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="secondary2"
                    size="sm"
                    title={t('attendance.shortLeave')}
                    aria-label={t('attendance.shortLeave')}
                    onClick={() =>
                      openPicker(
                        row,
                        'mark',
                        'shortLeave',
                        actionRefs.current.get(row.id) ?? null
                      )
                    }
                  >
                    {STATUS_BUTTON_CODES.SHORT_LEAVE}
                  </Button>
                </div>
              )}
          </div>
        ),
      },
    ],
    [
      t,
      openPicker,
      handleStatusSelection,
      onMarkException,
      onUpdateExceptionStatus,
      onMarkPresent,
    ]
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
            { value: 'SHORT_LEAVE', label: t('attendance.status.shortLeave') },
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
      {picker && pickerPosition && createPortal(
        <div
          ref={pickerRef}
          className={`card fixed z-[1200] max-h-[calc(100dvh-1rem)] overflow-y-auto p-2.5 shadow-lg ${
            picker.type === 'shortLeave'
              ? 'w-[min(16rem,calc(100vw-1rem))]'
              : 'w-[min(20rem,calc(100vw-1rem))]'
          }`}
          style={pickerPosition}
          role="dialog"
          aria-label={
            picker.type === 'halfDay'
              ? t('attendance.chooseHalfDayPeriod')
              : t('attendance.shortLeaveTimeRange')
          }
        >
          {picker.type === 'halfDay' ? (
            <div className="flex flex-col gap-2">
              <p className="m-0 text-sm font-medium">
                {t('attendance.chooseHalfDayPeriod')}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    savePickerSelection(
                      'HALF_DAY',
                      t('attendance.halfDayRemark', {
                        period: t('attendance.period.morning'),
                      }),
                      '07:30',
                      '10:30'
                    )
                  }
                >
                  {t('attendance.period.morning')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    savePickerSelection(
                      'HALF_DAY',
                      t('attendance.halfDayRemark', {
                        period: t('attendance.period.afternoon'),
                      }),
                      '10:30',
                      '13:30'
                    )
                  }
                >
                  {t('attendance.period.afternoon')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <TimeRangeField
                startTime={startTime}
                endTime={endTime}
                startLabel={t('attendance.startTime')}
                endLabel={t('attendance.endTime')}
                placeholder={t('attendance.selectTime')}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
              />
              <p className="m-0 text-xs font-medium">
                {t('attendance.shortLeaveTimeRange')}
              </p>
              <Button
                type="button"
                size="sm"
                disabled={!startTime || !endTime || endTime <= startTime}
                onClick={() =>
                  savePickerSelection(
                    'SHORT_LEAVE',
                    t('attendance.shortLeave'),
                    startTime,
                    endTime
                  )
                }
              >
                {t('common.save')}
              </Button>
            </div>
          )}
          <Button
            type="button"
            variant="secondary2"
            size="sm"
            className="mt-2"
            onClick={() => setPicker(null)}
          >
            {t('common.cancel')}
          </Button>
        </div>,
        document.body
      )}
    </div>
  )
}
