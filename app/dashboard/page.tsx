'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'
import { ShoppingCart, Calendar, Users, Cake } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [rol, setRol] = useState('cajera')
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

  if (!user) return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      Cargando...
    </div>
  )

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar rol={rol} />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-medium text-gray-900">Inicio</h1>
            <p className="text-sm text-gray-400 mt-0.5">Bienvenida, {user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRol(rol === 'admin' ? 'cajera' : 'admin')}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {rol === 'admin' ? 'Vista: Admin' : 'Vista: Cajera'}
            </button>
            <span className="text-sm text-gray-400">
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Ventas hoy', value: 'S/ 0', sub: '0 transacciones', icon: ShoppingCart, color: 'text-blue-500 bg-blue-50' },
            { label: 'Citas hoy', value: '0', sub: '0 pendientes', icon: Calendar, color: 'text-purple-500 bg-purple-50' },
            { label: 'Clientes', value: '0', sub: '0 nuevos esta semana', icon: Users, color: 'text-green-500 bg-green-50' },
            { label: 'Cumpleaños hoy', value: '0', sub: 'clientes', icon: Cake, color: 'text-amber-500 bg-amber-50' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{m.label}</span>
                <div className={`p-1.5 rounded-lg ${m.color}`}>
                  <m.icon size={14} />
                </div>
              </div>
              <p className="text-2xl font-medium text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-900">Citas del día</h2>
              <button className="text-xs text-blue-500 hover:text-blue-600">+ Nueva cita</button>
            </div>
            <p className="text-sm text-gray-400 text-center py-6">No hay citas para hoy</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-900">Cumpleaños esta semana</h2>
            </div>
            <p className="text-sm text-gray-400 text-center py-6">No hay cumpleaños esta semana</p>
          </div>
        </div>
      </main>
    </div>
  )
}