import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { orderService } from '@services/orderService'
import { useAuthStore } from '@/store/authStore'

function fmt(n) {
  return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

const STATUS_LABEL = {
  confirmed: 'Confirmado',
  shipped:   'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

function StatusBadge({ status }) {
  const colors = {
    confirmed: 'border-gold/50 text-gold',
    shipped:   'border-blue-400/50 text-blue-400',
    delivered: 'border-green-400/50 text-green-400',
    cancelled: 'border-red-400/50 text-red-400',
  }
  return (
    <span className={`text-[10px] tracking-[0.2em] uppercase border px-2 py-0.5 ${colors[status] ?? 'border-muted text-muted'}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

export function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    orderService.getById(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id, user, navigate])

  if (loading) return (
    <div className="min-h-screen bg-theme flex items-center justify-center">
      <p className="text-muted text-sm font-light">Carregando pedido...</p>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-theme flex flex-col items-center justify-center gap-4">
      <p className="text-muted text-sm">Pedido não encontrado</p>
      <Link to="/pedidos" className="text-xs text-gold underline underline-offset-4">Ver meus pedidos</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 bg-theme min-h-screen text-theme transition-colors duration-200">
      {/* Sucesso */}
      <div className="flex items-center gap-3 mb-8 text-gold">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-light tracking-[0.1em]">Pedido confirmado!</span>
      </div>

      <p className="text-xs tracking-[0.4em] uppercase text-muted mb-2">Pedido #{order.id}</p>
      <h1 className="text-3xl sm:text-4xl font-light mb-2 text-theme" style={{ fontFamily: 'var(--font-display, serif)' }}>
        Resumo
      </h1>
      <div className="flex items-center gap-3 mb-10">
        <StatusBadge status={order.status} />
        <span className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
      </div>

      {/* Itens */}
      <div className="space-y-3 mb-8">
        {(order.items || []).map((item, i) => (
          <div key={i} className="flex gap-4 border border-theme p-3 bg-surface">
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="w-14 h-14 object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gold tracking-[0.2em] uppercase">{item.brand}</p>
              <p className="text-sm font-light text-theme truncate">{item.title}</p>
              <p className="text-sm text-muted">{fmt(item.price)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Endereço e totais */}
      <div className="border border-theme p-4 mb-4">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-2">Endereço de entrega</p>
        <p className="text-sm font-light text-theme whitespace-pre-wrap">{order.address}</p>
      </div>

      <div className="bg-surface border border-theme p-5 space-y-2 mb-8">
        <div className="flex justify-between text-sm font-light">
          <span className="text-muted">Envio</span>
          <span className={Number(order.shipping) === 0 ? 'text-gold' : ''}>
            {Number(order.shipping) === 0 ? 'Grátis' : fmt(order.shipping)}
          </span>
        </div>
        <div className="flex justify-between font-medium pt-2 border-t border-theme">
          <span>Total</span>
          <span className="text-gold text-xl" style={{ fontFamily: 'var(--font-display, serif)' }}>{fmt(order.total)}</span>
        </div>
      </div>

      <Link to="/pedidos" className="text-[10px] tracking-[0.3em] uppercase text-muted hover:text-gold transition-colors underline underline-offset-4">
        ← Ver todos os pedidos
      </Link>
    </div>
  )
}

export default function Orders() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    orderService.getAll().then(setOrders).finally(() => setLoading(false))
  }, [user, navigate])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 bg-theme min-h-screen text-theme transition-colors duration-200">
      <p className="text-xs tracking-[0.4em] uppercase text-muted mb-2">Histórico</p>
      <h1 className="text-4xl sm:text-5xl font-light mb-10 text-theme" style={{ fontFamily: 'var(--font-display, serif)' }}>
        Meus pedidos
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-surface animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-theme py-24 flex flex-col items-center justify-center gap-4">
          <p className="text-sm font-light text-muted">Você não tem pedidos ainda</p>
          <Link to="/catalogo" className="text-xs tracking-[0.25em] uppercase text-gold hover:text-theme transition-colors underline underline-offset-4">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/pedidos/${order.id}`}
              className="flex items-start gap-4 border border-theme p-5 bg-surface hover:border-gold/50 transition-colors duration-300 rounded-sm"
            >
              {order.items?.[0]?.image_url && (
                <img src={order.items[0].image_url} alt="" className="w-14 h-14 object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-xs text-muted font-light">Pedido #{order.id}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm font-light text-theme truncate">
                  {order.items?.map(i => i.title).join(', ') || '—'}
                </p>
                <p className="text-xs text-muted mt-1">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <p className="text-base font-light text-gold whitespace-nowrap" style={{ fontFamily: 'var(--font-display, serif)' }}>
                {fmt(order.total)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
