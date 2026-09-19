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
      setError(t('loginError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page-body">
        <div className="login-card">
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <button className="btn btn-outline btn-sm" type="button" onClick={toggleTheme}>
              {theme === 'light' ? t('darkMode') : t('lightMode')}
            </button>
            <select
              value={i18n.language?.startsWith('si') ? 'si' : 'en'}
              onChange={(e) => {
                i18n.changeLanguage(e.target.value)
                localStorage.setItem('lang', e.target.value)
              }}
              style={{ width: 'auto' }}
            >
              <option value="en">{t('english')}</option>
              <option value="si">{t('sinhala')}</option>
            </select>
          </div>
          <div className="brand-lg">{t('appName')}</div>
          <p className="muted">{t('tagline')}</p>
          <h2 style={{ marginTop: '1.25rem' }}>{t('loginTitle')}</h2>
          <p className="muted">{t('loginSubtitle')}</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form className="form" onSubmit={onSubmit}>
            <label>
              {t('username')}
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </label>
            <label>
              {t('password')}
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </label>
            <button className="btn" type="submit" disabled={busy}>
              {t('login')}
            </button>
          </form>
          <p className="muted" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
            {t('demoAccounts')}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
