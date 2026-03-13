'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import { Users, Plus, Search, Phone, Mail, Cake } from 'lucide-react'

export default function Clientes() {
  const [user, setUser] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '', fecha_nac: '', notas: ''
  })
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      cargarClientes()
    }
    init()
  }, [])

  async function cargarClientes() {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre')
    setClientes(data || [])
  }

  async function guardarCliente() {
    if (!form.nombre) return
    setLoading(true)
    const { error } = await supabase.from('clientes').insert({
      ...form,
      salon_id: user?.id
    })
    if (!error) {
      setForm({ nombre: '', telefono: '', email: '', fecha_nac: '', notas: '' })
      setMostrarForm(false)
      cargarClientes()
    }
    setLoading(false)
  }

  async function eliminarCliente(id: string) {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clientes').delete().eq('id', id)
    cargarClientes()
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase())
  )

  function cumpleEsSemana(fecha: string) {
    if (!fecha) return false
    const hoy = new Date()
    const cumple = new Date(fecha)
    cumple.setFullYear(hoy.getFullYear())
    const diff = (cumple.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }

  if (!user) return <div className="flex items-center justify-center h-screen text-gray-400 text-sm">Cargando...</div>

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar rol="cajera" />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-gray-400" />
            <h1 className="text-lg font-medium text-gray-900">Clientes</h1>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {clientes.length}
            </span>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nuevo cliente
          </button>
        </div>

        {mostrarForm && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Nuevo cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={e => setForm({...form, telefono: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="999 999 999"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={form.fecha_nac}
                  onChange={e => setForm({...form, fecha_nac: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={e => setForm({...form, notas: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Preferencias, alergias, etc."
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={guardarCliente}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar cliente'}
              </button>
              <button
                onClick={() => setMostrarForm(false)}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, teléfono o email..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              {busqueda ? 'No se encontraron clientes' : 'Aún no hay clientes registrados'}
            </div>
          ) : (
            <div>
              {clientesFiltrados.map((cliente) => (
                <div key={cliente.id} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-none">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-sm font-medium shrink-0">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{cliente.nombre}</p>
                      {cumpleEsSemana(cliente.fecha_nac) && (
                        <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Cake size={10} /> Cumpleaños
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {cliente.telefono && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone size={10} /> {cliente.telefono}
                        </span>
                      )}
                      {cliente.email && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail size={10} /> {cliente.email}
                        </span>
                      )}
                    </div>
                  </div>
                  {cliente.notas && (
                    <p className="text-xs text-gray-400 max-w-xs truncate hidden md:block">{cliente.notas}</p>
                  )}
                  <button
                    onClick={() => eliminarCliente(cliente.id)}
                    className="text-xs text-gray-300 hover:text-red-400 transition-colors ml-2"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}