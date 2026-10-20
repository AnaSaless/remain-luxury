import { Link } from 'react-router-dom'
import { useFadeIn } from '@/hooks/useFadeIn'

export default function NotFound() {
  const ref = useFadeIn()
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 bg-theme transition-colors duration-200">
      <div ref={ref}>
        <p className="text-xs tracking-[0.4em] uppercase text-gold mb-6">Erro 404</p>
        <h1
          className="text-[clamp(4rem,12vw,10rem)] font-light leading-none text-theme opacity-10 mb-6 uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-display, serif)' }}
        >
          Oh.
        </h1>
        <p className="text-muted text-sm font-light mb-12 max-w-xs leading-relaxed">
          Esta página não existe ou foi removida.
        </p>
        <Link to="/" className="btn-outline inline-block px-10 py-4 text-xs tracking-[0.3em] uppercase font-light">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
