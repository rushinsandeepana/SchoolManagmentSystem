import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import WeekSchedule from '../../components/WeekSchedule'

export default function TeacherSchedulePage() {
  const { t } = useTranslation()
  const [slots, setSlots] = useState([])

  useEffect(() => {
    api.get('/teacher/schedule').then((res) => setSlots(res.data))
  }, [])

  return (
    <div className="fade-in">
      <div className="section-head">
        <div>
          <h1>{t('mySchedule')}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {t('weekSchedule')}
          </p>
        </div>
      </div>
      <div className="card">
        <WeekSchedule slots={slots} />
      </div>
    </div>
  )
}
