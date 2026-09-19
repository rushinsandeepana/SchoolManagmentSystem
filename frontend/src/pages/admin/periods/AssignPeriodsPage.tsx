import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import WeekSchedule from '../../../components/WeekSchedule'
import AssignPeriodFormModal from '../../../components/AssignPeriodFormModal'
import { periodApi } from '../../../api/periodApi'
import { useToast } from '../../../context/ToastContext'
import type { PeriodForm, PeriodSlot } from '../../../types/period'

const emptyForm: PeriodForm = {
  dayOfWeek: 'MONDAY',
  periodNumber: 1,
  periodType: 'MANDATORY',
  subject: '',
  className: '',
  title: '',
}

export default function AssignPeriodsPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [teachers, setTeachers] = useState<Array<{ id: number; fullName: string }>>([])
  const [teacherId, setTeacherId] = useState<string>('')
  const [slots, setSlots] = useState<PeriodSlot[]>([])
  const [form, setForm] = useState<PeriodForm>(emptyForm)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    periodApi.getTeachers().then((res) => {
      const list = res.data.content || []
      setTeachers(list)
      if (list[0]) setTeacherId(String(list[0].id))
    })
  }, [])

  useEffect(() => {
    if (!teacherId) return
    periodApi.getTeacherSchedule(teacherId).then((res) => setSlots(res.data))
  }, [teacherId])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await periodApi.assign({
        teacherId: Number(teacherId),
        dayOfWeek: form.dayOfWeek,
        periodNumber: Number(form.periodNumber),
        periodType: form.periodType,
        subject: form.subject || null,
        className: form.className || null,
        title: form.title || null,
      })
      showToast(t('common.updated'), 'success')
      const res = await periodApi.getTeacherSchedule(teacherId)
      setSlots(res.data)
      setShowForm(false)
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error'), 'error')
    }
  }

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1 className="text-2xl sm:text-3xl">{t('nav.assignPeriods')}</h1>
        <button className="btn w-full sm:w-auto" type="button" onClick={() => setShowForm(true)}>
          {t('schedule.assign')}
        </button>
      </div>

      <AssignPeriodFormModal
        open={showForm}
        teachers={teachers}
        teacherId={teacherId}
        setTeacherId={setTeacherId}
        form={form}
        onChange={onChange}
        onSubmit={onAssign}
        onClose={() => setShowForm(false)}
      />

      <div className="card">
        <h3>{t('schedule.weekly')}</h3>
        <WeekSchedule slots={slots} />
      </div>
    </div>
  )
}
