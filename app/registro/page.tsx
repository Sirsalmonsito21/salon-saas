'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Registro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegistro() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre } }
    })
    if (error) { setError(error.message) }
    else { setMensaje('Revisa tu email para confirmar tu cuenta') }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-base)'
    }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px', fontWeight: '600',
            color: 'white', margin: '0 auto 16px'
          }}>S</div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)' }}>Crear cuenta</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '6px' }}>Empieza gratis hoy</p>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '24px'
        }}>
          {[
            { label: 'Nombre del salón', value: nombre, set: setNombre, type: 'text', placeholder: 'Salón Valeria' },
            { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'tu@email.com' },
            { label: 'Contraseña', value: password, set: setPassword, type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}

          {error && (
            <div style={{
              background: 'var(--danger-light)', border: '1px solid var(--danger)',
              borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
              fontSize: '12px', color: 'var(--danger)'
            }}>{error}</div>
          )}

          {mensaje && (
            <div style={{
              background: 'var(--success-light)', border: '1px solid var(--success)',
              borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
              fontSize: '12px', color: 'var(--success)'
            }}>{mensaje}</div>
          )}

          <button
            onClick={handleRegistro}
            disabled={loading}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              background: 'var(--accent)', border: 'none', color: 'white',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '20px' }}>
          ¿Ya tienes cuenta?{' '}
          <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inicia sesión</a>
        </p>
      </div>
    </div>
  )
}