export type Subject = {
  id: number
  subjectName: string
  subjectCode?: string
  subjectType?: string
  active: boolean
}

export type SubjectForm = {
  subjectName: string
  subjectCode: string
  subjectType: string
  active: boolean
}
