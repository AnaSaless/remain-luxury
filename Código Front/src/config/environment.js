const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  appName: import.meta.env.VITE_APP_NAME,
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isProduction: import.meta.env.VITE_ENV === 'production',
}

export default env
