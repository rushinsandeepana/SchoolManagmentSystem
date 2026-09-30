import { ListQuery, PageResponse } from "../types/paging";
import { CreateTeacherTimetableSlotRequest, TeacherTimetable, UpdateTeacherTimetableSlotRequest } from "../types/period";
import api from '../services/api'


export const teacherTimetableApi = {
  /**
   * Get all teacher timetable records.
   */
  list: (
    params?: ListQuery,
  ) =>
    api.get<PageResponse<TeacherTimetable>>(
      '/admin/timetables',
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          search:
            params?.search || undefined,
        },
      },
    ),

  /**
   * Get the fixed weekly timetable of a teacher.
   */
  getTimetable: (
    teacherId: number | string,
  ) =>
    api.get<TeacherTimetable[]>(
      `/admin/teachers/${teacherId}/timetable`,
    ),

  /**
   * Add a period to the teacher's weekly timetable.
   */
  create: (
    payload: CreateTeacherTimetableSlotRequest,
  ) =>
    api.post<TeacherTimetable>(
      '/admin/timetables',
      payload,
    ),

  /**
   * Update an existing timetable period.
   */
  update: (
    id: number,
    payload: UpdateTeacherTimetableSlotRequest,
  ) =>
    api.patch<TeacherTimetable>(
      `/admin/timetables/${id}`,
      payload,
    ),

  /**
   * Delete an existing timetable period.
   */
  remove: (id: number) =>
    api.delete(
      `/admin/timetables/teacher/${id}`,
    ),
}