import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserMinus } from 'lucide-react'
import { Button, InputField, SelectField } from '../../../components/ui'
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
  onUpdateStatus: (teacherId: number, status: ExceptionStatus) => void
  onRemoveException: (teacherId: number) => void
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

  const handleAdd = () => {
    if (!selectedTeacherId) return
    onAddException(Number(selectedTeacherId), status, remark)
    setSelectedTeacherId('')
    setRemark('')
    setStatus('ABSENT')
  }

  return (
    <div className="card mb-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <UserMinus className="size-5 text-primary shrink-0" aria-hidden />
        <h2 className="m-0 text-lg font-semibold">{t('attendance.markExceptions')}</h2>
      </div>
      <p className="muted mt-0 mb-4">{t('attendance.markExceptionsHelp')}</p>

      {/* Inputs to add new exception */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_auto] lg:items-end">
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
        <SelectField
          label={t('attendance.columns.status')}
          value={status}
          onChange={(event) => setStatus(event.target.value as ExceptionStatus)}
          options={EXCEPTION_STATUSES.map((st) => ({
            value: st,
            label: getStatusLabel(st, t),
          }))}
        />
        <InputField
          label={t('attendance.columns.remark')}
          value={remark}
          onChange={(event) => setRemark(event.target.value)}
          placeholder={t('attendance.placeholders.remark')}
        />
        <Button
          type="button"
          className="w-full lg:w-auto"
          onClick={handleAdd}
          disabled={loadingTeachers || !selectedTeacherId}
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
                      <SelectField
                        value={item.status}
                        onChange={(event) =>
                          onUpdateStatus(item.teacherId, event.target.value as ExceptionStatus)
                        }
                        options={EXCEPTION_STATUSES.map((st) => ({
                          value: st,
                          label: getStatusLabel(st, t),
                        }))}
                        className="min-w-[8.5rem]"
                      />
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

      {!exceptions.length && (
        <p className="muted mb-0 mt-4">{t('attendance.noExceptions')}</p>
      )}
    </div>
  )
}
