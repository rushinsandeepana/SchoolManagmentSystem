import { Outlet } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'

export default function TeacherRoute() {
  return (
    <PrivateRoute roles={['TEACHER']}>
      <Outlet />
    </PrivateRoute>
  )
}