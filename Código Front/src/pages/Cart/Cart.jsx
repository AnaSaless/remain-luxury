import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { orderService } from '@services/orderService'
import { resolveImageUrl } from '@utils/resolveImageUrl'
import Spinner from '@components/common/Spinner'

const SHIPPING_FREE_ABOVE = 500
const SHIPPING_COST       = 39.90

function fmt(n) {
  return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

export default function Cart() {
  const { items, removeItem, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep]         = useState('cart')   // 'cart' | 'checkout' | 'confirm'
  const [address, setAddress]   = useState('')
  const [addrErr, setAddrErr]   = useState('')
  const [placing, setPlacing]   = useState(false)

  const subtotal = items.reduce((sum, i) => sum + Number(i.price), 0)
  const shipping = subtotal >= SHIPPING_FREE_ABOVE ? 0 : SHIPPING_COST
  const total    = subtotal + shipping

  async function placeOrder() {
    if (!address.trim()) { setAddrErr('Informe o endereço de entrega'); return }
    if (!user) { navigate('/login'); return }
    setAddrErr('')
    setPlacing(true)
    try {
      const order = await orderService.create({ items, address: address.trim(), total, shipping })
      clearCart()
      navigate(`/pedidos/${order.id}`)
    } catch (err) {
      setAddrErr(err.response?.data?.message ?? 'Erro ao finalizar pedido')
      setPlacing(false)
    }
  }

  if (items.length === 0 && step === 'cart') return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 bg-theme min-h-screen text-theme transition-colors duration-200">
      <p className="text-xs tracking-[0.4em] uppercase text-muted mb-2">Compras</p>
      <h1 className="text-5xl sm:text-6xl font-light mb-10 text-theme tracking-[0.04em]" style={{ fontFamily: 'var(--font-display, serif)' }}>
        Minha bolsa
      </h1>
      <div className="py-32 flex flex-col items-center justify-center gap-6">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted opacity-40">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <div className="text-center">
          <p className="text-xl font-light text-theme mb-2" style={{ fontFamily: 'var(--font-display, serif)' }}>Sua bolsa está vazia</p>
          <p className="text-sm font-light text-muted">Explore nosso catálogo e descubra peças únicas</p>
        </div>
        <Link to="/catalogo" className="btn-gold px-10 py-4 text-[10px] tracking-[0.35em] uppercase font-medium">
          Explorar catálogo
        </Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 bg-theme min-h-screen text-theme transition-colors duration-200">
      <p className="text-xs tracking-[0.4em] uppercase text-muted mb-2">Compras</p>
      <h1 className="text-5xl sm:text-6xl font-light mb-10 text-theme tracking-[0.04em]" style={{ fontFamily: 'var(--font-display, serif)' }}>
        {step === 'cart' ? 'Minha bolsa' : step === 'checkout' ? 'Entrega' : 'Confirmar pedido'}
      </h1>

      {/* Breadcrumb steps */}
      <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase mb-10">
        {['Bolsa', 'Entrega', 'Confirmar'].map((s, i) => {
          const stepKey = ['cart', 'checkout', 'confirm'][i]
          const active  = step === stepKey
          const done    = ['cart', 'checkout', 'confirm'].indexOf(step) > i
          return (
            <span key={s} className="flex items-center gap-3">
              {i > 0 && <span className="text-muted/40">—</span>}
              <span className={active ? 'text-gold' : done ? 'text-theme' : 'text-muted/40'}>{s}</span>
            </span>
          )
        })}
      </div>

      {step === 'cart' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 sm:gap-5 border border-theme p-4 hover:border-gold transition-colors duration-300 bg-surface rounded-xl">
                <Link to={`/produto/${item.id}`} className="flex-shrink-0">
                  <img src={resolveImageUrl(item.images[0])} alt={item.title} className="w-16 sm:w-20 h-20 sm:h-24 object-cover bg-surface-2" onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x750/0d0d0d/ac872a?text=${encodeURIComponent(item.brand?.[0] ?? '·')}` }} />
                </Link>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-gold mb-1">{item.brand}</p>
                    <p className="text-sm font-light text-theme truncate" style={{ fontFamily: 'var(--font-display, serif)' }}>{item.title}</p>
                    <p className="text-xs text-muted mt-1">Tam. {item.size} · {item.condition}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-light text-theme" style={{ fontFamily: 'var(--font-display, serif)' }}>
                      {fmt(item.price)}
                    </p>
                    <button onClick={() => removeItem(item.id)}
                      className="text-[10px] tracking-widest uppercase text-muted hover:text-red-400 transition-colors">
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-[10px] tracking-widest uppercase text-muted hover:text-theme transition-colors mt-2">
              Esvaziar bolsa
            </button>
          </div>

          {/* Resumo */}
          <div className="space-y-4 bg-surface border border-theme p-6 rounded-xl h-fit">
            <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">Resumo</p>
            <div className="flex justify-between text-sm font-light border-b border-theme pb-3">
              <span>{items.length === 1 ? '1 peça' : `${items.length} peças`}</span>
              <span className="text-muted">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-light border-b border-theme pb-3">
              <span>Envio</span>
              <span className={shipping === 0 ? 'text-gold' : 'text-muted'}>
                {shipping === 0 ? 'Grátis' : fmt(SHIPPING_COST)}
              </span>
            </div>
            {subtotal < SHIPPING_FREE_ABOVE && (
              <p className="text-[10px] text-muted/60 font-light">
                Frete grátis acima de {fmt(SHIPPING_FREE_ABOVE)}
              </p>
            )}
            <div className="flex justify-between font-medium pt-2">
              <span className="text-sm">Total</span>
              <span className="text-2xl text-gold" style={{ fontFamily: 'var(--font-display, serif)' }}>
                {fmt(total)}
              </span>
            </div>
            <button
              onClick={() => { if (!user) navigate('/login'); else setStep('checkout') }}
              className="w-full btn-gold py-4 text-xs tracking-[0.3em] uppercase mt-4 font-medium"
            >
              Continuar para entrega
            </button>
          </div>
        </div>
      )}

      {step === 'checkout' && (
        <div className="max-w-xl space-y-6">
          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">Endereço de entrega</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={4}
              placeholder="Rua, número, bairro, cidade, estado, CEP"
              className="w-full border border-theme bg-transparent p-4 text-sm font-light text-theme outline-none focus:border-gold transition-colors resize-none placeholder:text-muted/40 rounded-lg"
            />
            {addrErr && <p className="text-xs text-red-400 mt-1">{addrErr}</p>}
          </div>

          <div className="bg-surface border border-theme rounded-xl p-5 space-y-3">
            <p className="text-xs tracking-[0.25em] uppercase text-muted mb-2">Frete</p>
            <div className="flex items-center justify-between text-sm font-light">
              <span>{shipping === 0 ? 'Frete grátis' : 'Entrega padrão (5-10 dias úteis)'}</span>
              <span className={shipping === 0 ? 'text-gold' : 'text-theme'}>{shipping === 0 ? 'Grátis' : fmt(SHIPPING_COST)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep('cart')} className="flex-1 py-4 border border-theme text-[10px] tracking-[0.3em] uppercase text-muted hover:border-gold hover:text-gold transition-colors">
              Voltar
            </button>
            <button
              onClick={() => { if (!address.trim()) { setAddrErr('Informe o endereço'); return }; setAddrErr(''); setStep('confirm') }}
              className="flex-1 btn-gold py-4 text-[10px] tracking-[0.3em] uppercase font-medium"
            >
              Revisar pedido
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="max-w-xl space-y-8">
          {/* Itens */}
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 border border-theme p-3 bg-surface rounded-xl">
                <img src={resolveImageUrl(item.images[0])} alt={item.title} className="w-14 h-14 object-cover flex-shrink-0" onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x750/0d0d0d/ac872a?text=${encodeURIComponent(item.brand?.[0] ?? '·')}` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gold tracking-[0.2em] uppercase">{item.brand}</p>
                  <p className="text-sm font-light text-theme truncate">{item.title}</p>
                  <p className="text-sm text-muted">{fmt(item.price)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Endereço */}
          <div className="border border-theme p-4 rounded-xl">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-2">Endereço</p>
            <p className="text-sm font-light text-theme whitespace-pre-wrap">{address}</p>
          </div>

          {/* Total */}
          <div className="bg-surface border border-theme rounded-xl p-5 space-y-2">
            <div className="flex justify-between text-sm font-light">
              <span className="text-muted">Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-light">
              <span className="text-muted">Envio</span>
              <span className={shipping === 0 ? 'text-gold' : ''}>{shipping === 0 ? 'Grátis' : fmt(SHIPPING_COST)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-theme">
              <span>Total</span>
              <span className="text-gold text-xl" style={{ fontFamily: 'var(--font-display, serif)' }}>{fmt(total)}</span>
            </div>
          </div>

          {addrErr && <p className="text-xs text-red-400">{addrErr}</p>}

          <div className="flex gap-4">
            <button onClick={() => setStep('checkout')} className="flex-1 py-4 border border-theme text-[10px] tracking-[0.3em] uppercase text-muted hover:border-gold hover:text-gold transition-colors">
              Voltar
            </button>
            <button
              onClick={placeOrder}
              disabled={placing}
              className="flex-1 btn-gold py-4 text-[10px] tracking-[0.3em] uppercase font-medium disabled:opacity-50 disabled:cursor-wait"
            >
              {placing ? <><Spinner /> Finalizando...</> : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
