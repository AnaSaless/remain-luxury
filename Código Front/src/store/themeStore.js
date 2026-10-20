import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: null, // null = usar preferência do sistema

      setTheme(theme) {
        set({ theme })
        document.documentElement.setAttribute('data-theme', theme)
      },

      toggle() {
        const current = get().theme ||
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        get().setTheme(current === 'dark' ? 'light' : 'dark')
      },

      get isDark() {
        const t = get().theme
        if (t) return t === 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      },
    }),
    { name: 'moda-luxo-theme' }
  )
)
