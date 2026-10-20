import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ProductCard from '@components/features/ProductCard/ProductCard'
import { productService } from '@services/productService'
import { favoriteService } from '@services/favoriteService'
import { reviewService } from '@services/reviewService'
import { conversationService } from '@services/conversationService'
import { resolveImageUrl } from '@utils/resolveImageUrl'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { clsx } from 'clsx'
import Spinner from '@components/common/Spinner'

const CATEGORY_LABEL = {
  bolsas: 'Bolsas', sapatos: 'Sapatos', roupas: 'Roupas', acessorios: 'Acessórios',
}


function Stars({ rating, size = 14 }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} estrelas`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rating ? 'var(--gold)' : 'none'}
          stroke="var(--gold)" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

function StarPicker({ value, onChange }) {
  const [hov, setHov] = useState(0)
  return (
    <span className="flex gap-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24"
          fill={(hov || value) >= i ? 'var(--gold)' : 'none'}
          stroke="var(--gold)" strokeWidth="1.5"
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(0)}
          onClick={() => onChange(i)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

function ReviewItem({ review: r, isOwn, onUpdated, onDeleted }) {
  const [editing, setEditing]   = useState(false)
  const [editRating, setEditRating] = useState(r.rating)
  const [editComment, setEditComment] = useState(r.comment || '')
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr]           = useState('')

  async function handleSave() {
    setSaving(true)
    setErr('')
    try {
      const updated = await reviewService.update(r.id, { rating: editRating, comment: editComment })
      onUpdated(updated)
      setEditing(false)
    } catch (e) {
      setErr(e.response?.data?.message ?? 'Erro ao salvar avaliação')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Excluir esta avaliação?')) return
    setDeleting(true)
    try {
      await reviewService.remove(r.id)
      onDeleted(r.id)
    } catch (e) {
      setErr(e.response?.data?.message ?? 'Erro ao excluir avaliação')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="border-b border-theme pb-6">
      {editing ? (
        <div className="space-y-3">
          <StarPicker value={editRating} onChange={setEditRating} />
          <textarea
            value={editComment}
            onChange={e => setEditComment(e.target.value)}
            rows={3}
            className="w-full border border-theme bg-transparent p-3 text-sm font-light text-theme outline-none focus:border-gold transition-colors resize-none placeholder:text-muted/40"
          />
          {err && <p className="text-xs text-red-400">{err}</p>}
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="btn-gold px-5 py-2 text-[10px] tracking-[0.25em] uppercase font-medium disabled:opacity-50">
              {saving ? '...' : 'Salvar'}
            </button>
            <button onClick={() => { setEditing(false); setErr('') }}
              className="px-5 py-2 border border-theme text-[10px] tracking-[0.25em] uppercase text-muted hover:text-theme transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-2">
            <Stars rating={r.rating} size={13} />
            <span className="text-xs text-muted font-light">{r.reviewer_name}</span>
            <span className="text-[10px] text-muted/60">{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
            {isOwn && (
              <span className="ml-auto flex gap-3">
                <button onClick={() => setEditing(true)}
                  className="text-[10px] tracking-widest uppercase text-muted hover:text-gold transition-colors">
                  Editar
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="text-[10px] tracking-widest uppercase text-muted hover:text-red-400 transition-colors disabled:opacity-40">
                  {deleting ? '...' : 'Excluir'}
                </button>
              </span>
            )}
          </div>
          {r.comment && <p className="text-sm font-light text-theme-80 leading-relaxed">{r.comment}</p>}
          {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
        </>
      )}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [activeImg, setActiveImg] = useState(0)
  const [favorited, setFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [reviews, setReviews]   = useState({ average: null, count: 0, reviews: [] })
  const [related, setRelated]   = useState([])
  const [rating, setRating]     = useState(0)
  const [comment, setComment]   = useState('')
  const [reviewErr, setReviewErr] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [chatOpen, setChatOpen]       = useState(false)
  const [chatText, setChatText]       = useState('')
  const [sendingChat, setSendingChat] = useState(false)
  const [justAdded, setJustAdded]     = useState(false)

  const addItem = useCartStore(s => s.addItem)
  const inCart  = useCartStore(s => s.items.some(i => i.id === id))
  const { user } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    setActiveImg(0)
    setRelated([])
    productService.getById(id)
      .then(p => {
        setProduct(p)
        return Promise.all([
          reviewService.getBySeller(p.seller_id ?? p.sellerId),
          productService.getRelated(id),
        ])
      })
      .then(([rev, rel]) => {
        setReviews(rev)
        setRelated(rel)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || !product) return
    favoriteService.check(id).then(r => setFavorited(r.favorited)).catch(() => {})
  }, [id, user, product])

  async function toggleFavorite() {
    if (!user) { navigate('/login'); return }
    setFavLoading(true)
    try {
      if (favorited) {
        await favoriteService.remove(id)
        setFavorited(false)
      } else {
        await favoriteService.add(id)
        setFavorited(true)
      }
    } finally {
      setFavLoading(false)
    }
  }

  function openChat() {
    if (!user) { navigate('/login'); return }
    setChatOpen(true)
  }

  async function sendFirstMessage() {
    if (!chatText.trim()) return
    setSendingChat(true)
    try {
      const conv = await conversationService.create(product.seller_id ?? product.sellerId, Number(id))
      await conversationService.sendMessage(conv.id, chatText.trim())
      navigate(`/mensagens?conv=${conv.id}`)
    } catch {
      setSendingChat(false)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!rating) { setReviewErr('Selecione uma nota'); return }
    setReviewErr('')
    setSubmittingReview(true)
    try {
      const r = await reviewService.create({
        seller_id: product.seller_id ?? product.sellerId,
        product_id: Number(id),
        rating,
        comment,
      })
      setReviews(prev => ({
        reviews: [r, ...prev.reviews],
        count: prev.count + 1,
        average: prev.average
          ? Number(((prev.average * prev.count + rating) / (prev.count + 1)).toFixed(1))
          : rating,
      }))
      setRating(0)
      setComment('')
    } catch (err) {
      setReviewErr(err.response?.data?.message ?? 'Erro ao enviar avaliação')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-theme px-6 sm:px-12 lg:px-20 py-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16">
        <div className="shimmer aspect-[3/4]" />
        <div className="space-y-6 py-4">
          <div className="h-2 shimmer w-24" />
          <div className="h-10 shimmer w-3/4" />
          <div className="h-8 shimmer w-1/3" />
        </div>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen bg-theme flex flex-col items-center justify-center gap-6">
      <p className="text-muted text-sm">{error ?? 'Produto não encontrado'}</p>
      <Link to="/catalogo" className="text-[10px] tracking-[0.3em] uppercase text-gold hover:text-theme transition-colors underline underline-offset-4">
        Voltar ao catálogo
      </Link>
    </div>
  )

  const sellerId   = product.seller_id ?? product.sellerId
  const isSeller   = user && user.id === sellerId
  const canReview  = user && !isSeller

  const details = [
    ['Marca',     product.brand],
    ['Categoria', CATEGORY_LABEL[product.category] ?? product.category],
    ['Tamanho',   product.size],
    ['Condição',  product.condition],
    ['Vendedor',  product.sellerName, `/perfil/${sellerId}`],
  ]

  return (
    <div className="bg-theme min-h-screen text-theme transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-12 sm:py-20">

        <Link to="/catalogo"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-muted hover:text-gold transition-colors duration-200 mb-14">
          ← Catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20">

          {/* ── Imagem ── */}
          <div className="space-y-3">
            <div className="relative overflow-hidden aspect-[3/4] cursor-zoom-in">
              <img
                src={resolveImageUrl(product.images[activeImg])}
                alt={product.title}
                loading="eager"
                decoding="async"
                onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x750/0d0d0d/ac872a?text=${encodeURIComponent(product.brand?.[0] ?? '·')}` }}
                onLoad={e => e.target.classList.add('loaded')}
                className="img-blur w-full h-full object-cover scale-[1.1] will-change-transform"
                style={{ transition: 'opacity 0.3s ease' }}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={clsx(
                      'w-16 aspect-square overflow-hidden flex-shrink-0 transition-all duration-200',
                      activeImg === i ? 'ring-1 ring-[var(--gold)]' : 'opacity-50 hover:opacity-100'
                    )}
                  >
                    <img src={resolveImageUrl(src)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col lg:py-4">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">{product.brand}</p>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-light text-theme leading-[1.0] mb-4"
              style={{ fontFamily: 'var(--font-display, serif)' }}
            >
              {product.title}
            </h1>
            <p className="text-3xl font-light text-gold mb-2" style={{ fontFamily: 'var(--font-display, serif)' }}>
              {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
            </p>

            {/* Média de avaliações inline */}
            {reviews.average && (
              <div className="flex items-center gap-2 mb-8">
                <Stars rating={Math.round(reviews.average)} />
                <span className="text-xs text-muted font-light">{reviews.average} ({reviews.count})</span>
              </div>
            )}
            {!reviews.average && <div className="mb-8" />}

            <p className="text-sm text-muted font-light leading-loose mb-10">{product.description}</p>

            <div className="space-y-0 mb-10">
              {details.map(([label, value, href]) => (
                <div key={label} className="flex justify-between border-b border-theme py-3.5 text-sm">
                  <span className="text-muted font-light">{label}</span>
                  {href ? (
                    <Link to={href} className="font-light text-gold hover:text-theme transition-colors duration-200">
                      {value}
                    </Link>
                  ) : (
                    <span className="font-light text-theme capitalize">{value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-auto space-y-3">
              <button
                onClick={() => {
                  if (inCart) return
                  addItem(product)
                  setJustAdded(true)
                  setTimeout(() => setJustAdded(false), 1500)
                }}
                disabled={inCart}
                className={clsx(
                  'w-full py-4 text-[10px] tracking-[0.35em] uppercase transition-all duration-200',
                  inCart ? 'bg-surface-2 text-muted cursor-default border border-theme' : 'btn-gold font-medium'
                )}
              >
                {inCart ? (
                  <span>
                    <span className={justAdded ? 'check-pop' : ''}>✓</span>
                    {' '}Na bolsa
                  </span>
                ) : 'Adicionar à bolsa'}
              </button>

              {inCart && (
                <Link to="/carrinho" className="block text-center text-[10px] tracking-[0.3em] uppercase text-gold hover:text-theme transition-colors">
                  Ver bolsa →
                </Link>
              )}

              <div className="flex gap-3 pt-1">
                {/* Favorito */}
                <button
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className={clsx(
                    'flex-1 py-3 border border-theme text-[10px] tracking-[0.25em] uppercase transition-all duration-200 flex items-center justify-center gap-2',
                    favorited ? 'border-gold/60 text-gold' : 'text-muted hover:border-gold/40 hover:text-gold'
                  )}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {favorited ? 'Salvo' : 'Salvar'}
                </button>

                {/* Chat com vendedor */}
                {!isSeller && (
                  <button
                    onClick={openChat}
                    className="flex-1 py-3 border border-theme text-[10px] tracking-[0.25em] uppercase text-muted hover:border-gold/40 hover:text-gold transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Conversar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══ Avaliações ══ */}
        <div className="mt-24 border-t border-theme pt-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-muted mb-2">Vendedor</p>
              <h2 className="text-2xl font-light text-theme" style={{ fontFamily: 'var(--font-display, serif)' }}>
                Avaliações
                {reviews.average && (
                  <span className="text-gold ml-3 text-xl">{reviews.average} ★</span>
                )}
              </h2>
            </div>
          </div>

          {/* Formulário de avaliação */}
          {canReview && (
            <form onSubmit={submitReview} className="bg-surface border border-theme p-6 mb-10 space-y-4">
              <p className="text-xs tracking-[0.25em] uppercase text-muted">Deixar avaliação</p>
              <StarPicker value={rating} onChange={setRating} />
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="Compartilhe sua experiência com este vendedor..."
                className="w-full border border-theme bg-transparent p-3 text-sm font-light text-theme outline-none focus:border-gold transition-colors resize-none placeholder:text-muted/40"
              />
              {reviewErr && <p className="text-xs text-red-400">{reviewErr}</p>}
              <button
                type="submit"
                disabled={submittingReview}
                className="btn-gold px-8 py-3 text-[10px] tracking-[0.3em] uppercase font-medium disabled:opacity-50"
              >
                {submittingReview ? <><Spinner size={12} /> Enviando...</> : 'Publicar avaliação'}
              </button>
            </form>
          )}

          {/* Lista de avaliações */}
          {reviews.reviews.length === 0 ? (
            <p className="text-sm text-muted font-light">Nenhuma avaliação ainda.</p>
          ) : (
            <div className="space-y-6">
              {reviews.reviews.map(r => (
                <ReviewItem
                  key={r.id}
                  review={r}
                  isOwn={user && r.reviewer_id === user.id}
                  onUpdated={updated => setReviews(prev => {
                    const list = prev.reviews.map(x => x.id === updated.id ? updated : x)
                    const avg  = list.reduce((s, x) => s + x.rating, 0) / list.length
                    return { ...prev, reviews: list, average: Number(avg.toFixed(1)) }
                  })}
                  onDeleted={id => setReviews(prev => {
                    const list = prev.reviews.filter(x => x.id !== id)
                    const avg  = list.length ? list.reduce((s, x) => s + x.rating, 0) / list.length : null
                    return { ...prev, reviews: list, count: prev.count - 1, average: list.length ? Number(avg.toFixed(1)) : null }
                  })}
                />
              ))}
            </div>
          )}
        </div>
        {/* ══ Produtos relacionados ══ */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-theme pt-16">
            <h2 className="text-2xl font-light text-theme mb-10" style={{ fontFamily: 'var(--font-display, serif)' }}>
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal — escrever primeira mensagem antes de criar conversa */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => { setChatOpen(false); setChatText('') }}
          />
          <div className="relative z-10 w-full sm:max-w-md bg-surface border border-theme rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-1">Mensagem para</p>
                <p className="text-sm font-light text-theme">{product.sellerName}</p>
              </div>
              <button
                onClick={() => { setChatOpen(false); setChatText('') }}
                className="text-muted hover:text-theme transition-colors p-1"
                aria-label="Fechar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="text-xs text-muted font-light truncate">{product.title}</p>
            <textarea
              autoFocus
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              rows={4}
              placeholder="Escreva sua mensagem..."
              className="w-full border border-theme bg-transparent p-3 text-sm font-light text-theme outline-none focus:border-gold transition-colors resize-none placeholder:text-muted/40"
              onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') sendFirstMessage() }}
            />
            <div className="flex gap-3">
              <button
                onClick={sendFirstMessage}
                disabled={sendingChat || !chatText.trim()}
                className="btn-gold flex-1 py-3 text-[10px] tracking-[0.3em] uppercase font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingChat ? <Spinner size={12} /> : 'Enviar'}
              </button>
              <button
                onClick={() => { setChatOpen(false); setChatText('') }}
                className="py-3 px-5 border border-theme text-[10px] tracking-[0.25em] uppercase text-muted hover:text-theme transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
