import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../../../components/Modal'
import { Button, InputField, SelectField } from '../../../components/ui'
import { Subject } from '../../../types/subject'
import type { SchoolClass } from '../../../types/class'
import { periodApi } from '../../../api/periodApi'
import { useToast } from '../../../context/ToastContext'
import type { Teacher } from '../../../types/teacher'

const TYPES = ['MANDATORY', 'RELIEF', 'FREE']

type FormValues = {
  date: string
  periodNumber: string | number
  periodType: string
  subject: string
  className: string
  title: string
}

export type AssignmentErrors = Partial<
  Record<'teacherId' | keyof FormValues, string>
>

type Props = {
  open: boolean
  subjects: Subject[]
  classes: SchoolClass[]
  teacherId: string | number
  setTeacherId: (value: string) => void
  form: FormValues
  errors: AssignmentErrors
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function AssignPeriodFormModal({
  open,
  teacherId,
  subjects,
  classes,
  setTeacherId,
  form,
  errors,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([])
  const [loadingAvailableTeachers, setLoadingAvailableTeachers] = useState(false)
  const [teacherAvailabilityError, setTeacherAvailabilityError] = useState(false)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate())
  const minDate = tomorrow.toISOString().split('T')[0]

  const isDayAndPeriodSelected = Boolean(form.date) && Boolean(form.periodNumber)

  useEffect(() => {
    if (!open || !isDayAndPeriodSelected) {
      setAvailableTeachers([])
      setLoadingAvailableTeachers(false)
      setTeacherAvailabilityError(false)
      return
    }

    let cancelled = false

    setAvailableTeachers([])
    setTeacherAvailabilityError(false)
    setLoadingAvailableTeachers(true)

    const loadAvailableTeachers = async () => {
      try {
        const response = await periodApi.getAvailableTeachers(
          form.date,
          Number(form.periodNumber),
          teacherId ? Number(teacherId) : undefined,
        )

        if (cancelled) return

        setAvailableTeachers(response.data)
      } catch {
        if (!cancelled) {
          setTeacherAvailabilityError(true)
          showToast(t('common.error'), 'error')
        }
      } finally {
        if (!cancelled) setLoadingAvailableTeachers(false)
      }
    }

    void loadAvailableTeachers()

    return () => {
      cancelled = true
    }
  }, [form.date, form.periodNumber, isDayAndPeriodSelected, open, showToast, t, teacherId])

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (event.target.name === 'date' || event.target.name === 'periodNumber') {
      setTeacherId('')
    }
    onChange(event)
  }

  return (
    <Modal
      open={open}
      title={t('nav.assignPeriods')}
      onClose={onClose}
    >
      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Day */}
          <InputField
            label={t('schedule.day')}
            type="date"
            name="date"
            value={form.date}
            onChange={handleFormChange}
            min={minDate}
            required
            title={t('validation.dayRequired')}
            error={errors.date}
          />

          {/* Period */}
          <SelectField
            label={t('schedule.period')}
            placeholder={t('common.selectOption')}
            name="periodNumber"
            value={form.periodNumber}
            onChange={handleFormChange}
            required
            title={t('validation.periodRequired')}
            error={errors.periodNumber}
            options={Array.from({ length: 8 }, (_, index) => ({
              value: String(index + 1),
              label: `P${index + 1}`,
            }))}
          />
        </div>
        <div className="form-row cols-2">
          {/* Other fields only display after Day + Period are selected */}
          {isDayAndPeriodSelected && (
            <>
              <SelectField
                label={t('teacher.singular')}
                placeholder={
                  loadingAvailableTeachers
                    ? t('common.loading')
                    : teacherAvailabilityError
                      ? t('common.error')
                      : availableTeachers.length === 0
                        ? t('common.noResults')
                        : t('common.selectOption')
                }
                value={teacherId}
                onChange={(event: {
                  target: { value: string }
                }) => setTeacherId(event.target.value)}
                required
                title={t('validation.teacherRequired')}
                error={errors.teacherId}
                disabled={loadingAvailableTeachers || teacherAvailabilityError || availableTeachers.length === 0}
                options={availableTeachers.map((teacher) => ({
                  value: String(teacher.id),
                  label: teacher.fullName,
                }))}
              />

              <SelectField
                label={t('schedule.periodType')}
                placeholder={t('common.selectOption')}
                name="periodType"
                value={form.periodType}
                onChange={onChange}
                required
                title={t('validation.periodTypeRequired')}
                error={errors.periodType}
                options={TYPES.map((type) => ({
                  value: type,
                  label: t(type.toLowerCase()),
                }))}
              />

              <SelectField
                label={t('teacher.subject')}
                placeholder={t('common.selectOption')}
                name="subject"
                value={form.subject}
                onChange={onChange}
                required
                title={t('validation.subjectRequired')}
                error={errors.subject}
                options={subjects.map((subject) => ({
                  value: subject.subjectName,
                  label: subject.subjectName,
                }))}
              />

              <SelectField
                label={t('schedule.className')}
                placeholder={t('common.selectOption')}
                name="className"
                required
                value={form.className}
                onChange={onChange}
                title={t('validation.classRequired')}
                error={errors.className}
                options={classes.map((schoolClass) => ({
                  value: [schoolClass.grade, schoolClass.section]
                    .filter(Boolean)
                    .join(''),
                  label: [schoolClass.grade, schoolClass.section]
                    .filter(Boolean)
                    .join(''),
                }))}
              />

              <InputField
                className="sm:col-span-2"
                label={t('period.title')}
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder={t('period.placeholders.title')}
              />
            </>
          )}
        </div>

        {isDayAndPeriodSelected && (
          <div className="form-actions">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loadingAvailableTeachers || teacherAvailabilityError || !teacherId}
            >
              {t('schedule.assign')}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  )
}