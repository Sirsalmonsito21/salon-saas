'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import { ShoppingCart, Plus, Trash2, CreditCard, Banknote, Smartphone } from 'lucide-react'

export default function Ventas() {
  const [user, setUser] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [clienteId, setClienteId] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const [{ data: c }, { data: s }, { data: v }] = await Promise.all([
        supabase.from('clientes').select('*').order('nombre'),
        supabase.from('servicios').select('*').order('nombre'),
        supabase.from('ventas').select('*').order('created_at', { ascending: false }).limit(20)
      ])
      setClientes(c || [])
      setServicios(s || [])
      setVentas(v || [])
    }
    init()
  }, [])

  function agregarItem(servicio: any) {
    const existe = items.find(i => i.descripcion === servicio.nombre)
    if (existe) {
      setItems(items.map(i => i.descripcion === servicio.nombre
        ? { ...i, cantidad: i.cantidad + 1 }
        : i
      ))
    } else {
      setItems([...items, {
        descripcion: servicio.nombre,
        precio: servicio.precio,
        cantidad: 1
      }])
    }
  }

  function agregarItemCustom() {
    setItems([...items, { descripcion: '', precio: 0, cantidad: 1 }])
  }

  function actualizarItem(index: number, campo: string, valor: any) {
    setItems(items.map((item, i) => i === index ? { ...item, [campo]: valor } : item))
  }

  function eliminarItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

  async function procesarVenta() {
    if (items.length === 0) return
    setLoading(true)
    const { data: venta, error } = await supabase.from('ventas').insert({
      cliente_id: clienteId || null,
      total,
      metodo_pago: metodoPago,
      notas,
      salon_id: user?.id
    }).select().single()

    if (!error && venta) {
      await supabase.from('venta_items').insert(
        items.map(item => ({
          venta_id: venta.id,
          descripcion: item.descripcion,
          precio: item.precio,
          cantidad: item.cantidad,
          salon_id: user?.id
        }))
      )
      setItems([])
      setClienteId('')
      setNotas('')
      const { data: v } = await supabase
        .from('ventas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      setVentas(v || [])
    }
    setLoading(false)
  }

  if (!user) return <div className="flex items-center justify-center h-screen text-gray-400 text-sm">Cargando...</div>

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar rol="cajera" />

      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart size={20} className="text-gray-400" />
          <h1 className="text-lg font-medium text-gray-900">Caja / Ventas</h1>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Nueva venta</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Cliente (opcional)</label>
                  <select
                    value={clienteId}
                    onChange={e => setClienteId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Sin cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Método de pago</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'efectivo', label: 'Efectivo', icon: Banknote },
                      { value: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                      { value: 'yape', label: 'Yape', icon: Smartphone },
                    ].map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMetodoPago(m.value)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs border transition-colors
                          ${metodoPago === m.value
                            ? 'bg-blue-50 border-blue-300 text-blue-600 font-medium'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        <m.icon size={12} />
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {servicios.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-2 block">Agregar servicio rápido</label>
                  <div className="flex flex-wrap gap-2">
                    {servicios.map(s => (
                      <button
                        key={s.id}
                        onClick={() => agregarItem(s)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                      >
                        {s.nombre} — S/ {s.precio}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.descripcion}
                      onChange={e => actualizarItem(i, 'descripcion', e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Descripción"
                    />
                    <input
                      type="number"
                      value={item.precio}
                      onChange={e => actualizarItem(i, 'precio', parseFloat(e.target.value) || 0)}
                      className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Precio"
                    />
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={e => actualizarItem(i, 'cantidad', parseInt(e.target.value) || 1)}
                      className="w-16 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Cant."
                    />
                    <p className="text-sm font-medium text-gray-700 w-20 text-right">
                      S/ {(item.precio * item.cantidad).toFixed(2)}
                    </p>
                    <button onClick={() => eliminarItem(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={agregarItemCustom}
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <Plus size={12} /> Agregar item
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-2xl font-medium text-gray-900">S/ {total.toFixed(2)}</span>
              </div>
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Notas (opcional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 mb-3"
                rows={2}
              />
              <button
                onClick={procesarVenta}
                disabled={loading || items.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition-colors"
              >
                {loading ? 'Procesando...' : `Cobrar S/ ${total.toFixed(2)}`}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 h-fit">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Ventas recientes</h2>
            {ventas.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No hay ventas aún</p>
            ) : (
              <div className="space-y-2">
                {ventas.map(v => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none">
                    <div>
                      <p className="text-xs font-medium text-gray-700">S/ {parseFloat(v.total).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{v.metodo_pago}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(v.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}