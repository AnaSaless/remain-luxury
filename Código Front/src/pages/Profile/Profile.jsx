import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { productService } from '@services/productService'
import { favoriteService } from '@services/favoriteService'
import { reviewService } from '@services/reviewService'
import { orderService } from '@services/orderService'
import { userService } from '@services/userService'
import { BRANDS, CATEGORIES, CONDITIONS } from '@/data/products'
import api from '@services/api'
import { resolveImageUrl } from '@utils/resolveImageUrl'
import Spinner from '@components/common/Spinner'

const SIZES = ['PP','P','M','G','GG','34','35','36','37','38','39','40','41','42','Único']

function Avatar({ name }) {
  const initials = name ? name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : '?'
  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gold bg-surface flex items-center justify-center flex-shrink-0"
      style={{ fontFamily: 'var(--font-display, serif)' }}>
      <span className="text-gold text-xl sm:text-2xl font-light tracking-wider">{initials}</span>
    </div>
  )
}

function Stars({ rating }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= rating ? 'var(--gold)' : 'none'} stroke="var(--gold)" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

const inputClass = 'w-full border-b border-theme bg-transparent py-3 text-sm font-light text-theme outline-none focus:border-gold transition-colors placeholder:text-muted/40'
const selectClass = 'w-full border-b border-theme bg-theme py-3 text-sm font-light text-theme outline-none focus:border-gold transition-colors appearance-none cursor-pointer'

