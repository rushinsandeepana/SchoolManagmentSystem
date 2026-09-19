import type { ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import { Button, SelectField  } from './ui'

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

type Props = {
  open: boolean
  teachers: Teacher[]
  teacherId: string | number
  setTeacherId: (value: string) => void
  form: FormValues
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function AssignPeriodFormModal({
  open,
  teachers,
  teacherId,
  setTeacherId,
  form,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={t('nav.assignPeriods')} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-row cols-2">
          <SelectField
            label={t('teacher.singular')}
            value={teacherId}
            onChange={(event: { target: { value: string } }) => setTeacherId(event.target.value)}
            required
            options={teachers.map((teacher) => ({
              value: teacher.id,
              label: teacher.fullName,
            }))}
          />

          <SelectField
            label={t('schedule.day')}
            name="dayOfWeek"
            value={form.dayOfWeek}
            onChange={onChange}
            options={DAYS.map((day) => ({
              value: day,
              label: t(day),
            }))}
          />

          <SelectField
            label={t('schedule.period')}
            name="periodNumber"
            value={form.periodNumber}
            onChange={onChange}
            options={Array.from({ length: 8 }, (_, index) => ({
              value: index + 1,
              label: `P${index + 1}`,
            }))}
          />

          <SelectField
            label={t('schedule.periodType')}
            name="periodType"
            value={form.periodType}
            onChange={onChange}
            options={TYPES.map((type) => ({
              value: type,
              label: t(type.toLowerCase()),
            }))}
          />

          <label>
            {t('teacher.subject')}
            <input className="input" name="subject" value={form.subject} onChange={onChange} placeholder={t('schedule.placeholders.subject')} />
          </label>

          <label>
            {t('schedule.className')}
            <input className="input" name="className" value={form.className} onChange={onChange} placeholder={t('schedule.placeholders.className')} />
          </label>

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