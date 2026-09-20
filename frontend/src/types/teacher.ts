export type Teacher = {
  id: number
  username: string
  fullName: string
  email?: string
  subject?: string
  performanceScore?: number
  active: boolean
}

export type TeacherForm = {
  username: string
  password: string
  fullName: string
  email: string
  subject: string[]
  active: boolean
}