function EditModal({ item, onClose, onSaved }) {
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    title: item.title, brand: item.brand, category: item.category,
    size: item.size, condition: item.condition, price: item.price, description: item.description || '',
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState(item.images || [])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function addFiles(files) {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
    const combined = [...imageFiles, ...valid].slice(0, 5)
    setImageFiles(combined)
    setImagePreviews(combined.map(f => URL.createObjectURL(f)))
  }

  function removeImage(i) {
    if (imageFiles.length > 0) {
      URL.revokeObjectURL(imagePreviews[i])
      const files = imageFiles.filter((_, x) => x !== i)
      setImageFiles(files)
      setImagePreviews(files.map(f => URL.createObjectURL(f)))
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      imageFiles.forEach(f => fd.append('images', f))
      const updated = await productService.update(item.id, fd)
      onSaved(updated)
    } catch (e) {
      setErr(e.response?.data?.message ?? 'Erro ao salvar')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-theme border border-theme w-full max-w-lg my-4 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-theme">
          <h2 className="text-lg font-light text-theme" style={{ fontFamily: 'var(--font-display, serif)' }}>Editar peça</h2>
          <button onClick={onClose} className="text-muted hover:text-theme transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">Fotos</label>
            <div className="grid grid-cols-5 gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative aspect-square group">
                  <img src={resolveImageUrl(src)} alt="" className="w-full h-full object-cover border border-theme" />
                  {imageFiles.length > 0 && (
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-square border border-dashed border-theme hover:border-gold flex items-center justify-center text-muted hover:text-gold transition-colors text-2xl font-thin">
                +
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
            {imageFiles.length > 0 && <p className="text-[10px] text-muted mt-1">Novas fotos substituirão as atuais ao salvar.</p>}
          </div>

          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">Título</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className={inputClass} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">Marca</label>
              <select value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))} className={selectClass}>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                <option value="Outra">Outra marca</option>
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">Categoria</label>
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={selectClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">Tamanho</label>
              <select value={form.size} onChange={e => setForm(f => ({...f, size: e.target.value}))} className={selectClass}>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">Condição</label>
              <select value={form.condition} onChange={e => setForm(f => ({...f, condition: e.target.value}))} className={selectClass}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">Preço (R$)</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} className={inputClass} required />
          </div>

          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={4}
              className="w-full border border-theme bg-transparent p-4 text-sm font-light text-theme outline-none focus:border-gold transition-colors resize-none placeholder:text-muted/40" />
          </div>

          {err && <p className="text-xs text-red-400">{err}</p>}

          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-theme text-[10px] tracking-[0.25em] uppercase text-muted hover:border-gold hover:text-gold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-gold py-3 text-[10px] tracking-[0.25em] uppercase font-medium disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StarPicker({ value, onChange }) {
  const [hov, setHov] = useState(0)
  return (
    <span className="flex gap-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24"
          fill={(hov || value) >= i ? 'var(--gold)' : 'none'}
          stroke="var(--gold)" strokeWidth="1.5"
          onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(0)}
          onClick={() => onChange(i)}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

function ReviewItem({ review: r, isOwn, onUpdated, onDeleted }) {
  const [editing, setEditing]       = useState(false)
  const [editRating, setEditRating] = useState(r.rating)
  const [editComment, setEditComment] = useState(r.comment || '')
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr]         = useState('')

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
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Stars rating={r.rating} />
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
                  {deleting ? <Spinner size={12} /> : 'Excluir'}
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

function ReviewsList({ reviews, currentUserId, setReviews }) {
  function handleUpdated(updated) {
    setReviews(prev => {
      const list = prev.reviews.map(x => x.id === updated.id ? updated : x)
      const avg  = list.reduce((s, x) => s + x.rating, 0) / list.length
      return { ...prev, reviews: list, average: Number(avg.toFixed(1)) }
    })
  }
  function handleDeleted(id) {
    setReviews(prev => {
      const list = prev.reviews.filter(x => x.id !== id)
      const avg  = list.length ? list.reduce((s, x) => s + x.rating, 0) / list.length : null
      return { ...prev, reviews: list, count: prev.count - 1, average: list.length ? Number(avg.toFixed(1)) : null }
    })
  }
  return (
    <div>
      {reviews.average && (
        <div className="flex items-center gap-3 mb-8">
          <Stars rating={Math.round(reviews.average)} />
          <span className="text-2xl font-light text-gold" style={{ fontFamily: 'var(--font-display, serif)' }}>{reviews.average}</span>
          <span className="text-sm text-muted font-light">({reviews.count} avaliações)</span>
        </div>
      )}
      {reviews.reviews.length === 0 ? (
        <p className="text-sm font-light text-muted py-12 text-center">Nenhuma avaliação ainda.</p>
      ) : (
        <div className="space-y-6">
          {reviews.reviews.map(r => (
            <ReviewItem
              key={r.id}
              review={r}
              isOwn={currentUserId && r.reviewer_id === currentUserId}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Perfil público (outro usuário) ────────────────────────────────────────────
function PublicProfile({ profileId }) {
  const { user: currentUser } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState({ average: null, count: 0, reviews: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('listings')

  useEffect(() => {
    Promise.all([
      userService.getPublicProfile(profileId),
      reviewService.getBySeller(profileId).catch(() => ({ average: null, count: 0, reviews: [] })),
    ]).then(([p, r]) => {
      setProfile(p)
      setReviews(r)
    }).finally(() => setLoading(false))
  }, [profileId])

  if (loading) return (
    <div className="min-h-screen bg-theme flex items-center justify-center">
      <p className="text-muted text-sm font-light">Carregando...</p>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-theme flex items-center justify-center">
      <p className="text-muted text-sm">Usuário não encontrado</p>
    </div>
  )

  const listings = profile.listings || []

  return (
    <div className="bg-theme min-h-screen text-theme transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        <div className="bg-surface border border-theme p-6 sm:p-10 mb-8 sm:mb-10 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 mb-8">
            <Avatar name={profile.name} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-light text-theme" style={{ fontFamily: 'var(--font-display, serif)' }}>
                  {profile.name}
                </h1>
                {profile.verified === 1 && (
                  <span className="border border-gold/60 text-gold text-[10px] tracking-[0.25em] uppercase px-3 py-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1"/>
                      <path d="M3 5l1.5 1.5L7 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Vendedora verificada
                  </span>
                )}
              </div>
              <p className="text-xs text-muted font-light mb-4">
                📍 {profile.location || 'Brasil'} · Membro desde {profile.member_since}
              </p>
              {profile.bio && <p className="text-sm text-theme-80 font-light leading-relaxed max-w-2xl">{profile.bio}</p>}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-gold/30 via-gold/60 to-gold/30 mb-8" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { value: listings.length, label: 'Anúncios' },
              { value: reviews.average ? `${reviews.average} ★` : '—', label: 'Avaliação' },
              { value: reviews.count, label: 'Avaliações' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center py-2">
                <p className="text-2xl sm:text-3xl font-light text-gold mb-1" style={{ fontFamily: 'var(--font-display, serif)' }}>{value}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-theme mb-8">
          {[
            { key: 'listings', label: `Anúncios (${listings.length})` },
            { key: 'reviews',  label: `Avaliações (${reviews.count})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-[10px] tracking-[0.3em] uppercase pb-4 transition-colors font-light border-b-2 -mb-px ${
                activeTab === tab.key ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-theme'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'listings' && (
          listings.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-5">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted opacity-40">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <p className="text-sm font-light text-muted">Você ainda não publicou nenhuma peça</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {listings.map((item, i) => (
                <Link key={item.id} to={`/produto/${item.id}`}
                  className={`group bg-surface border border-theme hover:border-gold/40 transition-all duration-300 rounded-xl flex flex-col ${i < 8 ? 'card-enter' : ''}`}
                  style={i < 8 ? { animationDelay: `${i * 80}ms` } : undefined}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={resolveImageUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x750/0d0d0d/ac872a?text=${encodeURIComponent(item.brand?.[0] ?? '·')}` }} />
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">{item.brand}</p>
                    <p className="text-sm font-light text-theme truncate" style={{ fontFamily: 'var(--font-display, serif)' }}>{item.title}</p>
                    <p className="text-xs text-muted mt-2">
                      {Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === 'reviews' && (
          <ReviewsList reviews={reviews} currentUserId={currentUser?.id ?? null} setReviews={setReviews} />
        )}
      </div>
    </div>
  )
}

// ── Perfil próprio ────────────────────────────────────────────────────────────
export default function Profile() {
  const { id: paramId } = useParams()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Se tem :id e é diferente do usuário logado → perfil público
  if (paramId && (!user || Number(paramId) !== user.id)) {
    return <PublicProfile profileId={paramId} />
  }

  return <OwnProfile user={user} logout={logout} navigate={navigate} />
}

function OwnProfile({ user, logout, navigate }) {
  const [listings, setListings]           = useState([])
  const [favorites, setFavorites]         = useState([])
  const [reviews, setReviews]             = useState({ average: null, count: 0, reviews: [] })
  const [activeTab, setActiveTab]         = useState('listings')
  const [editItem, setEditItem]           = useState(null)
  const [deletingId, setDeletingId]       = useState(null)
  const [verifying, setVerifying]         = useState(false)
  const [verifyMsg, setVerifyMsg]         = useState('')
  const [menuOpen, setMenuOpen]           = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  const [orders, setOrders]               = useState([])
  const [ordersLoaded, setOrdersLoaded]   = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const menuRef  = useRef(null)
  const clearCart = useCartStore(s => s.clearCart)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    productService.getByUser(user.id).then(data => setListings(Array.isArray(data) ? data : [])).catch(() => setListings([]))
    favoriteService.getAll().then(data => setFavorites(Array.isArray(data) ? data : [])).catch(() => setFavorites([]))
    reviewService.getBySeller(user.id).then(setReviews).catch(() => {})
  }, [user, navigate])

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!user) return null

  const stats = user.stats ?? { anuncios: 0, vendas: 0, avaliacao: 0, resposta: 0 }

  async function handleDelete(id) {
    if (!confirm('Remover este anúncio?')) return
    setDeletingId(id)
    try {
      await productService.remove(id)
      setListings(prev => prev.filter(p => p.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  function handleSaved(updated) {
    setListings(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditItem(null)
  }

  async function requestVerification() {
    setVerifying(true)
    try {
      await api.post('/auth/request-verification')
      setVerifyMsg('Solicitação enviada! Aguarde a aprovação.')
    } catch (e) {
      setVerifyMsg(e.response?.data?.message ?? 'Erro ao solicitar')
    } finally {
      setVerifying(false)
    }
  }

  function toggleSection(section) {
    setMenuOpen(false)
    if (section === 'orders' && !ordersLoaded) {
      setOrdersLoading(true)
      orderService.getAll()
        .then(data => { setOrders(data); setOrdersLoaded(true) })
        .catch(() => {})
        .finally(() => setOrdersLoading(false))
    }
    setActiveSection(prev => prev === section ? null : section)
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await userService.deleteMe()
      clearCart()
      logout()
      navigate('/')
    } catch {
      setDeleting(false)
    }
  }

  const verificationStatus = user.verificationStatus || 'none'

  return (
    <div className="bg-theme min-h-screen text-theme transition-colors duration-200">
      {editItem && <EditModal item={editItem} onClose={() => setEditItem(null)} onSaved={handleSaved} />}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-theme border border-theme w-full max-w-sm p-8 rounded-2xl">
            <h2 className="text-xl font-light text-theme mb-4" style={{ fontFamily: 'var(--font-display, serif)' }}>
              Excluir conta
            </h2>
            <p className="text-sm font-light text-muted leading-relaxed mb-8">
              Tem certeza que deseja excluir sua conta? Todos os seus anúncios e dados serão removidos permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-theme text-[10px] tracking-[0.25em] uppercase text-muted hover:border-gold hover:text-gold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 border border-red-400/60 text-[10px] tracking-[0.25em] uppercase text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
              >
                {deleting ? <><Spinner size={12} /> Excluindo...</> : 'Excluir minha conta'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Card de perfil ── */}
        <div className="bg-surface border border-theme p-6 sm:p-10 mb-8 sm:mb-10 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 mb-8">
            <Avatar name={user.name} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-light text-theme" style={{ fontFamily: 'var(--font-display, serif)' }}>
                  {user.name}
                </h1>
                {user.verified && (
                  <span className="border border-gold/60 text-gold text-[10px] tracking-[0.25em] uppercase px-3 py-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1"/>
                      <path d="M3 5l1.5 1.5L7 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Vendedora verificada
                  </span>
                )}
                {!user.verified && verificationStatus === 'pending' && (
                  <span className="border border-muted/40 text-muted text-[10px] tracking-[0.2em] uppercase px-3 py-1">
                    Verificação pendente
                  </span>
                )}
              </div>
              <p className="text-xs text-muted font-light mb-4">
                📍 {user.location || 'Brasil'} · Membro desde {user.memberSince}
              </p>
              {user.bio && <p className="text-sm text-theme-80 font-light leading-relaxed max-w-2xl">{user.bio}</p>}
              {!user.verified && verificationStatus === 'none' && (
                <button
                  onClick={requestVerification}
                  disabled={verifying}
                  className="mt-4 text-[10px] tracking-[0.25em] uppercase border border-theme hover:border-gold text-muted hover:text-gold px-4 py-2 transition-colors disabled:opacity-50"
                >
                  {verifying ? 'Solicitando...' : 'Solicitar verificação'}
                </button>
              )}
              {verifyMsg && <p className="mt-2 text-xs text-gold font-light">{verifyMsg}</p>}
            </div>

            {/* Menu + Sair */}
            <div className="flex items-center gap-4 self-start">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  aria-label="Menu"
                  className="text-muted hover:text-theme transition-colors text-base leading-none tracking-widest"
                >
                  ···
                </button>
                <div className={`menu-dropdown absolute right-0 top-full mt-2 z-20 min-w-[180px] bg-[var(--surface)] border border-theme py-1 shadow-lg ${menuOpen ? 'open' : ''}`}>
                  {[
                    { key: 'favorites', label: 'Favoritos' },
                    { key: 'orders',    label: 'Minhas compras' },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => toggleSection(item.key)}
                      className={`w-full text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-light transition-colors ${
                        activeSection === item.key ? 'text-gold' : 'text-muted hover:text-theme'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-theme my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); setShowDeleteModal(true) }}
                    className="w-full text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-light text-red-400 hover:text-red-300 transition-colors"
                  >
                    Excluir perfil
                  </button>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/') }}
                className="text-[10px] tracking-[0.25em] uppercase text-muted hover:text-theme transition-colors"
              >
                Sair
              </button>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-gold/30 via-gold/60 to-gold/30 mb-8" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: listings.length || stats.anuncios, label: 'Anúncios' },
              { value: stats.vendas, label: 'Vendas' },
              { value: reviews.average ? `${reviews.average} ★` : (stats.avaliacao > 0 ? `${stats.avaliacao} ★` : '—'), label: 'Avaliação' },
              { value: favorites.length, label: 'Salvos' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center py-2">
                <p className="text-2xl sm:text-3xl font-light text-gold mb-1" style={{ fontFamily: 'var(--font-display, serif)' }}>{value}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Seção Favoritos ── */}
        <div className={`accordion-body ${activeSection === 'favorites' ? 'open' : ''}`}>
          <div className="bg-surface border border-theme p-6 sm:p-8 mb-8 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Favoritos</p>
              <button onClick={() => setActiveSection(null)} className="text-muted hover:text-theme transition-colors text-xs">✕</button>
            </div>
            {favorites.length === 0 ? (
              <p className="text-sm font-light text-muted py-8 text-center">Você ainda não favoritou nenhuma peça</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {favorites.map(item => (
                  <div key={item.id} className="group relative card-hover">
                    <Link to={`/produto/${item.id}`} className="block">
                      <div className="aspect-[3/4] overflow-hidden bg-surface border border-theme">
                        <img src={resolveImageUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x750/0d0d0d/ac872a?text=${encodeURIComponent(item.brand?.[0] ?? '·')}` }} />
                      </div>
                      <div className="pt-3">
                        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">{item.brand}</p>
                        <p className="text-sm font-light text-theme truncate" style={{ fontFamily: 'var(--font-display, serif)' }}>{item.title}</p>
                        <p className="text-xs text-muted mt-1">
                          {Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={async () => {
                        await favoriteService.remove(item.id).catch(() => {})
                        setFavorites(prev => prev.filter(f => f.id !== item.id))
                      }}
                      aria-label="Remover dos favoritos"
                      className="absolute top-2 right-2 p-1.5 bg-black/40 text-gold hover:text-red-400 transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Seção Minhas compras ── */}
        <div className={`accordion-body ${activeSection === 'orders' ? 'open' : ''}`}>
          <div className="bg-surface border border-theme p-6 sm:p-8 mb-8 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Minhas compras</p>
              <button onClick={() => setActiveSection(null)} className="text-muted hover:text-theme transition-colors text-xs">✕</button>
            </div>
            {ordersLoading ? (
              <p className="text-sm font-light text-muted py-8 text-center">Carregando...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm font-light text-muted py-8 text-center">Você ainda não realizou nenhuma compra</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-theme p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-0.5">Pedido #{order.id}</p>
                        <p className="text-xs text-muted font-light">
                          {new Date(order.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-light text-gold">
                          {Number(order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-[10px] tracking-widest uppercase text-muted mt-0.5">{order.status}</p>
                      </div>
                    </div>
                    <div className="space-y-1 mb-4">
                      {(order.items || []).map((item, i) => (
                        <p key={i} className="text-xs font-light text-theme/80">
                          {item.title} — <span className="text-muted">{item.brand}</span>
                        </p>
                      ))}
                    </div>
                    <Link to={`/pedidos/${order.id}`}
                      className="text-[10px] tracking-[0.25em] uppercase text-gold hover:text-theme transition-colors">
                      Ver detalhes →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-8 border-b border-theme mb-8">
          {[
            { key: 'listings', label: `Anúncios (${listings.length})` },
            { key: 'reviews',  label: `Avaliações (${reviews.count})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-[10px] tracking-[0.3em] uppercase pb-4 transition-colors font-light border-b-2 -mb-px ${
                activeTab === tab.key ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-theme'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex-1 flex justify-end items-center pb-4">
            <Link to="/vender" className="btn-gold text-[10px] tracking-[0.3em] uppercase px-4 py-2 font-medium">
              + Publicar
            </Link>
          </div>
        </div>

        {activeTab === 'listings' && (
          listings.length === 0 ? (
            <div className="border border-dashed border-theme py-20 text-center">
              <p className="text-sm font-light text-muted mb-4">Você ainda não tem peças à venda</p>
              <Link to="/vender" className="text-xs tracking-[0.25em] uppercase text-gold underline underline-offset-4 hover:text-theme transition-colors">
                Publicar primeira peça
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {listings.map(item => (
                <div key={item.id} className="group bg-surface border border-theme hover:border-gold/40 transition-all duration-300 rounded-xl flex flex-col">
                  <Link to={`/produto/${item.id}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={resolveImageUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x750/0d0d0d/ac872a?text=${encodeURIComponent(item.brand?.[0] ?? '·')}` }} />
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-1">{item.brand}</p>
                      <p className="text-sm font-light text-theme truncate" style={{ fontFamily: 'var(--font-display, serif)' }}>
                        {item.title}
                      </p>
                      <p className="text-xs text-muted mt-2">
                        {Number(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  </Link>
                  <div className="mt-auto flex border-t border-theme">
                    <button
                      onClick={() => setEditItem(item)}
                      className="flex-1 py-2.5 text-[10px] tracking-[0.2em] uppercase text-muted hover:text-gold transition-colors border-r border-theme"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="flex-1 py-2.5 text-[10px] tracking-[0.2em] uppercase text-muted hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      {deletingId === item.id ? <Spinner size={12} /> : 'Remover'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'reviews' && (
          <ReviewsList reviews={reviews} currentUserId={null} setReviews={setReviews} />
        )}
      </div>
    </div>
  )
}
