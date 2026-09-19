export type PeriodType = 'MANDATORY' | 'RELIEF' | 'FREE'

export type PeriodForm = {
  dayOfWeek: string
  periodNumber: number
  periodType: PeriodType
  subject: string
  className: string
  title: string
}

export type PeriodSlot = {
  id?: number
  dayOfWeek: string
  periodNumber: number
  periodType: PeriodType
  subject?: string
  className?: string
  title?: string
}
