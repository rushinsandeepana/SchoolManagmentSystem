import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import WeekSchedule from '../../../components/WeekSchedule'
import AssignPeriodFormModal from '../../../components/AssignPeriodFormModal'
import { periodApi } from '../../../api/periodApi'
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
  const [teachers, setTeachers] = useState<Array<{ id: number; fullName: string }>>([])
  const [teacherId, setTeacherId] = useState<string>('')
  const [slots, setSlots] = useState<PeriodSlot[]>([])
  const [form, setForm] = useState<PeriodForm>(emptyForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    periodApi.getTeachers().then((res) => {
      setTeachers(res.data)
      if (res.data[0]) setTeacherId(String(res.data[0].id))
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
    setError('')
    setMessage('')

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
      setMessage(t('updated'))
      const res = await periodApi.getTeacherSchedule(teacherId)
      setSlots(res.data)
      setShowForm(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1>{t('assignPeriods')}</h1>
        <button className="btn" type="button" onClick={() => setShowForm(true)}>
          {t('assign')}
        </button>
      </div>

      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

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
        <h3>{t('weekSchedule')}</h3>
        <WeekSchedule slots={slots} />
      </div>
    </div>
  )
}
