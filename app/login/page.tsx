'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-base)'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', padding: '0 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px', fontWeight: '600',
            color: 'white', margin: '0 auto 16px'
          }}>S</div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)' }}>
            Bienvenido
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
            Inicia sesión en tu salón
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '24px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-light)', border: '1px solid var(--danger)',
              borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
              fontSize: '12px', color: 'var(--danger)'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              background: 'var(--accent)', border: 'none', color: 'white',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              opacity: loading ? 0.6 : 1, transition: 'opacity .15s'
            }}
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '20px' }}>
          ¿No tienes cuenta?{' '}
          <a href="/registro" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Regístrate
          </a>
        </p>
      </div>
    </div>
  )
}