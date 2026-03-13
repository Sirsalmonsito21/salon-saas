'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Registro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()

  async function handleRegistro() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    })
    if (error) {
      setError(error.message)
    } else {
      setMensaje('Revisa tu email para confirmar tu cuenta')
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Crear cuenta</h1>
      <input
        type="text"
        placeholder="Nombre del salón"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginTop: '1rem', marginBottom: '1rem' }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '1rem' }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '1rem' }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      <button
        onClick={handleRegistro}
        style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        Registrarse
      </button>
      <p style={{ marginTop: '1rem' }}>
        ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
      </p>
    </main>
  )
}