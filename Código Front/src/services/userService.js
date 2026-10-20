import api from './api'

export const userService = {
  async getPublicProfile(id) {
    const { data } = await api.get(`/users/${id}`)
    return data
  },

  async deleteMe() {
    await api.delete('/users/me')
  },
}
