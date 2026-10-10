import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import LoginPage from '../pages/LoginPage'
import AdminDashboard from '../pages/admin/dashboard/DashboardPage'
import TeachersPage from '../pages/admin/teachers/TeachersPage'
import SubjectsPage from '../pages/admin/subject/SubjectsPage'
import ClassesPage from '../pages/admin/classes/ClassesPage'
import AssignPeriodsPage from '../pages/admin/periods/AssignPeriodsPage'
import TimetablesPage from '../pages/admin/timetable/TimetablesPage'
import TeacherAttendancePage from '../pages/admin/attendance/TeacherAttendancePage'
import TeacherSchedulePage from '../pages/teacher/schedule/TeacherSchedulePage'
import PeriodDetailPage from '../pages/PeriodDetailPage'
import PeriodDetailAddPage from '../pages/PeriodDetailAddPage'
import PeriodDetailEditPage from '../pages/PeriodDetailEditPage'
import NotesPage from '../pages/NotesPage'
import ChangePasswordPage from '../pages/ChangePasswordPage'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'
import TeacherRoute from './TeacherRoute'
import TimetableCreate from '../pages/admin/timetable/TimetableCreateModel'

function HomeRedirect() {
  const { user } = useAuth() as unknown as {
    user: { role: string } | null
  }

  if (!user) return <Navigate to="/login" replace />

  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/teacher'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<HomeRedirect />} />

        {/* ADMIN ROUTES */}
        <Route path="admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboard />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
          <Route path="periods" element={<AssignPeriodsPage />} />
          <Route path="timetables" element={<TimetablesPage />} />

          <Route path="teacher-timetable" element={<TimetablesPage />} />
          {/* <Route path="teacher-timetable/:id" element={<TeacherTimetableViewPage />} />
          <Route path="teacher-timetable/:id/edit" element={<TeacherTimetableEditPage />} /> */}
        </Route>

        {/* TEACHER ROUTES */}
        <Route path="teacher" element={<TeacherRoute />}>
          <Route index element={<TeacherSchedulePage />} />
        </Route>

        {/* COMMON AUTHENTICATED ROUTES */}
        <Route path="periods/:id" element={<PeriodDetailPage />} />
        <Route path="periods/:id/activity/new" element={<PeriodDetailAddPage />} />
        <Route path="periods/:id/activity/:contentId/edit" element={<PeriodDetailEditPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}