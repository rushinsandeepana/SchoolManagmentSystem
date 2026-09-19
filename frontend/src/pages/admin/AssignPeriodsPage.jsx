import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import WeekSchedule from '../../components/WeekSchedule'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
const TYPES = ['MANDATORY', 'RELIEF', 'FREE']

export default function AssignPeriodsPage() {
  const { t } = useTranslation()
  const [teachers, setTeachers] = useState([])
  const [teacherId, setTeacherId] = useState('')
  const [slots, setSlots] = useState([])
  const [form, setForm] = useState({
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    periodType: 'MANDATORY',
    subject: '',
    className: '',
    title: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/teachers').then((res) => {
      setTeachers(res.data)
      if (res.data[0]) setTeacherId(String(res.data[0].id))
    })
  }, [])

  useEffect(() => {
    if (!teacherId) return
    api.get(`/admin/teachers/${teacherId}/schedule`).then((res) => setSlots(res.data))
  }, [teacherId])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onAssign = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await api.post('/admin/periods', {
        teacherId: Number(teacherId),
        dayOfWeek: form.dayOfWeek,
        periodNumber: Number(form.periodNumber),
        periodType: form.periodType,
        subject: form.subject || null,
        className: form.className || null,
        title: form.title || null,
      })
      setMessage(t('updated'))
      const res = await api.get(`/admin/teachers/${teacherId}/schedule`)
      setSlots(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1>{t('assignPeriods')}</h1>
      </div>

      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <form className="form" onSubmit={onAssign}>
          <div className="form-row cols-2">
            <label>
              {t('teacher')}
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('day')}
              <select name="dayOfWeek" value={form.dayOfWeek} onChange={onChange}>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {t(d)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('period')}
              <select name="periodNumber" value={form.periodNumber} onChange={onChange}>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    P{p}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('periodType')}
              <select name="periodType" value={form.periodType} onChange={onChange}>
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(type.toLowerCase())}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('subject')}
              <input name="subject" value={form.subject} onChange={onChange} />
            </label>
            <label>
              {t('className')}
              <input name="className" value={form.className} onChange={onChange} />
            </label>
            <label>
              {t('title')}
              <input name="title" value={form.title} onChange={onChange} />
            </label>
          </div>
          <button className="btn" type="submit">
            {t('assign')}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>{t('weekSchedule')}</h3>
        <WeekSchedule slots={slots} />
      </div>
    </div>
  )
}
