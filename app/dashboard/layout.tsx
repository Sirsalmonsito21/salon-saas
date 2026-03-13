'use client'

import { useEffect, useState } from 'react'
import { supabase, getPerfil } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const p = await getPerfil()
      setPerfil(p)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-base)', color: 'var(--text-tertiary)',
      fontSize: '13px'
    }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ display: 'flex', background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Sidebar rol={perfil?.rol || 'cajera'} salonId={perfil?.salon_id} />
      <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}