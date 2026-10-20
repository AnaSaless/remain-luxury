import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@components/common/Spinner'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export default function Register() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data) {
    clearError()
    if (await registerUser(data)) navigate('/perfil')
  }

  const fields = [
    { key: 'name', label: 'Nome completo', type: 'text', placeholder: 'Seu nome', autoComplete: 'name' },
    { key: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com', autoComplete: 'email' },
    { key: 'password', label: 'Senha', type: 'password', placeholder: 'Mínimo 8 caracteres', autoComplete: 'new-password' },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-14 bg-theme transition-colors duration-200">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.4em] uppercase text-gold mb-2 text-center">Junte-se a nós</p>
        <h1 className="text-5xl sm:text-6xl font-light mb-10 sm:mb-12 text-center text-theme tracking-[0.06em]" style={{ fontFamily: 'var(--font-display, serif)' }}>
          Criar conta
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs tracking-[0.25em] uppercase text-muted mb-3">{f.label}</label>
              <div className="input-gold-line">
                <input
                  type={f.type} autoComplete={f.autoComplete} placeholder={f.placeholder}
                  {...register(f.key)}
                  className="w-full border-b border-theme bg-transparent py-3 text-sm font-light text-theme outline-none placeholder:text-muted/40 rounded-t"
                />
              </div>
              {errors[f.key] && <p className="text-xs text-red-400 mt-1">{errors[f.key].message}</p>}
            </div>
          ))}

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button type="submit" disabled={isLoading}
            className="w-full btn-gold py-4 text-xs tracking-[0.3em] uppercase font-medium mt-4 disabled:opacity-50 disabled:cursor-wait">
            {isLoading ? <><Spinner /> Criando conta...</> : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm font-light mt-8 text-muted">
          Já tem conta?{' '}
          <Link to="/login" className="text-gold hover:text-theme transition-colors underline underline-offset-4">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
