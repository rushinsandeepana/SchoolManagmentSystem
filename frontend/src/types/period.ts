export type PeriodType = 'MANDATORY' | 'RELIEF' | 'FREE'

export type PeriodFilter = PeriodType | ''

export type PeriodForm = {
  date: string
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
  date: string
  periodNumber: number
  periodType: PeriodType
  subject?: string
  className?: string
  title?: string
}

export type WeeklyDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'

export type TeacherTimetable = {
  id: number
  teacherId: number
  teacherName: string
  dayOfWeek: WeeklyDay
  periodNumber: number
  subjectId: number
  subjectName: string
  classId: number
  className: string
}

export type CreateTeacherTimetableSlotRequest = {
  teacherId: number
  dayOfWeek: WeeklyDay
  periodNumber: number
  subjectId: number
  classId: number
}

export type UpdateTeacherTimetableSlotRequest = {
  dayOfWeek: WeeklyDay
  periodNumber: number
  subjectId: number
  classId: number
}
