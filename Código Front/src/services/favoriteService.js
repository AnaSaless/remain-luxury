import api from './api'

export const favoriteService = {
  async add(productId) {
    const { data } = await api.post(`/favorites/${productId}`)
    return data
  },
  async remove(productId) {
    const { data } = await api.delete(`/favorites/${productId}`)
    return data
  },
  async check(productId) {
    const { data } = await api.get(`/favorites/${productId}/check`)
    return data
  },
  async getAll() {
    const { data } = await api.get('/favorites')
    return data
  },
}
