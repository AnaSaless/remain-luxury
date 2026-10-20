import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@services/authService'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      async login(credentials) {
        set({ isLoading: true, error: null })
        try {
          const { user, token } = await authService.login(credentials)
          set({ user, token, isLoading: false })
          return true
        } catch (err) {
          const msg = err.response?.data?.message ?? err.message
          set({ error: msg, isLoading: false })
          return false
        }
      },

      async register(data) {
        set({ isLoading: true, error: null })
        try {
          const { user, token } = await authService.register(data)
          set({ user, token, isLoading: false })
          return true
        } catch (err) {
          const msg = err.response?.data?.message ?? err.message
          set({ error: msg, isLoading: false })
          return false
        }
      },

      logout() {
        set({ user: null, token: null, error: null })
      },

      clearError() {
        set({ error: null })
      },
    }),
    { name: 'moda-luxo-auth', partialize: state => ({ user: state.user, token: state.token }) }
  )
)
