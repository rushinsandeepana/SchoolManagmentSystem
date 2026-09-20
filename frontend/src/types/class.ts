export type SchoolClass = {
  id: number
  grade: string
  section: string
  description?: string
  capacity?: number
  classTeacherName?: string
  active: boolean
}

export type ClassForm = {
  grade: string
  section: string
  description: string
  capacity: string | number
  classTeacherName: string
  active: boolean
}
