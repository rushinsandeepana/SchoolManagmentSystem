import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { UserMinus } from 'lucide-react'
import { Button, InputField, SelectField, TimeRangeField } from '../../../components/ui'
import {
  EXCEPTION_STATUSES,
  getStatusLabel,
  statusBadgeClass,
} from './attendanceUtils'
import type { ExceptionStatus, TeacherAttendanceException } from '../../../types/attendance'
import type { Teacher } from '../../../types/teacher'

type AttendanceExceptionsCardProps = {
  availableTeachers: Teacher[]
  exceptions: TeacherAttendanceException[]
  loadingTeachers: boolean
  onAddException: (teacherId: number, status: ExceptionStatus, remark: string) => void
  onUpdateStatus: (teacherId: number, status: ExceptionStatus, remark?: string) => void
  onRemoveException: (teacherId: number) => void
}

type DetailPicker = {
  mode: 'add' | 'update'
  teacherId?: number
  type: 'halfDay' | 'shortLeave'
  anchor: HTMLElement
}

export default function AttendanceExceptionsCard({
  availableTeachers,
  exceptions,
  loadingTeachers,
  onAddException,
  onUpdateStatus,
  onRemoveException,
}: AttendanceExceptionsCardProps) {
  const { t } = useTranslation()

  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [status, setStatus] = useState<ExceptionStatus>('ABSENT')
  const [remark, setRemark] = useState('')
  const [isShortLeave, setIsShortLeave] = useState(false)
  const [halfDayPeriod, setHalfDayPeriod] = useState<'morning' | 'afternoon' | ''>('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [detailPicker, setDetailPicker] = useState<DetailPicker | null>(null)
  const [pickerHalfDayPeriod, setPickerHalfDayPeriod] = useState<'morning' | 'afternoon' | ''>('')
  const [pickerStartTime, setPickerStartTime] = useState('')
  const [pickerEndTime, setPickerEndTime] = useState('')
  const [detailPickerPosition, setDetailPickerPosition] = useState<{ top: number; left: number } | null>(null)
  const detailPickerRef = useRef<HTMLDivElement>(null)
  const statusControlRefs = useRef(new Map<number, HTMLDivElement>())
  const addStatusRef = useRef<HTMLDivElement>(null)

  const openDetailPicker = (
    mode: DetailPicker['mode'],
    type: DetailPicker['type'],
    anchor: HTMLElement | null,
    teacherId?: number
  ) => {
    if (!anchor) return
    setPickerHalfDayPeriod('')
    setPickerStartTime('')
    setPickerEndTime('')
    setDetailPicker({ mode, teacherId, type, anchor })
    setDetailPickerPosition(null)
  }

  const handleStatusChange = (value: string) => {
    setIsShortLeave(value === 'SHORT_LEAVE')
    setStatus(value === 'SHORT_LEAVE' ? 'LEAVE' : value as ExceptionStatus)
    setHalfDayPeriod('')
    setStartTime('')
    setEndTime('')
    if (value === 'HALF_DAY' || value === 'SHORT_LEAVE') {
      openDetailPicker(
        'add',
        value === 'HALF_DAY' ? 'halfDay' : 'shortLeave',
        addStatusRef.current
      )
    } else {
      setDetailPicker(null)
    }
  }

  const handleAdd = () => {
    if (!selectedTeacherId) return
    const detail = isShortLeave
      ? t('attendance.shortLeaveRemark', { startTime, endTime })
      : status === 'HALF_DAY' && halfDayPeriod
        ? t('attendance.halfDayRemark', {
            period: t(`attendance.period.${halfDayPeriod}`),
          })
        : ''
    onAddException(Number(selectedTeacherId), status, [detail, remark.trim()].filter(Boolean).join(' — '))
    setSelectedTeacherId('')
    setRemark('')
    setStatus('ABSENT')
    setIsShortLeave(false)
    setHalfDayPeriod('')
    setStartTime('')
    setEndTime('')
  }

  const handleRowStatusChange = (teacherId: number, value: string) => {
    if (value === 'HALF_DAY' || value === 'SHORT_LEAVE') {
      const anchor = statusControlRefs.current.get(teacherId)
      openDetailPicker(
        'update',
        value === 'HALF_DAY' ? 'halfDay' : 'shortLeave',
        anchor ?? null,
        teacherId
      )
      return
    }

    setDetailPicker(null)
    onUpdateStatus(teacherId, value as ExceptionStatus)
  }

  useEffect(() => {
    if (!detailPicker) return undefined

    const updatePosition = () => {
      const anchorRect = detailPicker.anchor.getBoundingClientRect()
      const pickerHeight = detailPickerRef.current?.offsetHeight ?? 200
      const pickerWidth = detailPickerRef.current?.offsetWidth ?? 288
      const top = window.innerHeight - anchorRect.bottom >= pickerHeight + 8
        ? anchorRect.bottom + 8
        : Math.max(8, anchorRect.top - pickerHeight - 8)
      const left = Math.min(
        Math.max(8, anchorRect.left),
        Math.max(8, window.innerWidth - pickerWidth - 8)
      )
      setDetailPickerPosition({ top, left })
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!detailPickerRef.current?.contains(target) && !detailPicker.anchor.contains(target)) {
        setDetailPicker(null)
      }
    }

    updatePosition()
    document.addEventListener('mousedown', closeOnOutsideClick)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    const resizeObserver = detailPickerRef.current
      ? new ResizeObserver(updatePosition)
      : null
    if (detailPickerRef.current) resizeObserver?.observe(detailPickerRef.current)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      resizeObserver?.disconnect()
    }
  }, [detailPicker])

  const saveRowDetail = () => {
    if (!detailPicker) return
    if (detailPicker.type === 'halfDay' && !pickerHalfDayPeriod) return
    if (
      detailPicker.type === 'shortLeave' &&
      (!pickerStartTime || !pickerEndTime || pickerEndTime <= pickerStartTime)
    ) return

    const detail = detailPicker.type === 'halfDay'
      ? t('attendance.halfDayRemark', {
          period: t(`attendance.period.${pickerHalfDayPeriod}`),
        })
      : t('attendance.shortLeaveRemark', {
          startTime: pickerStartTime,
          endTime: pickerEndTime,
        })

    if (detailPicker.mode === 'add') {
      if (detailPicker.type === 'halfDay') setHalfDayPeriod(pickerHalfDayPeriod)
      else {
        setStartTime(pickerStartTime)
        setEndTime(pickerEndTime)
      }
      setDetailPicker(null)
      return
    }

    if (detailPicker.teacherId === undefined) return
    const statusValue: ExceptionStatus = detailPicker.type === 'halfDay' ? 'HALF_DAY' : 'LEAVE'
    onUpdateStatus(detailPicker.teacherId, statusValue, detail)
    setDetailPicker(null)
  }

  const canAdd = Boolean(
    selectedTeacherId &&
    (isShortLeave
      ? startTime && endTime && endTime > startTime
      : status !== 'HALF_DAY' || halfDayPeriod)
  )

  return (
    <div className="card mb-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <UserMinus className="size-5 text-primary shrink-0" aria-hidden />
        <h2 className="m-0 text-lg font-semibold">{t('attendance.markExceptions')}</h2>
      </div>
      <p className="muted mt-0 mb-4">{t('attendance.markExceptionsHelp')}</p>

      {/* Inputs to add new exception */}
      <div className="grid min-w-0 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="min-w-0 sm:col-span-1 xl:col-span-2">
          <SelectField
            label={t('attendance.selectTeacher')}
            value={selectedTeacherId}
            onChange={(event) => setSelectedTeacherId(event.target.value)}
            placeholder={t('attendance.placeholders.teacher')}
            options={availableTeachers.map((teacher) => ({
              value: String(teacher.id),
              label: teacher.fullName,
            }))}
            disabled={loadingTeachers || availableTeachers.length === 0}
          />
        </div>
        <div ref={addStatusRef} className="min-w-0">
          <SelectField
            label={t('attendance.columns.status')}
            value={isShortLeave ? 'SHORT_LEAVE' : status}
            onChange={(event) => handleStatusChange(event.target.value)}
            options={[
              ...EXCEPTION_STATUSES.map((st) => ({
                value: st,
                label: getStatusLabel(st, t),
              })),
              { value: 'SHORT_LEAVE', label: t('attendance.shortLeave') },
            ]}
          />
        </div>
        <div className="min-w-0 sm:col-span-2 xl:col-span-2">
          <InputField
            label={t('attendance.columns.remark')}
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            placeholder={t('attendance.placeholders.remark')}
            className="w-full min-w-0"
          />
        </div>
        <Button
          type="button"
          className="w-full"
          onClick={handleAdd}
          disabled={loadingTeachers || !canAdd}
        >
          {t('attendance.addException')}
        </Button>
      </div>

      {/* Exception list table */}
      {exceptions.length > 0 && (
        <div className="ui-table-wrap mt-4">
          <table className="ui-table">
            <thead>
              <tr>
                <th>{t('teacher.fullName')}</th>
                <th>{t('attendance.columns.status')}</th>
                <th>{t('attendance.columns.remark')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((item) => (
                <tr key={item.teacherId}>
                  <td>{item.teacherName}</td>
                  <td>
                    <span className={statusBadgeClass(item.status)}>
                      {getStatusLabel(item.status, t)}
                    </span>
                  </td>
                  <td>{item.remark || '—'}</td>
                  <td>
                    <div className="ui-action-group">
                      <div className="flex flex-col gap-2">
                        <div
                          ref={(element) => {
                            if (element) statusControlRefs.current.set(item.teacherId, element)
                            else statusControlRefs.current.delete(item.teacherId)
                          }}
                        >
                          <SelectField
                            value={item.status}
                            onChange={(event) =>
                              handleRowStatusChange(item.teacherId, event.target.value)
                            }
                            options={[
                              ...EXCEPTION_STATUSES.map((st) => ({
                                value: st,
                                label: getStatusLabel(st, t),
                              })),
                              { value: 'SHORT_LEAVE', label: t('attendance.shortLeave') },
                            ]}
                            className="min-w-[8.5rem]"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => onRemoveException(item.teacherId)}
                      >
                        {t('attendance.removeException')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detailPicker && detailPickerPosition && createPortal(
        <div
          ref={detailPickerRef}
          className={`card fixed z-[1200] p-2.5 shadow-lg ${
            detailPicker.type === 'shortLeave'
              ? 'w-[min(16rem,calc(100vw-1rem))]'
              : 'w-[min(20rem,calc(100vw-1rem))]'
          }`}
          style={detailPickerPosition}
          role="dialog"
          aria-label={
            detailPicker.type === 'halfDay'
              ? t('attendance.chooseHalfDayPeriod')
              : t('attendance.shortLeaveTimeRange')
          }
        >
          {detailPicker.type === 'halfDay' ? (
            <div className="flex flex-col gap-2">
              <p className="m-0 text-sm font-medium">
                {t('attendance.chooseHalfDayPeriod')}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={pickerHalfDayPeriod === 'morning' ? 'primary' : 'secondary2'}
                  onClick={() => setPickerHalfDayPeriod('morning')}
                >
                  {t('attendance.period.morning')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={pickerHalfDayPeriod === 'afternoon' ? 'primary' : 'secondary2'}
                  onClick={() => setPickerHalfDayPeriod('afternoon')}
                >
                  {t('attendance.period.afternoon')}
                </Button>
              </div>
            </div>
          ) : (
            <TimeRangeField
              startTime={pickerStartTime}
              endTime={pickerEndTime}
              startLabel={t('attendance.startTime')}
              endLabel={t('attendance.endTime')}
              placeholder={t('attendance.selectTime')}
              onStartTimeChange={setPickerStartTime}
              onEndTimeChange={setPickerEndTime}
            />
          )}
          {detailPicker.type === 'shortLeave' && (
            <p className="m-0 mt-1 text-xs font-medium">
              {t('attendance.shortLeaveTimeRange')}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={saveRowDetail}
              disabled={
                detailPicker.type === 'halfDay'
                  ? !pickerHalfDayPeriod
                  : !pickerStartTime ||
                    !pickerEndTime ||
                    pickerEndTime <= pickerStartTime
              }
            >
              {t('common.save')}
            </Button>
            <Button
              type="button"
              variant="secondary2"
              size="sm"
              onClick={() => setDetailPicker(null)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>,
        document.body
      )}

      {!exceptions.length && (
        <p className="muted mb-0 mt-4">{t('attendance.noExceptions')}</p>
      )}
    </div>
  )
}
