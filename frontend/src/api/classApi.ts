import api from '../services/api'
import type { ListQuery, PageResponse } from '../types/paging'
import type { SchoolClass } from '../types/class'

export const classApi = {
  list: (query: ListQuery) => api.get<PageResponse<SchoolClass>>('/admin/classes', { params: query }),
  create: (payload: Record<string, unknown>) => api.post('/admin/classes', payload),
  update: (id: number, payload: Record<string, unknown>) => api.put(`/admin/classes/${id}`, payload),
  remove: (id: number) => api.delete(`/admin/classes/${id}`),
  getAllClasses: () => api.get('/admin/classes/all'),
}
