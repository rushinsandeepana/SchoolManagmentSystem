import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Footer from './Footer'

export default function Layout() {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const user = auth?.user
  const logout = auth?.logout
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links =
    user?.role === 'ADMIN'
      ? [
          { to: '/admin', label: t('nav.dashboard') },
          { to: '/admin/teachers', label: t('nav.teachers') },
          { to: '/admin/periods', label: t('nav.assignPeriods') },
          { to: '/admin/subjects', label: t('nav.subjects') },
          { to: '/admin/classes', label: t('nav.classes') },
          { to: '/notes', label: t('nav.notes') },
          { to: '/change-password', label: t('nav.changePassword') },
        ]
      : [
          { to: '/teacher', label: t('nav.mySchedule') },
          { to: '/notes', label: t('nav.notes') },
          { to: '/change-password', label: t('nav.changePassword') },
        ]

  const switchLang = (lng: string | undefined) => {
    if (!lng) return
    i18n.changeLanguage(lng)
    localStorage.setItem('lang', lng)
  }

  const onLogout = () => {
    logout?.()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-[10px] px-3.5 py-2.5 font-medium transition-colors ${
      isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-primary-soft hover:text-primary'
    }`

  return (
    <div className="flex min-h-screen flex-col md:grid md:h-screen md:grid-cols-[220px_1fr] md:grid-rows-[auto_1fr_auto] md:overflow-hidden">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-nav px-3 py-3 text-nav-text shadow-card sm:px-4 md:col-span-full">
        <div className="flex min-w-0 items-center gap-2">
          <button
            className="icon-btn shrink-0 md:hidden"
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <div className="truncate font-display text-base font-bold tracking-tight sm:text-lg">
            {t('app.name')}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button className="icon-btn text-xs sm:text-sm" type="button" onClick={toggleTheme}>
            {theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
          </button>
          <select
            aria-label={t('common.language')}
            value={i18n.language?.startsWith('si') ? 'si' : 'en'}
            onChange={(e) => switchLang(e.target.value)}
            className="w-auto rounded-[10px] border border-white/25 bg-transparent px-2 py-1.5 text-nav-text"
          >
            <option value="en">{t('common.english')}</option>
            <option value="si">{t('common.sinhala')}</option>
          </select>
          <button className="icon-btn text-xs sm:text-sm" type="button" onClick={onLogout}>
            {t('auth.logout')}
          </button>
        </div>
      </header>

      <nav
        className={`${
          menuOpen ? 'flex' : 'hidden'
        } flex-wrap gap-1.5 border-b border-border bg-surface p-2 md:hidden`}
      >
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={navLinkClass}
            onClick={() => setMenuOpen(false)}
            end={l.to === '/admin' || l.to === '/teacher'}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <aside className="hidden min-h-0 flex-col gap-1 overflow-y-auto border-r border-border bg-surface px-3 py-4 md:flex">
        <div className="mb-2 truncate px-3.5 text-sm text-muted">{user?.fullName}</div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={navLinkClass}
            end={l.to === '/admin' || l.to === '/teacher'}
          >
            {l.label}
          </NavLink>
        ))}
      </aside>

      <main className="fade-in min-h-0 overflow-y-auto mx-auto w-full max-w-[1100px] flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
