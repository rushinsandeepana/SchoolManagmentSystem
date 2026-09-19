import api from '../services/api'

export const periodApi = {
  getTeachers: () => api.get('/admin/teachers'),
  getTeacherSchedule: (teacherId: number | string) => api.get(`/admin/teachers/${teacherId}/schedule`),
  assign: (payload: Record<string, unknown>) => api.post('/admin/periods', payload),
}
