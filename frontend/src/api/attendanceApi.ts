import api from '../services/api'
import type {
  DailyTeacherAttendance,
  TeacherAttendanceException,
  TeacherAttendanceRecord,
} from '../types/attendance'

export const attendanceApi = {
  getDaily: (date: string) =>
    api.get<DailyTeacherAttendance>('/admin/attendance/daily', {
      params: { date },
    }),

  saveDaily: (payload: {
    date: string
    exceptions?: TeacherAttendanceException[]
    records?: Array<{ teacherId: number; status: string; remark?: string }>
  }) => api.post<DailyTeacherAttendance>('/admin/attendance/save', payload),

  getRange: (startDate: string, endDate: string, teacherId?: number) =>
    api.get<TeacherAttendanceRecord[]>('/admin/attendance/range', {
      params: { startDate, endDate, teacherId },
    }),

  exportDaily: (date: string) =>
    api.get('/admin/attendance/export', {
      params: { date },
      responseType: 'blob',
    }),

  exportRange: (startDate: string, endDate: string) =>
    api.get('/admin/attendance/export', {
      params: { startDate, endDate },
      responseType: 'blob',
    }),
}
