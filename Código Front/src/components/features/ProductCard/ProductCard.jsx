import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { favoriteService } from '@services/favoriteService'
import { resolveImageUrl } from '@utils/resolveImageUrl'
import { clsx } from 'clsx'

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

export default function ProductCard({ product, aspectOverride, stretch }) {
  const [hovered, setHovered]       = useState(false)
  const [favorited, setFavorited]   = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [justAdded, setJustAdded]   = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const inCart  = useCartStore(s => s.items.some(i => i.id === product.id))
  const { user } = useAuthStore()
  const hasSecond = product.images.length > 1

  useEffect(() => {
    if (!user) return
    favoriteService.check(product.id).then(r => setFavorited(r.favorited)).catch(() => {})
  }, [product.id, user])

  async function toggleFavorite(e) {
    e.preventDefault()
    if (!user) return
    setFavLoading(true)
    try {
      if (favorited) {
        await favoriteService.remove(product.id)
        setFavorited(false)
      } else {
        await favoriteService.add(product.id)
        setFavorited(true)
      }
    } finally {
      setFavLoading(false)
    }
  }

  const price = Number(product.price).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: 0,
  })

  return (
    <article
      className={`group card-hover rounded-lg ${stretch ? 'lg:h-full lg:flex lg:flex-col' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Imagem ── */}
      <div
        className={`relative overflow-hidden bg-surface rounded-lg ${
          stretch
            ? 'aspect-[3/4] lg:aspect-auto lg:flex-1 lg:min-h-0'
            : (aspectOverride === '4/3' ? 'aspect-[4/3]' : 'aspect-[3/4]')
        }`}
      >
        <Link to={`/produto/${product.id}`} className="block w-full h-full">
          <img
            src={resolveImageUrl(product.images[0])}
            alt={product.title}
            loading="lazy"
            decoding="async"
            onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x750/0d0d0d/ac872a?text=${encodeURIComponent(product.brand?.[0] ?? '·')}` }}
            onLoad={e => e.target.classList.add('loaded')}
            className={clsx(
              'img-blur absolute inset-0 w-full h-full object-cover transition-all duration-700',
              hovered && hasSecond ? 'opacity-0' : 'opacity-100 group-hover:scale-[1.04]'
            )}
          />
          {hasSecond && (
            <img
              src={resolveImageUrl(product.images[1])}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x750/0d0d0d/ac872a?text=${encodeURIComponent(product.brand?.[0] ?? '·')}` }}
              className={clsx(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
                hovered ? 'opacity-100' : 'opacity-0'
              )}
            />
          )}
        </Link>

        {/* Botão de favorito */}
        {user && (
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            className={clsx(
              'absolute top-3 right-3 p-2 transition-all duration-200',
              favorited
                ? 'text-gold opacity-100'
                : 'text-white/70 opacity-0 group-hover:opacity-100 hover:text-gold'
            )}
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <HeartIcon filled={favorited} />
          </button>
        )}
      </div>

      {/* ── Info ── */}
      <div className="pt-4">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1.5">
          {product.brand}
        </p>

        <div className="flex items-baseline justify-between gap-3">
          <Link
            to={`/produto/${product.id}`}
            className="text-sm font-light text-theme hover:text-gold transition-colors duration-200 line-clamp-1"
            style={{ fontFamily: 'var(--font-display, serif)' }}
          >
            {product.title}
          </Link>
          <span
            className="text-sm font-light text-theme whitespace-nowrap flex-shrink-0"
            style={{ fontFamily: 'var(--font-display, serif)' }}
          >
            {price}
          </span>
        </div>

        <p className="text-[10px] text-muted uppercase tracking-wider mt-1">
          {product.condition} · Tam. {product.size}
        </p>

        {/* Botão aparece só no hover */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: hovered ? '3rem' : '0' }}
        >
          <button
            onClick={e => {
              e.preventDefault()
              if (inCart) return
              addItem(product)
              setJustAdded(true)
              setTimeout(() => setJustAdded(false), 1500)
            }}
            disabled={inCart}
            className={clsx(
              'mt-3 w-full py-2.5 text-[10px] tracking-[0.25em] uppercase transition-colors duration-200',
              inCart ? 'bg-surface-2 text-muted cursor-default' : 'btn-outline'
            )}
          >
            {inCart ? (
              <span>
                <span className={justAdded ? 'check-pop' : ''}>✓</span>
                {' '}Na bolsa
              </span>
            ) : 'Adicionar à bolsa'}
          </button>
        </div>
      </div>
    </article>
  )
}
