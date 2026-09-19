export type TeacherPerformance = {
  id: number
  fullName: string
  subject?: string
  performanceScore?: number
}

export type DashboardSummary = {
  totalTeachers: number
  activeTeachers: number
  totalPeriodsAssigned: number
  teacherPerformance: TeacherPerformance[]
}
