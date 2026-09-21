export type PeriodType = 'MANDATORY' | 'RELIEF' | 'FREE'

export type PeriodFilter = PeriodType | ''

export type PeriodForm = {
  dayOfWeek: string
  periodNumber: number | string
  periodType: PeriodType | ''
  subject: string
  className: string
  title: string
}

export type PeriodSlot = {
  id: number
  teacherId: number
  teacherName: string
  dayOfWeek: string
  periodNumber: number
  periodType: PeriodType
  subject?: string
  className?: string
  title?: string
}
