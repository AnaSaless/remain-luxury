import api from './api'

export const productService = {
  async getAll(filters = {}) {
    const params = {}
    if (filters.category)  params.categoria = filters.category
    if (filters.brand)     params.marca     = filters.brand
    if (filters.condition) params.condicao  = filters.condition
    if (filters.search)    params.q         = filters.search
    if (filters.minPrice)  params.minPrice  = filters.minPrice
    if (filters.maxPrice)  params.maxPrice  = filters.maxPrice
    if (filters.orderBy)   params.orderBy   = filters.orderBy
    const { data } = await api.get('/products', { params })
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/products/${id}`)
    return data
  },

  async getFeatured() {
    const { data } = await api.get('/products/featured')
    return data
  },

  async getByUser(userId) {
    const { data } = await api.get(`/products/user/${userId}`)
    return data
  },

  async create(formData) {
    const { data } = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async update(id, formData) {
    const { data } = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async remove(id) {
    await api.delete(`/products/${id}`)
  },

  async getRelated(id) {
    const { data } = await api.get(`/products/${id}/related`)
    return data
  },
}
