import api from './api'

export const conversationService = {
  async create(sellerId, productId) {
    const { data } = await api.post('/conversations', { seller_id: sellerId, product_id: productId })
    return data
  },
  async getAll() {
    const { data } = await api.get('/conversations')
    return data
  },
  async getMessages(conversationId) {
    const { data } = await api.get(`/conversations/${conversationId}/messages`)
    return data
  },
  async sendMessage(conversationId, text) {
    const { data } = await api.post(`/conversations/${conversationId}/messages`, { text })
    return data
  },
}
