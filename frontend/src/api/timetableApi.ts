import api from '../services/api'
import type { ListQuery, PageResponse } from '../types/paging'
import type {
  PeriodSlot,
  PeriodType,
  TeacherTimetable,
  CreateTeacherTimetableSlotRequest,
  UpdateTeacherTimetableSlotRequest,
} from '../types/period'

export const periodApi = {
  getTeachers: () => api.get('/admin/all/teachers'),

  getAllAssignments: (
    params?: ListQuery & { periodType?: PeriodType }
  ) =>
    api.get<PageResponse<PeriodSlot>>('/admin/periods', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        search: params?.search || undefined,
        periodType: params?.periodType || undefined,
      },
    }),

  getTeacherSchedule: (
    teacherId: number | string
  ) =>
    api.get(`/admin/teachers/${teacherId}/schedule`),

  assign: (payload: Record<string, unknown>) =>
    api.post('/admin/periods', payload),

  delete: (assignmentId: number) =>
    api.delete(`/admin/periods/${assignmentId}`),
}


/* =========================================================
   Fixed Weekly Teacher Timetable API
   ========================================================= */

export const teacherTimetableApi = {

  /**
   * Get the fixed weekly timetable of a teacher.
   */
  getTimetable: (teacherId: number | string) =>
    api.get<TeacherTimetable[]>(
      `/admin/teachers/${teacherId}/timetable`
    ),

  /**
   * Add a period to the teacher's weekly timetable.
   */
  create: (
    payload: CreateTeacherTimetableSlotRequest
  ) =>
    api.post<TeacherTimetable>(
      '/admin/teacher-timetable',
      payload
    ),

  /**
   * Update an existing timetable period.
   */
  update: (
    id: number,
    payload: UpdateTeacherTimetableSlotRequest
  ) =>
    api.put<TeacherTimetable>(
      `/admin/teacher-timetable/${id}`,
      payload
    ),

  /**
   * Delete a timetable period.
   */
  delete: (id: number) =>
    api.delete(
      `/admin/teacher-timetable/${id}`
    ),
}