import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Footer from '../components/Footer'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const { user, login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/teacher'} replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = await login(username.trim(), password)
      navigate(u.role === 'ADMIN' ? '/admin' : '/teacher')
    } catch {
      setError(t('auth.loginError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: 'var(--hero-grad)' }}
    >
      <div className="grid flex-1 place-items-center p-4 sm:p-6">
        <div className="fade-in w-full max-w-[420px] rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7">
          <div className="mb-3 flex flex-wrap justify-end gap-2">
            <button className="btn btn-outline btn-sm" type="button" onClick={toggleTheme}>
              {theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
            </button>
            <select
              value={i18n.language?.startsWith('si') ? 'si' : 'en'}
              onChange={(e) => {
                i18n.changeLanguage(e.target.value)
                localStorage.setItem('lang', e.target.value)
              }}
              className="w-auto"
            >
              <option value="en">{t('common.english')}</option>
              <option value="si">{t('common.sinhala')}</option>
            </select>
          </div>
          <div className="font-display text-[clamp(1.6rem,5vw,2rem)] font-bold leading-tight">
            {t('app.name')}
          </div>
          <p className="muted">{t('app.tagline')}</p>
          <h2 className="mt-5">{t('auth.loginTitle')}</h2>
          <p className="muted">{t('auth.loginSubtitle')}</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form className="form" onSubmit={onSubmit}>
            <label>
              {t('auth.username')}<span className="required-mark"> *</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.placeholders.username')}
                title={t('validation.usernameRequired')}
                autoComplete="username"
                required
              />
            </label>
            <label>
              {t('auth.password')}<span className="required-mark"> *</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.placeholders.password')}
                title={t('validation.passwordRequired')}
                autoComplete="current-password"
                required
              />
            </label>
            <button className="btn w-full sm:w-auto" type="submit" disabled={busy}>
              {t('auth.login')}
            </button>
          </form>
          <p className="mt-4 text-xs text-muted">{t('auth.demoAccounts')}</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
