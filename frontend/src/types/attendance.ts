export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALF_DAY'

/** Non-present statuses that admins mark as exceptions */
export type ExceptionStatus = Exclude<AttendanceStatus, 'PRESENT'>

export type TeacherAttendanceException = {
  teacherId: number
  teacherName?: string
  status: ExceptionStatus
  remark?: string
}

export type TeacherAttendanceRecord = {
  id?: number
  teacherId: number
  teacherName: string
  teacherUsername: string
  teacherEmail?: string
  attendanceDate: string
  status: AttendanceStatus
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export type DailyTeacherAttendance = {
  date: string
  totalTeachers: number
  presentCount: number
  absentCount: number
  leaveCount: number
  halfDayCount: number
  saved: boolean
  records: TeacherAttendanceRecord[]
}
