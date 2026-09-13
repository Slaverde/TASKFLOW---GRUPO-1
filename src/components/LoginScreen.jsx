import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { BackgroundPaths } from '@/components/ui/background-paths'
import { RainbowButton } from '@/components/ui/rainbow-button'

export default function LoginScreen() {
  const [mode,     setMode]     = useState('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [info,     setInfo]     = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Cuenta creada. Si tu proyecto pide confirmación, revisá tu correo antes de iniciar sesión.')
      }
    } catch (e) {
      setError(e?.message ?? 'Ocurrió un error. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BackgroundPaths>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-3 mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            TaskFlow
          </h1>
          <p className="text-white/80 text-sm text-center drop-shadow-md">
            Tu gestor de tareas personal
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm flex flex-col items-center gap-3"
        >
          <input
            type="email"
            required
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder:text-white/50 outline-none focus:border-white/40"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-white placeholder:text-white/50 outline-none focus:border-white/40"
          />

          <RainbowButton
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 text-black disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            ) : mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
          </RainbowButton>

          <button
            type="button"
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setInfo('') }}
            className="text-white/70 text-sm hover:text-white transition-colors"
          >
            {mode === 'signin' ? '¿No tenés cuenta? Creá una' : '¿Ya tenés cuenta? Iniciá sesión'}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}
          {info && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-400 text-sm text-center"
            >
              {info}
            </motion.p>
          )}
        </motion.form>

      </div>
    </BackgroundPaths>
  )
}
