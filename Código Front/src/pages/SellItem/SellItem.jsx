import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { productService } from '@services/productService'
import { useAuthStore } from '@/store/authStore'
import { BRANDS, CATEGORIES, CONDITIONS } from '@/data/products'
import Spinner from '@components/common/Spinner'

const SIZES = ['PP','P','M','G','GG','34','35','36','37','38','39','40','41','42','Único']
const MAX_IMAGES = 5

const schema = z.object({
  title:       z.string().min(3, 'Mínimo 3 caracteres'),
  brand:       z.string().min(1, 'Selecione a marca'),
  category:    z.string().min(1, 'Selecione a categoria'),
  size:        z.string().min(1, 'Selecione o tamanho'),
  condition:   z.string().min(1, 'Selecione a condição'),
  price:       z.coerce.number({ invalid_type_error: 'Informe um valor' }).positive('Valor positivo'),
  description: z.string().min(20, 'Mínimo 20 caracteres'),
})

const inputClass = 'w-full border-b border-theme bg-transparent py-3 text-sm font-light text-theme outline-none placeholder:text-muted/40 rounded-t'
const selectClass = 'w-full border-b border-theme bg-theme py-3 text-sm font-light text-theme outline-none focus:border-gold transition-colors appearance-none cursor-pointer rounded-t'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  )
}

export default function SellItem() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const fileInputRef = useRef(null)
  const [imagePreviews, setImagePreviews] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => { if (!user) navigate('/login') }, [user, navigate])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  function fileToBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
  }

  async function addFiles(files) {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
    const combined = [...imageFiles, ...valid].slice(0, MAX_IMAGES)
    setImageFiles(combined)
    const previews = await Promise.all(combined.map(fileToBase64))
    setImagePreviews(previews)
  }

  async function removeImage(i) {
    const files = imageFiles.filter((_, x) => x !== i)
    setImageFiles(files)
    const previews = await Promise.all(files.map(fileToBase64))
    setImagePreviews(previews)
  }

  async function onSubmit(data) {
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.append(k, v))
    imageFiles.forEach(f => formData.append('images', f))
    await productService.create(formData)
    navigate('/perfil')
  }

  if (!user) return null

  return (
    <div className="bg-theme min-h-screen text-theme transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-xs tracking-[0.4em] uppercase text-gold mb-2">Vender</p>
        <h1 className="text-5xl sm:text-6xl font-light mb-4 text-theme tracking-[0.04em]" style={{ fontFamily: 'var(--font-display, serif)' }}>
          Publicar peça
        </h1>
        <p className="text-sm text-muted font-light leading-loose mb-10 sm:mb-12">
          Preencha as informações da sua peça. Boas fotos aumentam as chances de venda.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Upload de fotos */}
          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">
              Fotos <span className="text-gold">*</span>
              <span className="normal-case tracking-normal ml-2 font-light">(até {MAX_IMAGES})</span>
            </label>

            {imagePreviews.length < MAX_IMAGES && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                className={`border border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 py-10 transition-all duration-300 ${
                  dragOver ? 'border-gold bg-gold/5' : 'border-theme hover:border-gold/50 hover:bg-surface'
                }`}
              >
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-muted">
                  <rect x="3" y="7" width="26" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="11" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 22l7-5 5 4 5-6 9 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M20 3v6M17 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="text-center">
                  <p className="text-xs tracking-wider text-theme-60 font-light">Clique ou arraste as fotos</p>
                  <p className="text-[10px] text-muted mt-1">JPG, PNG, WEBP</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square group">
                    <img src={src} alt={`Foto ${i+1}`} className="w-full h-full object-cover border border-theme" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                      ✕
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[8px] tracking-wider uppercase bg-black/70 text-gold px-1.5 py-0.5">Principal</span>}
                  </div>
                ))}
                {imagePreviews.length < MAX_IMAGES && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border border-dashed border-theme hover:border-gold flex items-center justify-center text-muted hover:text-gold transition-colors text-2xl font-thin">
                    +
                  </button>
                )}
              </div>
            )}
          </div>

          <Field label="Título da peça" error={errors.title?.message}>
            <div className="input-gold-line">
              <input {...register('title')} placeholder="Ex: Bolsa Kelly 25 em couro preto" className={inputClass} />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Marca" error={errors.brand?.message}>
              <select {...register('brand')} className={selectClass}>
                <option value="">Selecionar</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                <option value="Outra">Outra marca</option>
              </select>
            </Field>
            <Field label="Categoria" error={errors.category?.message}>
              <select {...register('category')} className={selectClass}>
                <option value="">Selecionar</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field label="Tamanho" error={errors.size?.message}>
              <select {...register('size')} className={selectClass}>
                <option value="">Selecionar</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Condição" error={errors.condition?.message}>
              <select {...register('condition')} className={selectClass}>
                <option value="">Selecionar</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Preço (R$)" error={errors.price?.message}>
            <div className="input-gold-line">
              <input {...register('price')} type="number" min="0" step="50" placeholder="5000" className={inputClass} />
            </div>
          </Field>

          <Field label="Descrição" error={errors.description?.message}>
            <textarea {...register('description')} rows={5}
              placeholder="Estado, história, o que acompanha, origem..."
              className="w-full border border-theme bg-transparent p-4 text-sm font-light text-theme outline-none focus:border-gold transition-colors resize-none placeholder:text-muted/40" />
          </Field>

          <button type="submit" disabled={isSubmitting}
            className="w-full btn-gold py-4 text-xs tracking-[0.3em] uppercase font-medium disabled:opacity-50 disabled:cursor-wait">
            {isSubmitting ? <><Spinner /> Publicando...</> : 'Publicar peça'}
          </button>
        </form>
      </div>
    </div>
  )
}
