import { useTranslation } from 'react-i18next'
import Modal from './Modal'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
const TYPES = ['MANDATORY', 'RELIEF', 'FREE']

export default function AssignPeriodFormModal({ open, teachers, teacherId, setTeacherId, form, onChange, onSubmit, onClose }) {
  const { t } = useTranslation()

  return (
    <Modal open={open} title={t('assignPeriods')} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
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
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {t(day)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('period')}
            <select name="periodNumber" value={form.periodNumber} onChange={onChange}>
              {Array.from({ length: 8 }, (_, index) => index + 1).map((period) => (
                <option key={period} value={period}>
                  P{period}
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
    </Modal>
  )
}
