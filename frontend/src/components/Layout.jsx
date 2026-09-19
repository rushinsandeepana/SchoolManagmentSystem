import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Footer from './Footer'

export default function Layout() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links =
    user?.role === 'ADMIN'
      ? [
          { to: '/admin', label: t('dashboard') },
          { to: '/admin/teachers', label: t('teachers') },
          { to: '/admin/periods', label: t('assignPeriods') },
          { to: '/notes', label: t('notes') },
          { to: '/change-password', label: t('changePassword') },
        ]
      : [
          { to: '/teacher', label: t('mySchedule') },
          { to: '/notes', label: t('notes') },
          { to: '/change-password', label: t('changePassword') },
        ]

  const switchLang = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('lang', lng)
  }

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="icon-btn menu-toggle" type="button" onClick={() => setMenuOpen((v) => !v)}>
            ☰
          </button>
          <div className="brand">{t('appName')}</div>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn" type="button" onClick={toggleTheme}>
            {theme === 'light' ? t('darkMode') : t('lightMode')}
          </button>
          <select
            aria-label={t('language')}
            value={i18n.language?.startsWith('si') ? 'si' : 'en'}
            onChange={(e) => switchLang(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.5rem', background: 'transparent', color: 'inherit', borderColor: 'rgba(255,255,255,0.25)' }}
          >
            <option value="en">{t('english')}</option>
            <option value="si">{t('sinhala')}</option>
          </select>
          <button className="icon-btn" type="button" onClick={onLogout}>
            {t('logout')}
          </button>
        </div>
      </header>

      <nav className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)} end={l.to === '/admin' || l.to === '/teacher'}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <aside className="side-nav">
        <div className="muted" style={{ padding: '0.35rem 0.85rem', marginBottom: '0.5rem' }}>
          {user?.fullName}
        </div>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end={l.to === '/admin' || l.to === '/teacher'}>
            {l.label}
          </NavLink>
        ))}
      </aside>

      <main className="main fade-in">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
