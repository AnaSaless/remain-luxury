import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { conversationService } from '@services/conversationService'
import { useAuthStore } from '@/store/authStore'
import { clsx } from 'clsx'
import Spinner from '@components/common/Spinner'

export default function Messages() {
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()
  const initialConvId = searchParams.get('conv')

  const [conversations, setConversations]   = useState([])
  const [activeConvId, setActiveConvId]     = useState(initialConvId ? Number(initialConvId) : null)
  const [messages, setMessages]             = useState([])
  const [text, setText]                     = useState('')
  const [sending, setSending]               = useState(false)
  const [loadingConvs, setLoadingConvs]     = useState(true)
  const [loadingMsgs, setLoadingMsgs]       = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    conversationService.getAll()
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(() => setConversations([]))
      .finally(() => setLoadingConvs(false))
  }, [user, navigate])

  const fetchMessages = useCallback(() => {
    if (!activeConvId) return
    conversationService.getMessages(activeConvId).then(data => setMessages(Array.isArray(data) ? data : [])).catch(() => {})
  }, [activeConvId])

  useEffect(() => {
    if (!activeConvId) return
    setLoadingMsgs(true)
    conversationService.getMessages(activeConvId)
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false))

    clearInterval(pollRef.current)
    pollRef.current = setInterval(fetchMessages, 5000)
    return () => clearInterval(pollRef.current)
  }, [activeConvId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !activeConvId) return
    setSending(true)
    try {
      const msg = await conversationService.sendMessage(activeConvId, text.trim())
      setMessages(prev => [...prev, msg])
      setText('')
    } finally {
      setSending(false)
    }
  }

  const activeConv = conversations.find(c => c.id === activeConvId)

  return (
    <div className="bg-theme min-h-screen text-theme transition-colors duration-200 flex flex-col">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 flex-1 flex flex-col">
        <p className="text-xs tracking-[0.4em] uppercase text-muted mb-2">Chat</p>
        <h1 className="text-4xl sm:text-5xl font-light mb-8 text-theme" style={{ fontFamily: 'var(--font-display, serif)' }}>
          Mensagens
        </h1>

        <div className="border border-theme flex flex-1 min-h-[500px] rounded-2xl overflow-hidden">
          {/* Lista de conversas */}
          <aside className="w-full sm:w-72 border-r border-theme flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-theme">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted">Conversas</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-12 shimmer" />)}
                </div>
              ) : conversations.length === 0 ? (
                <p className="p-6 text-xs text-muted font-light text-center">Nenhuma conversa ainda</p>
              ) : conversations.map(conv => {
                const isActive = conv.id === activeConvId
                const other = conv.buyer_id === user.id ? conv.seller_name : conv.buyer_name
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={clsx(
                      'w-full text-left p-4 border-b border-theme transition-colors duration-200',
                      isActive ? 'bg-surface border-l-2 border-l-gold' : 'hover:bg-surface/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {conv.product_image && (
                        <img src={conv.product_image} alt="" className="w-9 h-9 object-cover flex-shrink-0 rounded-lg" onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/0d0d0d/ac872a?text=·' }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-light text-theme truncate">{other}</p>
                        {conv.product_title && (
                          <p className="text-[10px] text-gold truncate">{conv.product_title}</p>
                        )}
                        {conv.last_message && (
                          <p className="text-[10px] text-muted truncate mt-0.5">{conv.last_message}</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Thread */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeConvId ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-surface rounded-2xl m-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted opacity-40">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p className="text-sm font-light text-muted">Selecione uma conversa para começar</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-theme flex items-center gap-3">
                  {activeConv?.product_image && (
                    <img src={activeConv.product_image} alt="" className="w-8 h-8 object-cover rounded-lg" onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/0d0d0d/ac872a?text=·' }} />
                  )}
                  <div>
                    <p className="text-xs font-light text-theme">
                      {activeConv ? (activeConv.buyer_id === user.id ? activeConv.seller_name : activeConv.buyer_name) : ''}
                    </p>
                    {activeConv?.product_title && (
                      <p className="text-[10px] text-gold">{activeConv.product_title}</p>
                    )}
                  </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted text-xs font-light">Carregando...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-xs text-muted font-light text-center py-8">Nenhuma mensagem. Diga olá!</p>
                  ) : messages.map(msg => {
                    const mine = msg.sender_id === user.id
                    return (
                      <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={clsx(
                          'max-w-[70%] px-4 py-2.5 text-sm font-light leading-relaxed',
                          mine
                            ? 'bg-gold/20 border border-gold/30 text-theme'
                            : 'bg-surface border border-theme text-theme'
                        )}>
                          {!mine && (
                            <p className="text-[10px] text-gold mb-1 tracking-wide">{msg.sender_name}</p>
                          )}
                          <p>{msg.body}</p>
                          <p className="text-[10px] text-muted/60 mt-1 text-right">
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-theme flex gap-3">
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 bg-surface border border-theme px-4 py-2.5 text-sm font-light text-theme outline-none focus:border-gold transition-colors placeholder:text-muted/40"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="btn-gold px-6 py-2.5 text-[10px] tracking-[0.25em] uppercase font-medium disabled:opacity-40"
                  >
                    {sending ? <Spinner /> : 'Enviar'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
