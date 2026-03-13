'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Iniciar sesión</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '1rem', marginBottom: '1rem' }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '1rem' }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button
        onClick={handleLogin}
        style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        Entrar
      </button>
      <p style={{ marginTop: '1rem' }}>
        ¿No tienes cuenta? <a href="/registro">Regístrate</a>
      </p>
    </main>
  )
}