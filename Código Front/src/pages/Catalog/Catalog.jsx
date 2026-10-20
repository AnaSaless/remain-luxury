import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '@components/features/ProductCard'
import { productService } from '@services/productService'
import { BRANDS, CATEGORIES, CONDITIONS } from '@/data/products'

const CATEGORY_LABEL = {
  bolsas: 'Bolsas', sapatos: 'Sapatos', roupas: 'Roupas', acessorios: 'Acessórios',
}

const ORDER_OPTIONS = [
  { value: '',           label: 'Mais recente' },
  { value: 'price_asc',  label: 'Menor preço'  },
  { value: 'price_desc', label: 'Maior preço'  },
]

function FilterGroup({ title, items, activeValue, onSelect }) {
  return (
    <div className="space-y-3">
      <p className="text-[9px] tracking-[0.4em] uppercase text-muted">{title}</p>
      <ul className="space-y-2.5">
        <li>
          <button
            onClick={() => onSelect('')}
            className={`text-xs font-light transition-colors duration-150 ${
              !activeValue ? 'text-[var(--gold)]' : 'text-[var(--muted)] hover:text-[var(--gold)]'
            }`}
          >
            Todas
          </button>
        </li>
        {items.map(item => (
          <li key={item}>
            <button
              onClick={() => onSelect(item)}
              className={`text-xs font-light transition-colors duration-150 text-left ${
                activeValue === item ? 'text-[var(--gold)]' : 'text-[var(--muted)] hover:text-[var(--gold)]'
              }`}
            >
              {CATEGORY_LABEL[item] ?? item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Grid editorial — ciclo de 7 cards:
// pos 0: large (col-span-2) + pos 1: normal → linha mista, pos 1 precisa de stretch
// pos 2,3,4: três normais → linha pura, sem stretch
// pos 5: normal + pos 6: large (col-span-2) → linha mista, pos 5 precisa de stretch
function EditorialGrid({ products }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, i) => {
        const isLarge      = (i % 7 === 0) || (i % 7 === 6)
        const needsStretch = (i % 7 === 1) || (i % 7 === 5)
        return (
          <div
            key={product.id}
            className={`${isLarge ? 'lg:col-span-2' : ''} ${i < 8 ? 'card-enter' : ''}`}
            style={i < 8 ? { animationDelay: `${i * 80}ms` } : undefined}
          >
            <ProductCard
              product={product}
              aspectOverride={isLarge ? '4/3' : '3/4'}
              stretch={needsStretch}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [filtersOpen, setFiltersOpen]   = useState(false)
  const [minInput, setMinInput]         = useState('')
  const [maxInput, setMaxInput]         = useState('')
  const [orderOpen, setOrderOpen]       = useState(false)
  const orderRef = useRef(null)
  const filterBtnRef = useRef(null)
  const filterPanelRef = useRef(null)

  const filters = {
    category:  searchParams.get('categoria') || '',
    brand:     searchParams.get('marca')     || '',
    condition: searchParams.get('condicao')  || '',
    search:    searchParams.get('q')         || '',
    minPrice:  searchParams.get('minPrice')  || '',
    maxPrice:  searchParams.get('maxPrice')  || '',
    orderBy:   searchParams.get('orderBy')   || '',
  }

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    value ? next.set(key, value) : next.delete(key)
    setSearchParams(next)
  }

  function clearFilters() {
    setSearchParams({})
    setMinInput('')
    setMaxInput('')
  }

  function applyPriceFilter() {
    const next = new URLSearchParams(searchParams)
    minInput ? next.set('minPrice', minInput) : next.delete('minPrice')
    maxInput ? next.set('maxPrice', maxInput) : next.delete('maxPrice')
    setSearchParams(next)
  }

  const hasFilters = filters.category || filters.brand || filters.condition
    || filters.search || filters.minPrice || filters.maxPrice || filters.orderBy

  useEffect(() => {
    setMinInput(filters.minPrice)
    setMaxInput(filters.maxPrice)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (orderRef.current && !orderRef.current.contains(e.target))
        setOrderOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (
        filterBtnRef.current && !filterBtnRef.current.contains(e.target) &&
        filterPanelRef.current && !filterPanelRef.current.contains(e.target)
      ) {
        setFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setLoading(true)
    productService
      .getAll({
        category:  filters.category,
        brand:     filters.brand,
        condition: filters.condition,
        search:    filters.search,
        minPrice:  filters.minPrice,
        maxPrice:  filters.maxPrice,
        orderBy:   filters.orderBy,
      })
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [searchParams.toString()])

  return (
    <div className="bg-theme min-h-screen text-theme transition-colors duration-200">
      <style>{`
        @keyframes orderDropdownIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes filterPanelIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Cabeçalho */}
      <div className="px-6 sm:px-12 lg:px-20 pt-16 pb-12 border-b border-theme">
        <div className="max-w-7xl mx-auto relative">
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted mb-4">Todas as peças</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light text-muted tracking-[0.05em]">
              Catálogo
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
              {/* Filtro */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] tracking-[0.3em] uppercase text-muted">Filtrar</label>
                <button
                  ref={filterBtnRef}
                  onClick={() => setFiltersOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 14px', position: 'relative',
                    fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: 'var(--text)', backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: '6px',
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 5h18M6 12h12M10 19h4" strokeLinecap="round"/>
                  </svg>
                  <span>Filtros</span>
                  {hasFilters && (
                    <span style={{
                      position: 'absolute', top: '-3px', right: '-3px',
                      width: '7px', height: '7px', borderRadius: '50%',
                      backgroundColor: 'var(--gold)',
                    }} />
                  )}
                </button>
              </div>
              {/* Ordenação */}
              <div className="flex flex-col gap-1 relative" ref={orderRef}>
                <label className="text-[9px] tracking-[0.3em] uppercase text-muted">Ordenar</label>
                <button
                  onClick={() => setOrderOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '10px', padding: '8px 12px', minWidth: '148px',
                    fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: 'var(--text)', backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: '6px',
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  <span>{ORDER_OPTIONS.find(o => o.value === filters.orderBy)?.label ?? 'Mais recente'}</span>
                  <span style={{
                    display: 'inline-block',
                    transition: 'transform 200ms ease',
                    transform: orderOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▾</span>
                </button>
                {orderOpen && (
                  <ul style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    zIndex: 50, listStyle: 'none', margin: 0, padding: 0,
                    backgroundColor: 'var(--surface-2)', borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
                    animation: 'orderDropdownIn 150ms ease-out forwards',
                  }}>
                    {ORDER_OPTIONS.map(o => (
                      <li key={o.value}>
                        <button
                          onClick={() => { setFilter('orderBy', o.value); setOrderOpen(false) }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface)'; e.currentTarget.style.color = 'var(--gold)' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = o.value === filters.orderBy ? 'var(--gold)' : 'var(--text)' }}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            padding: '10px 16px', fontSize: '0.75rem',
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            color: o.value === filters.orderBy ? 'var(--gold)' : 'var(--text)',
                            fontWeight: o.value === filters.orderBy ? 500 : 400,
                            backgroundColor: 'transparent', border: 'none',
                            cursor: 'pointer', transition: 'background-color 150ms, color 150ms',
                          }}
                        >{o.label}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Busca */}
              <input
                type="search"
                value={filters.search}
                onChange={e => setFilter('q', e.target.value)}
                placeholder="Buscar por título ou marca..."
                className="w-full sm:w-64 border-b border-theme bg-transparent pb-2 text-sm font-light text-theme outline-none focus:border-gold transition-colors placeholder:text-muted/40"
              />
            </div>
          </div>

          {/* Painel de filtros */}
          {filtersOpen && (
            <div
              ref={filterPanelRef}
              className="absolute left-0 right-0 top-full mt-4 z-40"
              style={{ animation: 'filterPanelIn 200ms ease-out forwards' }}
            >
              <div
                className="flex flex-nowrap items-stretch gap-8 px-8 py-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ backgroundColor: 'var(--surface-2)', borderRadius: '12px', boxShadow: 'var(--shadow)' }}
              >
                <div className="flex-shrink-0">
                  <FilterGroup title="Categoria" items={CATEGORIES} activeValue={filters.category} onSelect={v => setFilter('categoria', v)} />
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
                <div className="flex-shrink-0">
                  <FilterGroup title="Marca" items={BRANDS} activeValue={filters.brand} onSelect={v => setFilter('marca', v)} />
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
                <div className="flex-shrink-0">
                  <FilterGroup title="Condição" items={CONDITIONS} activeValue={filters.condition} onSelect={v => setFilter('condicao', v)} />
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />

                {/* Faixa de preço */}
                <div className="flex-shrink-0 space-y-3">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-muted">Preço</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minInput}
                      onChange={e => setMinInput(e.target.value)}
                      placeholder="Mín R$"
                      className="w-20 border-b border-theme bg-transparent py-1 text-xs font-light text-theme outline-none focus:border-gold transition-colors placeholder:text-muted/30"
                    />
                    <span className="text-muted text-xs">–</span>
                    <input
                      type="number"
                      value={maxInput}
                      onChange={e => setMaxInput(e.target.value)}
                      placeholder="Máx R$"
                      className="w-20 border-b border-theme bg-transparent py-1 text-xs font-light text-theme outline-none focus:border-gold transition-colors placeholder:text-muted/30"
                    />
                  </div>
                  <button
                    onClick={applyPriceFilter}
                    className="text-[9px] tracking-[0.3em] uppercase text-muted hover:text-gold transition-colors duration-150"
                  >
                    Aplicar
                  </button>
                </div>

                {hasFilters && (
                  <>
                    <div style={{ width: '1px', backgroundColor: 'var(--border)' }} />
                    <div className="flex-shrink-0 self-center">
                      <button onClick={clearFilters} className="text-[9px] tracking-[0.3em] uppercase text-muted hover:text-gold transition-colors duration-150">
                        Limpar filtros
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 sm:px-12 lg:px-20 py-12 max-w-7xl mx-auto">
        <p className="text-xs text-muted font-light mb-10">
          {loading ? 'Carregando...' : `${products.length} ${products.length === 1 ? 'peça encontrada' : 'peças encontradas'}`}
        </p>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="shimmer aspect-[3/4]" />
                <div className="h-2 shimmer w-1/2" />
                <div className="h-3 shimmer w-3/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-sm font-light text-muted mb-6">Nenhuma peça encontrada.</p>
            <button onClick={clearFilters} className="text-[10px] tracking-[0.3em] uppercase text-gold hover:text-theme transition-colors underline underline-offset-4">
              Limpar filtros
            </button>
          </div>
        ) : (
          <EditorialGrid products={products} />
        )}
      </div>
    </div>
  )
}
