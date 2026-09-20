import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function ChangePasswordPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const onSubmit = async (e: any) => {
    e.preventDefault()
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      showToast(t('auth.passwordChanged'), 'success')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error'), 'error')
    }
  }

  return (
    <div className="fade-in">
      <div className="section-head">
        <h1 className="text-2xl sm:text-3xl">{t('nav.changePassword')}</h1>
      </div>
      <div className="card w-full max-w-md">
        <form className="form" onSubmit={onSubmit}>
          <label>
            {t('auth.currentPassword')}<span className="required-mark"> *</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('auth.placeholders.currentPassword')}
              title={t('validation.currentPasswordRequired')}
              required
            />
          </label>
          <label>
            {t('auth.newPassword')}<span className="required-mark"> *</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.placeholders.newPassword')}
              title={t('validation.newPasswordRequired')}
              required
              minLength={4}
            />
          </label>
          <button className="btn w-full sm:w-auto" type="submit">
            {t('common.save')}
          </button>
        </form>
      </div>
    </div>
  )
}
