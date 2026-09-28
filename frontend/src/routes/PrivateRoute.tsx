import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles?: string[]
}) {
  const { t } = useTranslation()
  const auth = useAuth() as unknown as {
    user: { role: string } | null
    loading: boolean
  }
  const { user, loading } = auth

  if (loading) return <div className="page-center">{t('common.loading')}</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate to={user.role === 'ADMIN' ? '/admin' : '/teacher'} replace />
    )
  }

  return children
}
