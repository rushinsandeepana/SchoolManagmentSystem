import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import WeekSchedule from '../../../components/WeekSchedule'
import { teacherApi } from '../../../api/teacherApi'
import type { PeriodSlot } from '../../../types/period'

export default function TeacherSchedulePage() {
  const { t } = useTranslation()
  const [slots, setSlots] = useState<PeriodSlot[]>([])

  useEffect(() => {
    teacherApi.getMySchedule().then((res) => setSlots(res.data))
  }, [])

  return (
    <div className="fade-in">
      <div className="section-head">
        <div>
          <h1 className="text-2xl sm:text-3xl">{t('schedule.mySchedule')}</h1>
          <p className="m-0 muted">{t('schedule.weekly')}</p>
        </div>
      </div>
      <div className="card">
        <WeekSchedule slots={slots} />
      </div>
    </div>
  )
}
