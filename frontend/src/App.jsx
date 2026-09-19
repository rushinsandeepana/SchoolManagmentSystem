import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import TeachersPage from './pages/admin/TeachersPage'
import AssignPeriodsPage from './pages/admin/AssignPeriodsPage'
import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage'
import PeriodDetailPage from './pages/PeriodDetailPage'
import NotesPage from './pages/NotesPage'
import ChangePasswordPage from './pages/ChangePasswordPage'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-center">Loading...</div>
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
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/teacher'} replace />
}
