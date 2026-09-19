import api from '../services/api'
import type { ListQuery, PageResponse } from '../types/paging'
import type { Teacher } from '../types/teacher'

export const teacherApi = {
  list: (params?: ListQuery) =>
    api.get<PageResponse<Teacher>>('/admin/teachers', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        search: params?.search || undefined,
      },
    }),
  listAll: () =>
    api.get<PageResponse<Teacher>>('/admin/teachers', {
      params: { page: 0, size: 100 },
    }),
  create: (payload: Record<string, unknown>) => api.post('/admin/teachers', payload),
  update: (id: number, payload: Record<string, unknown>) => api.put(`/admin/teachers/${id}`, payload),
  remove: (id: number) => api.delete(`/admin/teachers/${id}`),
  getMySchedule: () => api.get('/teacher/schedule'),
}
