import api from '../services/api'
import { Subject } from '../types/subject';

export const subjectApi = {
  list: (query: { page?: number; size?: number; search?: string } = {}) =>
    api.get('/admin/subjects', { params: query }),
  create: (payload: Record<string, unknown>) => api.post('/admin/subjects', payload),
  update: (id: number, payload: Record<string, unknown>) => api.put(`/admin/subjects/${id}`, payload),
  remove: (id: number) => api.delete(`/admin/subjects/${id}`),
  getMySchedule: () => api.get('/subject/schedule'),
  getAllSubjects: () => api.get('/admin/subjects/all'),
  getSubjectsByTeacher: (teacherId: number) => api.get<Subject[]>(`/admin/subjects/${teacherId}/teacher-subjects`,),
}
