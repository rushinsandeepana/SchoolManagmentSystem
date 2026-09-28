import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getNavBarItems } from '../navigation/navBarItems'
import Footer from './Footer'
import { Button, IconButton, SelectControl } from './ui'

export default function Layout() {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const user = auth?.user
  const logout = auth?.logout
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = getNavBarItems(user?.role, t)

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
    `flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 pl-5 font-medium transition-colors ${
      isActive
        ? 'bg-primary-soft text-primary'
        : 'text-muted hover:bg-primary-soft hover:text-primary'
    }`

  return (
    <div className="flex min-h-screen flex-col md:grid md:h-screen md:grid-cols-[220px_1fr] md:grid-rows-[auto_1fr_auto] md:overflow-hidden">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-nav px-3 py-3 text-nav-text shadow-card sm:px-4 md:col-span-full">
        <div className="flex min-w-0 items-center gap-2">
          <IconButton
            className="shrink-0 md:hidden"
            label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </IconButton>

          <div className="truncate font-display text-base font-bold tracking-tight sm:text-lg">
            {t('app.name')}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <IconButton
            label={
              theme === 'light'
                ? t('common.darkMode')
                : t('common.lightMode')
            }
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            )}
          </IconButton>

          <SelectControl
            aria-label={t('common.language')}
            value={i18n.language?.startsWith('si') ? 'si' : 'en'}
            onChange={(e: { target: { value: string | undefined } }) =>
              switchLang(e.target.value)
            }
            className="w-auto rounded-[10px] border border-white/25 bg-transparent px-2 py-1.5 text-nav-text"
            options={[
              { value: 'en', label: t('common.english') },
              { value: 'si', label: t('common.sinhala') },
            ]}
          />

          <Button variant="nav" size="sm" onClick={onLogout}>
            {t('auth.logout')}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[280px] max-w-[85vw] transform overflow-y-auto border-r border-border bg-surface px-3 py-4 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="mb-3 flex items-center justify-between px-3.5">
          <div className="min-w-0">
            <div className="truncate font-display text-base font-bold text-primary">
              {t('app.name')}
            </div>

            <div className="mt-1 truncate text-sm text-muted">
              {user?.fullName}
            </div>
          </div>

          <IconButton
            label="Close menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <hr className="mb-3 border-1 border-slate-400 dark:border-slate-700" />

        {/* Navigation */}
        {links.map((group, index) => (
          <div key={group.header}>
            <div className="mb-3">
              <div className="px-3.5 pb-1.5 pt-2 text-xs font-bold uppercase tracking-wide text-muted">
                {group.header}
              </div>

              <div className="flex flex-col gap-1">
                {group.items.map((l) => {
                  const Icon = l.icon

                  return (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={navLinkClass}
                      onClick={() => setMenuOpen(false)}
                      end={l.to === '/admin' || l.to === '/teacher'}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{l.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>

            {/* Section Divider */}
            {index < links.length - 1 && (
              <hr className="my-3 border-0 border-t border-border" />
            )}
          </div>
        ))}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden min-h-0 flex-col gap-1 overflow-y-auto border-r border-border bg-surface px-3 py-4 md:flex">
        <div className="mb-2 truncate px-3.5 text-sm text-muted">
          {user?.fullName}
        </div>

        <hr className="border-1 border-slate-400 dark:border-slate-700" />

        {links.map((group) => (
          <div key={group.header} className="mb-3">
            <div className="px-3.5 pb-1.5 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
              {group.header}
            </div>

            <div className="flex flex-col gap-1">
              {group.items.map((l) => {
                const Icon = l.icon

                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={navLinkClass}
                    end={l.to === '/admin' || l.to === '/teacher'}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{l.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </aside>

      <main className="fade-in min-h-0 overflow-y-auto mx-auto w-full max-w-[1100px] flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
