import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'
import { useThemeStore } from '@/store/themeStore'

export default function Layout() {
  const { theme } = useThemeStore()

  // Sincroniza data-theme no html ao montar / mudar tema
  useEffect(() => {
    const resolved = theme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', resolved)
  }, [theme])

  return (
    <div className="min-h-screen flex flex-col bg-theme transition-colors duration-200">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
