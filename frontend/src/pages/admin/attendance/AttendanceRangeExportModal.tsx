import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import Modal from '../../../components/Modal'
import { Button, InputField } from '../../../components/ui'
import { firstDayOfMonthIso, todayIso } from './attendanceUtils'

type AttendanceRangeExportModalProps = {
  open: boolean
  onClose: () => void
  onExport: (startDate: string, endDate: string) => void
  exporting: boolean
}

export default function AttendanceRangeExportModal({
  open,
  onClose,
  onExport,
  exporting,
}: AttendanceRangeExportModalProps) {
  const { t } = useTranslation()

  const [startDate, setStartDate] = useState(firstDayOfMonthIso)
  const [endDate, setEndDate] = useState(todayIso)

  const handleThisWeek = () => {
    const now = new Date()
    const monday = new Date(now)
    const day = monday.getDay()
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1)
    monday.setDate(diff)
    setStartDate(monday.toISOString().slice(0, 10))
    setEndDate(todayIso())
  }

  const handleThisMonth = () => {
    setStartDate(firstDayOfMonthIso())
    setEndDate(todayIso())
  }

  const handleLast30Days = () => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    setStartDate(d.toISOString().slice(0, 10))
    setEndDate(todayIso())
  }

  return (
    <Modal
      open={open}
      title={t('attendance.exportRangeTitle')}
      onClose={onClose}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <p className="muted text-sm m-0">
          Select the date range to generate a comprehensive Excel report
          including the Attendance Matrix and Detailed Log sheets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label={t('attendance.startDate')}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <InputField
            label={t('attendance.endDate')}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleThisWeek}
          >
            This Week
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleThisMonth}
          >
            This Month
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleLast30Days}
          >
            Last 30 Days
          </Button>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[var(--border)]">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={exporting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => onExport(startDate, endDate)}
            disabled={exporting || !startDate || !endDate}
          >
            <Download className="size-4 mr-1.5 shrink-0" aria-hidden />
            {exporting ? t('attendance.downloading') : t('attendance.exportExcel')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
