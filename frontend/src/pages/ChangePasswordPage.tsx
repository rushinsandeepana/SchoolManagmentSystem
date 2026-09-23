import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { Button, InputField } from '../components/ui'

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
          <InputField
            label={t('auth.currentPassword')}
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder={t('auth.placeholders.currentPassword')}
            title={t('validation.currentPasswordRequired')}
            autoComplete="current-password"
            required
          />
          <InputField
            label={t('auth.newPassword')}
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder={t('auth.placeholders.newPassword')}
            title={t('validation.newPasswordRequired')}
            autoComplete="new-password"
            required
            minLength={4}
          />
          <Button type="submit" className="w-full sm:w-auto">
            {t('common.save')}
          </Button>
        </form>
      </div>
    </div>
  )
}
