'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <p style={{ padding: '2rem' }}>Cargando...</p>

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user.email}</p>
      <button
        onClick={handleLogout}
        style={{ marginTop: '1rem', padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
      >
        Cerrar sesión
      </button>
    </main>
  )
}