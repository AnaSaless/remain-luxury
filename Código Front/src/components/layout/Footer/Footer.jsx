import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'

const links = [
  { label: 'Explorar', to: '/catalogo' },
  { label: 'Vender', to: '/vender' },
  { label: 'Meu Perfil', to: '/perfil' },
  { label: 'Carrinho', to: '/carrinho' },
]

export default function Footer() {
  return (
    <footer className="border-t border-theme bg-surface transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Marca */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <img src={logo} alt="Moda Luxo" className="h-7 w-7 opacity-80" />
            <span className="text-sm tracking-[0.35em] uppercase text-theme" style={{ fontFamily: 'var(--font-display, serif)' }}>
              Moda Luxo
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed font-light max-w-xs">
            Curadoria de peças de luxo pré-amadas.<br />
            Sustentabilidade com sofisticação.
          </p>
        </div>

        {/* Navegação */}
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-6">Navegação</p>
          <ul className="space-y-3">
            {links.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="text-xs font-light text-muted hover:text-theme transition-colors duration-200">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contato */}
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-6">Suporte</p>
          <ul className="space-y-3 text-xs font-light text-muted">
            <li>contato@modaluxo.com.br</li>
            <li>Segunda a Sexta, 9h–18h</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-theme text-center py-5">
        <p className="text-xs text-muted tracking-wider">
          © {new Date().getFullYear()} Moda Luxo · Todos os direitos reservados
        </p>
      </div>
    </footer>
  )
}
