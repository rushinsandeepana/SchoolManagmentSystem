import api from '../services/api'
import type { PageResponse } from '../types/paging'
import type { Teacher } from '../types/teacher'

export const periodApi = {
  getTeachers: () =>
    api.get<PageResponse<Teacher>>('/admin/teachers', {
      params: { page: 0, size: 100 },
    }),
  getTeacherSchedule: (teacherId: number | string) => api.get(`/admin/teachers/${teacherId}/schedule`),
  assign: (payload: Record<string, unknown>) => api.post('/admin/periods', payload),
}
