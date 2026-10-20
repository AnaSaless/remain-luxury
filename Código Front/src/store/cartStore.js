import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem(product) {
        const existing = get().items.find(i => i.id === product.id)
        if (existing) return
        set(state => ({ items: [...state.items, { ...product, quantity: 1 }] }))
      },

      removeItem(id) {
        set(state => ({ items: state.items.filter(i => i.id !== id) }))
      },

      clearCart() {
        set({ items: [] })
      },

      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },

      get count() {
        return get().items.length
      },
    }),
    { name: 'moda-luxo-cart' }
  )
)
