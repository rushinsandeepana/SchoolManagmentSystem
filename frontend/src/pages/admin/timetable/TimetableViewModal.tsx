import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../../../components/Modal'
import {
  Button,
  TimeTables,
} from '../../../components/ui'
import type {
  TeacherTimetable,
  WeeklyDay,
} from '../../../types/period'
import type { TimeTableColumn } from '../../../components/ui/TimeTables'

type Subject = {
  id: number
  subjectName: string
  subjectCode: string
}

type Props = {
  open: boolean
  timetable: TeacherTimetable[] | null
  subjects?: Subject[]
  onClose: () => void
}

type TimetableRow = {
  period: number
  [key: string]: TeacherTimetable | number | undefined
}

export default function TimetableViewModal({
  open,
  timetable,
  subjects = [],
  onClose,
}: Props) {
  const { t } = useTranslation()

  const teacherName =
    timetable && timetable.length > 0
      ? timetable[0].teacherName
      : ''

  const days: WeeklyDay[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ]

  const periods = Array.from(
    { length: 8 },
    (_, index) => index + 1,
  )

  /*
   * Create subject code lookup from database subjects
   * when subjects are provided.
   */
  const subjectCodeMap = useMemo(() => {
    const map = new Map<number, string>()

    subjects.forEach((subject) => {
      map.set(
        subject.id,
        subject.subjectCode,
      )
    })

    return map
  }, [subjects])

  const timetableSubjects = useMemo(() => {
    if (!timetable || subjects.length === 0) {
      return []
    }

    const uniqueSubjectIds = new Set<number>()

    timetable.forEach((item) => {
      uniqueSubjectIds.add(item.subjectId)
    })

    return subjects.filter((subject) =>
      uniqueSubjectIds.has(subject.id),
    )
  }, [timetable, subjects])

  const timetableMap = useMemo(() => {
    const map = new Map<
      string,
      TeacherTimetable
    >()

    timetable?.forEach((item) => {
      map.set(
        `${item.day}-${item.period}`,
        item,
      )
    })

    return map
  }, [timetable])

  const rows = useMemo<TimetableRow[]>(() => {
    return periods.map((period) => {
      const row: TimetableRow = {
        period,
      }

      days.forEach((day) => {
        row[day] = timetableMap.get(
          `${day}-${period}`,
        )
      })

      return row
    })
  }, [periods, days, timetableMap])

  const formatDay = (day: WeeklyDay) => {
    return (
      day.charAt(0) +
      day.slice(1).toLowerCase()
    )
  }

  const columns = useMemo<
    TimeTableColumn<TimetableRow>[]
  >(() => {
    return [
      {
        key: 'period',
        header: t(
          'timetable.periodHeader',
          'Periods',
        ),
        headerClassName:
          'w-12 text-center sm:w-16 md:w-20',
        className:
          'w-12 bg-surface-2 text-center font-semibold sm:w-16 md:w-20',
        render: (row) => `P${row.period}`,
      },

      ...days.map((day) => ({
        key: day,
        header: formatDay(day),
        headerClassName:
          'px-1 text-center text-[10px] sm:px-2 sm:text-xs',
        className:
          'px-1 py-2 text-center sm:px-2 sm:py-2',
        render: (row: TimetableRow) => {
          const item = row[day] as
            | TeacherTimetable
            | undefined

          if (!item) {
            return (
              <span className="font-medium text-text-muted">
                -
              </span>
            )
          }

          const subjectCode =
            subjectCodeMap.get(
              item.subjectId,
            )

          return (
            <div className="flex min-w-0 flex-col items-center justify-center leading-tight">
              <span className="max-w-full truncate text-[10px] font-semibold text-text sm:text-xs">
                {subjectCode ||
                  item.subjectName ||
                  '-'}
              </span>

              <span className="mt-0.5 max-w-full truncate text-[9px] text-text-muted sm:text-[10px]">
                {item.className || '-'}
              </span>
            </div>
          )
        },
      })),
    ]
  }, [days, subjectCodeMap, t])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(
        'timetable.view',
        'Teacher Timetable',
      )}
      size="lg"
    >
      <div className="space-y-3">
        {/* Teacher & Subjects */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-medium text-text"> 
                {t('timetable.teacher', 'Teacher')}:{' '} 
                <span className="mt-1 truncate text-base font-semibold text-text"> {teacherName || '-'} </span> 
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-start gap-1 text-sm font-medium text-text">
                <span className="shrink-0">
                {t('timetable.subjects', 'Subjects')}:
                </span>

                <div className="min-w-0 space-y-0.5">
                {timetableSubjects.length > 0 ? (
                    timetableSubjects.map((subject) => (
                    <div
                        key={subject.id}
                        className="whitespace-normal break-words text-xs font-normal text-text"
                    >
                        {subject.subjectName}
                    </div>
                    ))
                ) : timetable && timetable.length > 0 ? (
                    Array.from(
                    new Map(
                        timetable.map((item) => [
                        item.subjectId,
                        item.subjectName,
                        ]),
                    ).entries(),
                    ).map(([subjectId, subjectName]) => (
                    <div
                        key={subjectId}
                        className="whitespace-normal break-words text-xs font-normal text-text"
                    >
                        {subjectName || '-'}
                    </div>
                    ))
                ) : (
                    <div className="text-xs font-normal text-text-muted">
                    -
                    </div>
                )}
                </div>
            </div>
          </div>
        </div>

        {/* Timetable */}
        <TimeTables
          columns={columns}
          data={rows}
          headerClassName="bg-primary"
          rowKey={(row) => row.period}
          className="text-[10px] sm:text-xs"
          emptyMessage={t(
            'timetable.noTimetable',
            'No timetable found',
          )}
        />

        {/* Total */}
        <div className="text-xs text-text-muted">
          {t(
            'timetable.totalPeriods',
            'Total periods',
          )}
          :{' '}
          <span className="font-semibold text-text">
            {timetable?.length ?? 0}
          </span>
        </div>
      </div>
    </Modal>
  )
}