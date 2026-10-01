import { useTranslation } from 'react-i18next'

type AttendanceStatsCardsProps = {
  counts: {
    present: number
    absent: number
    leave: number
    halfDay: number
  }
}

export default function AttendanceStatsCards({ counts }: AttendanceStatsCardsProps) {
  const { t } = useTranslation()

  return (
    <div className="stats-grid mb-4">
      <div className="stat">
        <div className="label">{t('attendance.status.present')}</div>
        <div className="value">{counts.present}</div>
      </div>
      <div className="stat">
        <div className="label">{t('attendance.status.absent')}</div>
        <div className="value">{counts.absent}</div>
      </div>
      <div className="stat">
        <div className="label">{t('attendance.status.leave')}</div>
        <div className="value">{counts.leave}</div>
      </div>
      <div className="stat">
        <div className="label">{t('attendance.status.halfDay')}</div>
        <div className="value">{counts.halfDay}</div>
      </div>
    </div>
  )
}
