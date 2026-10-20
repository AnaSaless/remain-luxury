import { useThemeStore } from '@/store/themeStore'

export default function ThemeToggle() {
  const { toggle, isDark } = useThemeStore()

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className="relative w-8 h-8 flex items-center justify-center text-muted hover:text-gold transition-colors duration-200 focus-visible:outline-gold"
    >
      {isDark ? (
        /* Sol */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="5"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
          <line x1="2" y1="12" x2="5" y2="12"/>
          <line x1="19" y1="12" x2="22" y2="12"/>
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        /* Lua */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
        </svg>
      )}
    </button>
  )
}
