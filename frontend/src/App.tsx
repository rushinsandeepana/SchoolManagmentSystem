import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/dashboard/DashboardPage'
import TeachersPage from './pages/admin/teachers/TeachersPage'
import AssignPeriodsPage from './pages/admin/periods/AssignPeriodsPage'
import TeacherSchedulePage from './pages/teacher/schedule/TeacherSchedulePage'
import PeriodDetailPage from './pages/PeriodDetailPage'
import NotesPage from './pages/NotesPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import SubjectsPage from './pages/admin/subject/SubjectsPage'
import ClassesPage from './pages/admin/classes/ClassesPage'

function PrivateRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { t } = useTranslation()
  const auth = useAuth() as unknown as {
    user: { role: string } | null
    loading: boolean
  }
  const { user, loading } = auth
  if (loading) return <div className="page-center">{t('common.loading')}</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/teacher'} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route
          path="admin"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/teachers"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <TeachersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/subjects"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <SubjectsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/classes"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <ClassesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="admin/periods"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <AssignPeriodsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="teacher"
          element={
            <PrivateRoute roles={['TEACHER']}>
              <TeacherSchedulePage />
            </PrivateRoute>
          }
        />
        <Route path="periods/:id" element={<PeriodDetailPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function HomeRedirect() {
  const { user } = useAuth() as unknown as {
    user: { role: string } | null
  }
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/teacher'} replace />
}
