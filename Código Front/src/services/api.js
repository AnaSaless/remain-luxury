import axios from 'axios'
import env from '@/config/environment'

const api = axios.create({ baseURL: env.apiUrl })

// Adiciona o token JWT em todas as requisições automaticamente
api.interceptors.request.use(config => {
  const stored = localStorage.getItem('moda-luxo-auth')
  if (stored) {
    const { state } = JSON.parse(stored)
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
  }
  return config
})

export default api
