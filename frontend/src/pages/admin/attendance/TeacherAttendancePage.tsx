import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, FileSpreadsheet } from 'lucide-react'
import { periodApi } from '../../../api/periodApi'
import { attendanceApi } from '../../../api/attendanceApi'
import { Button, InputField } from '../../../components/ui'
import { useToast } from '../../../context/ToastContext'
import AttendanceStatsCards from './AttendanceStatsCards'
import AttendanceExceptionsCard from './AttendanceExceptionsCard'
import AttendanceRosterCard from './AttendanceRosterCard'
import AttendanceRangeExportModal from './AttendanceRangeExportModal'
import { downloadBlob, todayIso } from './attendanceUtils'
import type { ExceptionStatus, TeacherAttendanceException } from '../../../types/attendance'
import type { Teacher } from '../../../types/teacher'

export default function TeacherAttendancePage() {
  const { t } = useTranslation()
  const { showToast } = useToast()

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [date, setDate] = useState(todayIso)
  const [exceptionsByDate, setExceptionsByDate] = useState<
    Record<string, TeacherAttendanceException[]>
  >({})
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exportingDay, setExportingDay] = useState(false)
  const [exportingRange, setExportingRange] = useState(false)
  const [showRangeModal, setShowRangeModal] = useState(false)

  // 1. Fetch active teachers
  useEffect(() => {
    setLoadingTeachers(true)
    periodApi
      .getTeachers()
      .then((res) => {
        const list = ((res.data || []) as Teacher[])
          .filter((teacher) => teacher.active)
          .slice()
          .sort((a, b) => a.fullName.localeCompare(b.fullName))
        setTeachers(list)
      })
      .catch((err) => {
        showToast(err.response?.data?.message || t('common.error'), 'error')
      })
      .finally(() => setLoadingTeachers(false))
  }, [showToast, t])

  // 2. Fetch daily attendance on date change
  useEffect(() => {
    let cancelled = false
    setLoadingAttendance(true)

    attendanceApi
      .getDaily(date)
      .then((res) => {
        if (cancelled) return
        const daily = res.data
        const backendExceptions: TeacherAttendanceException[] = (daily.records || [])
          .filter((r) => r.status !== 'PRESENT')
          .map((r) => ({
            teacherId: r.teacherId,
            teacherName: r.teacherName,
            status: r.status as ExceptionStatus,
            remark: r.remark,
            startTime: r.startTime,
            endTime: r.endTime,
          }))

        setExceptionsByDate((prev) => ({ ...prev, [date]: backendExceptions }))
        setIsSaved(Boolean(daily.saved))
      })
      .catch((err) => {
        if (!cancelled) {
          showToast(err.response?.data?.message || t('common.error'), 'error')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAttendance(false)
      })

    return () => {
      cancelled = true
    }
  }, [date, showToast, t])

  const exceptions = exceptionsByDate[date] || []

  const exceptionMap = useMemo(() => {
    return new Map(exceptions.map((item) => [item.teacherId, item]))
  }, [exceptions])

  const availableTeachers = useMemo(() => {
    return teachers.filter((teacher) => !exceptionMap.has(teacher.id))
  }, [teachers, exceptionMap])

  const counts = useMemo(() => {
    const absent = exceptions.filter((item) => item.status === 'ABSENT').length
    const leave = exceptions.filter((item) => item.status === 'LEAVE').length
    const halfDay = exceptions.filter((item) => item.status === 'HALF_DAY').length
    const present = Math.max(0, teachers.length - exceptions.length)
    return { present, absent, leave, halfDay }
  }, [exceptions, teachers.length])

  const setExceptionsForDate = useCallback(
    (next: TeacherAttendanceException[]) => {
      setExceptionsByDate((prev) => ({ ...prev, [date]: next }))
      setIsSaved(false)
    },
    [date]
  )

  const handleAddException = (
    teacherId: number,
    status: ExceptionStatus,
    remark: string,
    startTime?: string,
    endTime?: string
  ) => {
    const teacher = teachers.find((item) => item.id === teacherId)
    if (!teacher) return

    if (exceptionMap.has(teacher.id)) {
      showToast(t('attendance.alreadyMarked'), 'error')
      return
    }

    setExceptionsForDate([
      ...exceptions,
      {
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        status,
        remark: remark.trim() || undefined,
        startTime,
        endTime,
      },
    ])
    showToast(t('attendance.exceptionAdded'), 'success')
  }

  const handleUpdateExceptionStatus = (
    teacherId: number,
    status: ExceptionStatus,
    remark?: string,
    startTime?: string,
    endTime?: string
  ) => {
    setExceptionsForDate(
      exceptions.map((item) =>
        item.teacherId === teacherId
          ? {
              ...item,
              status,
              ...(remark === undefined ? {} : { remark }),
              startTime: status === 'LEAVE' || status === 'HALF_DAY'
                ? startTime ?? item.startTime
                : undefined,
              endTime: status === 'LEAVE' || status === 'HALF_DAY'
                ? endTime ?? item.endTime
                : undefined,
            }
          : item
      )
    )
  }

  const handleRemoveException = (teacherId: number) => {
    setExceptionsForDate(exceptions.filter((item) => item.teacherId !== teacherId))
  }

  const handleMarkExceptionFromRoster = (
    teacherId: number,
    teacherName: string,
    status: ExceptionStatus,
    remark?: string,
    startTime?: string,
    endTime?: string
  ) => {
    setExceptionsForDate([
      ...exceptions,
      { teacherId, teacherName, status, remark, startTime, endTime },
    ])
  }

  const onSave = async () => {
    setSaving(true)
    try {
      const payload = {
        date,
        exceptions: exceptions.map((e) => ({
          teacherId: e.teacherId,
          status: e.status,
          remark: e.remark,
          startTime: e.startTime,
          endTime: e.endTime,
        })),
      }
      await attendanceApi.saveDaily(payload)
      setIsSaved(true)
      showToast(t('attendance.saved'), 'success')
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(errorMsg || t('common.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const onExportDaily = async () => {
    setExportingDay(true)
    try {
      const res = await attendanceApi.exportDaily(date)
      downloadBlob(res.data, `teacher-attendance_${date}.xlsx`)
      showToast(t('attendance.downloadSuccess'), 'success')
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(errorMsg || t('attendance.downloadError'), 'error')
    } finally {
      setExportingDay(false)
    }
  }

  const onExportRange = async (startDate: string, endDate: string) => {
    if (endDate < startDate) {
      showToast('End date cannot be earlier than start date', 'error')
      return
    }

    setExportingRange(true)
    try {
      const res = await attendanceApi.exportRange(startDate, endDate)
      downloadBlob(res.data, `teacher-attendance_${startDate}_to_${endDate}.xlsx`)
      showToast(t('attendance.downloadSuccess'), 'success')
      setShowRangeModal(false)
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(errorMsg || t('attendance.downloadError'), 'error')
    } finally {
      setExportingRange(false)
    }
  }
console.log("exceptions", exceptions);
  return (
    <div className="fade-in">
      {/* Top Header */}
      <div className="section-head">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl m-0">{t('attendance.title')}</h1>
            <span className={isSaved ? 'badge badge-saved' : 'badge badge-draft'}>
              {isSaved ? t('attendance.savedBadge') : t('attendance.draftBadge')}
            </span>
          </div>
          <p className="m-0 muted mt-1">{t('attendance.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={onExportDaily}
            disabled={exportingDay || loadingTeachers || loadingAttendance}
            title={t('attendance.exportDay')}
          >
            <FileSpreadsheet className="size-4 mr-1.5 shrink-0" aria-hidden />
            {exportingDay ? t('attendance.downloading') : t('attendance.exportDay')}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowRangeModal(true)}
            disabled={exportingRange || loadingTeachers}
            title={t('attendance.exportRange')}
          >
            <Calendar className="size-4 mr-1.5 shrink-0" aria-hidden />
            {t('attendance.exportRange')}
          </Button>

          <Button
            className="w-full sm:w-auto"
            onClick={onSave}
            disabled={saving || loadingTeachers || loadingAttendance}
          >
            {saving ? t('common.saving') : t('attendance.save')}
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="card mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <InputField
            label={t('attendance.date')}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          <Button type="button" variant="secondary" onClick={() => setDate(todayIso())}>
            {t('schedule.today')}
          </Button>
          <p className="m-0 muted flex-1 min-w-[12rem] pb-2">{t('attendance.hint')}</p>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <AttendanceStatsCards counts={counts} />

      {/* Exceptions Form & List */}
      <AttendanceExceptionsCard
        availableTeachers={availableTeachers}
        exceptions={exceptions}
        loadingTeachers={loadingTeachers}
        onAddException={handleAddException}
        onUpdateStatus={handleUpdateExceptionStatus}
        onRemoveException={handleRemoveException}
      />

      {/* Full Roster Table */}
      <AttendanceRosterCard
        teachers={teachers}
        exceptions={exceptions}
        loading={loadingTeachers || loadingAttendance}
        onMarkException={handleMarkExceptionFromRoster}
        onUpdateExceptionStatus={handleUpdateExceptionStatus}
        onMarkPresent={handleRemoveException}
      />

      {/* Date Range Export Modal */}
      <AttendanceRangeExportModal
        open={showRangeModal}
        onClose={() => setShowRangeModal(false)}
        onExport={onExportRange}
        exporting={exportingRange}
      />
    </div>
  )
}
