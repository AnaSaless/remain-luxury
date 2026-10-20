import env from '@/config/environment'

const backendOrigin = env.apiUrl.replace(/\/api\/?$/, '')

export function resolveImageUrl(path) {
  if (!path) return path
  return /^(https?:|blob:|data:)/.test(path) ? path : `${backendOrigin}${path}`
}
