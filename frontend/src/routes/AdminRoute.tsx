import { Outlet } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'

export default function AdminRoute() {
  return (
    <PrivateRoute roles={['ADMIN']}>
      <Outlet />
    </PrivateRoute>
  )
}