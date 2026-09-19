import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

export default function ChangePasswordPage() {
  const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      setMessage(t('passwordChanged'))
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(err.response?.data?.message || 'Error')
    }
  }

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1>{t('changePassword')}</h1>
      </div>
      {message && <div className="alert alert-ok">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card" style={{ maxWidth: 420 }}>
        <form className="form" onSubmit={onSubmit}>
          <label>
            {t('currentPassword')}
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label>
            {t('newPassword')}
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={4} />
          </label>
          <button className="btn" type="submit">
            {t('save')}
          </button>
        </form>
      </div>
    </div>
  )
}
