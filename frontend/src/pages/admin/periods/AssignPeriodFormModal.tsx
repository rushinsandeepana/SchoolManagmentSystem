import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../../../components/Modal'
import { Button, SelectField  } from '../../../components/ui'
import { Subject } from '../../../types/subject'
import type { SchoolClass } from '../../../types/class'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
const TYPES = ['MANDATORY', 'RELIEF', 'FREE']

type Teacher = {
  id: string | number
  fullName: string
}

type FormValues = {
  dayOfWeek: string
  periodNumber: string | number
  periodType: string
  subject: string
  className: string
  title: string
}

export type AssignmentErrors = Partial<Record<'teacherId' | keyof FormValues, string>>

type Props = {
  open: boolean
  teachers: Teacher[]
  subjects: Subject[]
  classes: SchoolClass[]
  teacherId: string | number
  setTeacherId: (value: string) => void
  form: FormValues
  errors: AssignmentErrors
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function AssignPeriodFormModal({
  open,
  teachers,
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

  return (
    <Modal open={open} title={t('nav.assignPeriods')} onClose={onClose}>
      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="form-row cols-2">
          <SelectField
            label={t('teacher.singular')}
            placeholder={t('common.selectOption')}
            value={teacherId}
            onChange={(event: { target: { value: string } }) => setTeacherId(event.target.value)}
            required
            title={t('validation.teacherRequired')}
            error={errors.teacherId}
            options={teachers.map((teacher) => ({
              value: String(teacher.id),
              label: teacher.fullName,
            }))}
          />

          <SelectField
            label={t('schedule.day')}
            placeholder={t('common.selectOption')}
            name="dayOfWeek"
            value={form.dayOfWeek}
            onChange={onChange}
            required
            title={t('validation.dayRequired')}
            error={errors.dayOfWeek}
            options={DAYS.map((day) => ({
              value: day,
              label: t(day),
            }))}
          />

          <SelectField
            label={t('schedule.period')}
            placeholder={t('common.selectOption')}
            name="periodNumber"
            value={form.periodNumber}
            onChange={onChange}
            required
            title={t('validation.periodRequired')}
            error={errors.periodNumber}
            options={Array.from({ length: 8 }, (_, index) => ({
              value: String(index + 1),
              label: `P${index + 1}`,
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
              value: [schoolClass.grade, schoolClass.section].filter(Boolean).join(''),
              label: [schoolClass.grade, schoolClass.section].filter(Boolean).join(''),
            }))}
          />

          <label className="sm:col-span-2">
            {t('period.title')}
            <input className="input" name="title" value={form.title} onChange={onChange} placeholder={t('period.placeholders.title')} />
          </label>
        </div>

        <div className="form-actions">
          <Button type="submit" className="w-full sm:w-auto">
            {t('schedule.assign')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}