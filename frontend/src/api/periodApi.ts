import api from '../services/api'
import type { ListQuery, PageResponse } from '../types/paging'
import type { PeriodSlot, PeriodType } from '../types/period'

export const periodApi = {
  // getTeachers: () =>
  //   api.get<PageResponse<Teacher>>('/admin/teachers', {
  //     params: { page: 0, size: 100 },
  //   }),
  getTeachers: () => api.get('/admin/all/teachers'),
  getAllAssignments: (params?: ListQuery & { periodType?: PeriodType }) =>
    api.get<PageResponse<PeriodSlot>>('/admin/periods', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        search: params?.search || undefined,
        periodType: params?.periodType || undefined,
      },
    }),
  getTeacherSchedule: (teacherId: number | string) => api.get(`/admin/teachers/${teacherId}/schedule`),
  assign: (payload: Record<string, unknown>) => api.post('/admin/periods', payload),
  delete: (assignmentId: number) => api.delete(`/admin/periods/${assignmentId}`),
}
