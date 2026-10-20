import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@components/common/Spinner'

const schema = z.object({
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data) {
    clearError()
    if (await login(data)) navigate('/perfil')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-14 bg-theme transition-colors duration-200">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.4em] uppercase text-gold mb-2 text-center">Bem-vinda de volta</p>
        <h1 className="text-5xl sm:text-6xl font-light mb-10 sm:mb-12 text-center text-theme tracking-[0.06em]" style={{ fontFamily: 'var(--font-display, serif)' }}>
          Entrar
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {[
            { key: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com', autoComplete: 'email' },
            { key: 'password', label: 'Senha', type: 'password', placeholder: '••••••••', autoComplete: 'current-password' },
          ].map(f => (
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
            {isLoading ? <><Spinner /> Entrando...</> : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs mt-4 text-muted">Teste: isabela@demo.com / 12345678</p>
        <p className="text-center text-sm font-light mt-6 text-muted">
          Não tem conta?{' '}
          <Link to="/cadastro" className="text-gold hover:text-theme transition-colors underline underline-offset-4">Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}
