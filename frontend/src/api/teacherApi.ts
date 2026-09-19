import api from '../services/api'

export const teacherApi = {
  list: () => api.get('/admin/teachers'),
  create: (payload: Record<string, unknown>) => api.post('/admin/teachers', payload),
  update: (id: number, payload: Record<string, unknown>) => api.put(`/admin/teachers/${id}`, payload),
  remove: (id: number) => api.delete(`/admin/teachers/${id}`),
  getMySchedule: () => api.get('/teacher/schedule'),
}
