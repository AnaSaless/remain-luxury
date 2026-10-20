import api from './api'

export const orderService = {
  async create(orderData) {
    const { data } = await api.post('/orders', orderData)
    return data
  },
  async getAll() {
    const { data } = await api.get('/orders')
    return data
  },
  async getById(id) {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },
}
