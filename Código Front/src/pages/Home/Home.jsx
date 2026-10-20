import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '@components/features/ProductCard'
import { productService } from '@services/productService'
import { useFadeIn } from '@/hooks/useFadeIn'

const HERO_REVEALED_KEY = 'ml-hero-revealed'

const categories = [
  {
    label: 'Bolsas',
    slug:  'bolsas',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=750&fit=crop&q=80',
  },
  {
    label: 'Roupas',
    slug:  'roupas',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=750&fit=crop&q=80',
  },
  {
    label: 'Sapatos',
    slug:  'sapatos',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=750&fit=crop&q=80',
  },
  {
    label: 'Acessórios',
    slug:  'acessorios',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=750&fit=crop&q=80',
  },
]


export default function Home() {
  const [featured, setFeatured] = useState([])
  const [heroRevealed, setHeroRevealed] = useState(false)
  const heroRef  = useFadeIn('fade-in')
  const catsRef  = useFadeIn()
  const featRef  = useFadeIn()
  const quoteRef = useFadeIn()

  useEffect(() => {
    productService.getFeatured()
      .then(data => setFeatured(Array.isArray(data) ? data : []))
      .catch(() => setFeatured([]))
    // Anima apenas no primeiro carregamento da sessão
    const alreadySeen = sessionStorage.getItem(HERO_REVEALED_KEY)
    if (!alreadySeen) {
      sessionStorage.setItem(HERO_REVEALED_KEY, '1')
      // Pequeno delay para garantir que o DOM está pronto
      const t = setTimeout(() => setHeroRevealed(true), 50)
      return () => clearTimeout(t)
    } else {
      setHeroRevealed(true)
    }
  }, [])

  return (
    <div className="bg-theme text-theme transition-colors duration-200">

      {/* ══════════════════════════════════════
          HERO
          ══════════════════════════════════════ */}
      <section className="min-h-[90vh] grid grid-cols-1 lg:grid-cols-2 relative">

        {/* Gradiente dourado como overlay sobre o hero inteiro
            começa ~32% (abaixo do botão Vender) e vai até a borda direita */}
        <div
          className="absolute inset-0 pointer-events-none hidden lg:block"
          style={{
            background: `linear-gradient(to right,
              transparent 0%,
              transparent 32%,
              color-mix(in srgb, var(--gold) 20%, var(--bg)) 44%,
              color-mix(in srgb, var(--gold) 42%, var(--bg)) 60%,
              color-mix(in srgb, var(--gold) 36%, var(--bg)) 80%,
              color-mix(in srgb, var(--gold) 26%, var(--bg)) 100%
            )`,
          }}
        />

        {/* Texto */}
        <div ref={heroRef} className="relative z-10 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-24 lg:py-32">
          <p className="text-[10px] tracking-[0.5em] uppercase text-gold mb-10">
            Curadoria de luxo
          </p>
          <h1
            className="text-[clamp(3.5rem,7vw,8rem)] font-light leading-[1.0] tracking-[0.04em] uppercase mb-8"
            style={{ fontFamily: 'var(--font-display, serif)' }}
          >
            <span
              className={`hero-word block text-theme-80 ${heroRevealed ? 'revealed' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              Remaining
            </span>
            <span
              className={`hero-word block text-gold ${heroRevealed ? 'revealed' : ''}`}
              style={{ animationDelay: '0.6s' }}
            >
              Luxury
            </span>
          </h1>
          <p
            className={`hero-word text-sm text-muted font-light max-w-xs leading-loose mb-12 ${heroRevealed ? 'revealed' : ''}`}
            style={{ animationDelay: '1s' }}
          >
            Peças únicas de marcas premiadas. Autenticidade verificada, procedência garantida.
          </p>
          <div
            className={`hero-word flex flex-wrap gap-3 ${heroRevealed ? 'revealed' : ''}`}
            style={{ animationDelay: '1s', display: 'flex' }}
          >
            <Link to="/catalogo" className="btn-gold px-10 py-4 text-[10px] tracking-[0.35em] uppercase font-medium">
              Explorar catálogo
            </Link>
            <Link to="/vender" className="btn-outline px-10 py-4 text-[10px] tracking-[0.35em] uppercase font-light">
              Vender peça
            </Link>
          </div>
        </div>

        {/* Coluna direita — ocupa o espaço, o visual vem do overlay */}
        <div className="hidden lg:block" />
      </section>

      {/* ══════════════════════════════════════
          CATEGORIAS — grade 2×2 retangular
          ══════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-20 py-24 sm:py-32">
        <div ref={catsRef} className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-muted mb-3">Explorar por</p>
              <h2
                className="text-5xl sm:text-6xl font-light text-theme-80"
                style={{ fontFamily: 'var(--font-display, serif)' }}
              >
                Categorias
              </h2>
            </div>
            <Link to="/catalogo" className="hidden sm:block text-[10px] tracking-[0.3em] uppercase text-muted hover:text-gold transition-colors duration-200">
              Ver tudo →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/catalogo?categoria=${cat.slug}`}
                className="group relative aspect-[3/4] bg-surface block overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-[400ms]"
                style={{ borderRadius: '8px' }}
              >
                {/* Imagem com scale no hover */}
                <img
                  src={cat.image}
                  alt={cat.label}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=750&fit=crop&q=80' }}
                  className="absolute inset-0 w-full h-full object-cover will-change-transform group-hover:scale-[1.06]"
                  style={{ transition: 'transform 700ms cubic-bezier(0.25,0.46,0.45,0.94)' }}
                />

                {/* Overlay normal — from-black/50, cobre 50% inferior */}
                <div
                  className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-[400ms]"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }}
                />
                {/* Overlay hover — from-black/70, cobre 60% inferior */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}
                />

                {/* Nome centralizado na base */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                  <span
                    className="tracking-[0.4em] group-hover:tracking-[0.5em] group-hover:-translate-y-1 transition-[letter-spacing,transform] duration-[400ms] text-white"
                    style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 300 }}
                  >
                    {cat.label}
                  </span>
                </div>

                {/* Borda dourada visível só no hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[300ms] pointer-events-none"
                  style={{ border: '1px solid var(--gold)', borderRadius: '8px' }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DESTAQUES DA SEMANA
          ══════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="px-6 sm:px-12 lg:px-20 py-24 sm:py-32 bg-surface transition-colors duration-200">
          <div ref={featRef} className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-14">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-muted mb-3">Seleção</p>
                <h2
                  className="text-5xl sm:text-6xl font-light text-theme-80"
                  style={{ fontFamily: 'var(--font-display, serif)' }}
                >
                  Destaques
                </h2>
              </div>
              <Link to="/catalogo" className="hidden sm:block text-[10px] tracking-[0.3em] uppercase text-muted hover:text-gold transition-colors duration-200">
                Ver tudo →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
              {featured.map((p, i) => (
                <div
                  key={p.id}
                  className={i < 8 ? 'card-enter' : ''}
                  style={i < 8 ? { animationDelay: `${i * 80}ms` } : undefined}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          MANIFESTO
          ══════════════════════════════════════ */}
      <section className="px-6 sm:px-12 lg:px-20 py-32 sm:py-40">
        <div ref={quoteRef} className="max-w-2xl mx-auto text-center">
          <div className="w-px h-16 bg-gold/40 mx-auto mb-12" />
          <blockquote
            className="text-2xl sm:text-3xl lg:text-4xl font-light leading-[1.5] text-theme-80 italic"
            style={{ fontFamily: 'var(--font-display, serif)' }}
          >
            "Cada peça carrega uma história. Ao comprá-la, você continua esse legado."
          </blockquote>
          <div className="w-px h-16 bg-gold/40 mx-auto mt-12" />
        </div>
      </section>
    </div>
  )
}
