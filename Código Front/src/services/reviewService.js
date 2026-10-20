import api from './api'

export const reviewService = {
  async create(reviewData) {
    const { data } = await api.post('/reviews', reviewData)
    return data
  },
  async getBySeller(sellerId) {
    const { data } = await api.get(`/reviews/seller/${sellerId}`)
    return data
  },
  async update(id, { rating, comment }) {
    const { data } = await api.put(`/reviews/${id}`, { rating, comment })
    return data
  },
  async remove(id) {
    await api.delete(`/reviews/${id}`)
  },
}
