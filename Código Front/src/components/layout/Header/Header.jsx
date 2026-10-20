import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { conversationService } from '@services/conversationService'
import ThemeToggle from '@components/common/ThemeToggle'

const navLinks = [
  { to: '/catalogo', label: 'Explorar' },
  { to: '/vender', label: 'Vender' },
  { to: '/perfil', label: 'Perfil' },
]

export default function Header() {
  const cartCount = useCartStore(s => s.items.length)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hasConversations, setHasConversations] = useState(false)

  useEffect(() => {
    if (!user) { setHasConversations(false); return }
    conversationService.getAll()
      .then(convs => setHasConversations(convs.length > 0))
      .catch(() => {})
  }, [user])

  function handleLogout() {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-theme backdrop-blur-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0" onClick={() => setMobileOpen(false)}>
            <img src={logo} alt="Moda Luxo" className="h-7 w-7 sm:h-8 sm:w-8 opacity-90 group-hover:opacity-100 transition-opacity" />
            <span
              className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.35em] uppercase text-theme group-hover:text-gold transition-colors duration-300 hidden xs:block"
              style={{ fontFamily: 'var(--font-display, "Cormorant Garamond", serif)' }}
            >
              Moda Luxo
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-xs tracking-[0.25em] uppercase font-light relative transition-all duration-200 px-3 py-1.5 rounded-sm hover:-translate-y-0.5 active:translate-y-0 ${
                    isActive
                      ? 'text-gold bg-gold/10'
                      : 'text-muted hover:text-theme hover:bg-surface-2'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-gold" />}
                  </>
                )}
              </NavLink>
            ))}

            {user && (
              <NavLink
                to="/mensagens"
                className={({ isActive }) =>
                  `text-xs tracking-[0.25em] uppercase font-light relative transition-all duration-200 px-3 py-1.5 rounded-sm hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-gold bg-gold/10'
                      : 'text-muted hover:text-theme hover:bg-surface-2'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Mensagens
                    {hasConversations && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                    )}
                    {isActive && <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-gold" />}
                  </>
                )}
              </NavLink>
            )}

            <span className="text-theme opacity-10 text-lg font-thin select-none">|</span>

            <Link to="/carrinho" className="text-xs tracking-[0.25em] uppercase font-light text-muted hover:text-theme hover:bg-surface-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 px-3 py-1.5 rounded-sm">
              Bolsa{cartCount > 0 && <span className="ml-1 text-gold">({cartCount})</span>}
            </Link>

            {user ? (
              <button onClick={handleLogout} className="text-xs tracking-[0.25em] uppercase font-light text-gold hover:text-theme hover:bg-surface-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 px-3 py-1.5 rounded-sm">
                Sair
              </button>
            ) : (
              <Link to="/login" className="text-xs tracking-[0.25em] uppercase font-light text-gold hover:text-theme hover:bg-surface-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 px-3 py-1.5 rounded-sm">
                Entrar
              </Link>
            )}
          </nav>

          {/* Direita: toggle + hamburger mobile */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Carrinho mobile */}
            <Link to="/carrinho" className="md:hidden text-muted hover:text-gold transition-colors relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold text-on-gold text-[9px] flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-1 text-muted hover:text-gold transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu"
            >
              <span className={`block w-5 h-px bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-px bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-px bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile overlay */}
      <div className={`fixed inset-0 z-40 bg-surface transition-all duration-300 md:hidden flex flex-col ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="h-16" /> {/* espaço do header */}
        <nav className="flex flex-col items-center justify-center flex-1 gap-8 py-12">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `text-2xl tracking-[0.3em] uppercase font-light transition-colors duration-200 ${
                  isActive ? 'text-gold' : 'text-theme hover:text-gold'
                }`
              }
              style={{ fontFamily: 'var(--font-display, serif)' }}
            >
              {link.label}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/mensagens"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `text-2xl tracking-[0.3em] uppercase font-light transition-colors duration-200 flex items-center gap-3 ${
                  isActive ? 'text-gold' : 'text-theme hover:text-gold'
                }`
              }
              style={{ fontFamily: 'var(--font-display, serif)' }}
            >
              Mensagens
              {hasConversations && (
                <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
              )}
            </NavLink>
          )}
          <div className="h-px w-12 bg-border" />
          {user ? (
            <button onClick={handleLogout} className="text-sm tracking-[0.25em] uppercase text-muted hover:text-gold transition-colors">
              Sair
            </button>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm tracking-[0.25em] uppercase text-gold hover:text-theme transition-colors">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </>
  )
}
