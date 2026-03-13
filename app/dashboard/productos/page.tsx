'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, Plus, X, AlertTriangle } from 'lucide-react'

export default function Productos() {
  const [user, setUser] = useState<any>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: '5'
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      cargarProductos()
    }
    init()
  }, [])

  async function cargarProductos() {
    const { data } = await supabase.from('productos').select('*').order('nombre')
    setProductos(data || [])
  }

  async function guardarProducto() {
    if (!form.nombre) return
    setLoading(true)
    await supabase.from('productos').insert({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio) || 0,
      stock: parseInt(form.stock) || 0,
      stock_minimo: parseInt(form.stock_minimo) || 5,
      salon_id: user?.id
    })
    setForm({ nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: '5' })
    setMostrarForm(false)
    cargarProductos()
    setLoading(false)
  }

  async function actualizarStock(id: string, delta: number, stockActual: number) {
    const nuevoStock = Math.max(0, stockActual + delta)
    await supabase.from('productos').update({ stock: nuevoStock }).eq('id', id)
    cargarProductos()
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    cargarProductos()
  }

  const stockBajo = productos.filter(p => p.stock <= p.stock_minimo)

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={18} color="var(--text-tertiary)" />
          <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>Productos</h1>
          <span style={{
            fontSize: '11px', background: 'var(--bg-elevated)', color: 'var(--text-tertiary)',
            padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border)'
          }}>{productos.length}</span>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent)', border: 'none', color: 'white',
            fontSize: '13px', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer'
          }}
        >
          <Plus size={14} /> Nuevo producto
        </button>
      </div>

      {stockBajo.length > 0 && (
        <div style={{
          background: 'var(--warning-light)', border: '1px solid var(--warning)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <AlertTriangle size={15} color="var(--warning)" />
          <p style={{ fontSize: '13px', color: 'var(--warning)' }}>
            {stockBajo.length} producto{stockBajo.length > 1 ? 's' : ''} con stock bajo: {stockBajo.map(p => p.nombre).join(', ')}
          </p>
        </div>
      )}

      {mostrarForm && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Nuevo producto</h2>
            <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Nombre *', key: 'nombre', type: 'text', placeholder: 'Ej: Shampoo Keratina' },
              { label: 'Precio (S/)', key: 'precio', type: 'number', placeholder: '0.00' },
              { label: 'Stock inicial', key: 'stock', type: 'number', placeholder: '0' },
              { label: 'Stock mínimo', key: 'stock_minimo', type: 'number', placeholder: '5' },
              { label: 'Descripción', key: 'descripcion', type: 'text', placeholder: 'Descripción opcional' },
            ].map(f => (
              <div key={f.key} style={{ gridColumn: f.key === 'descripcion' ? '1 / -1' : 'auto' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={guardarProducto}
              disabled={loading}
              style={{
                background: 'var(--accent)', border: 'none', color: 'white',
                fontSize: '13px', padding: '8px 16px', borderRadius: '8px',
                cursor: 'pointer', opacity: loading ? 0.6 : 1
              }}
            >{loading ? 'Guardando...' : 'Guardar'}</button>
            <button
              onClick={() => setMostrarForm(false)}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px',
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'
              }}
            >Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
        {productos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            No hay productos registrados
          </div>
        ) : productos.map(p => {
          const stockBajo = p.stock <= p.stock_minimo
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              transition: 'background .1s'
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: stockBajo ? 'var(--warning-light)' : 'var(--bg-elevated)',
                color: stockBajo ? 'var(--warning)' : 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Package size={15} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{p.nombre}</p>
                  {stockBajo && (
                    <span style={{
                      fontSize: '11px', background: 'var(--warning-light)', color: 'var(--warning)',
                      padding: '2px 8px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <AlertTriangle size={10} /> Stock bajo
                    </span>
                  )}
                </div>
                {p.descripcion && (
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{p.descripcion}</p>
                )}
              </div>

              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', width: '80px', textAlign: 'right' }}>
                S/ {parseFloat(p.precio).toFixed(2)}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => actualizarStock(p.id, -1, p.stock)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >−</button>
                <span style={{
                  fontSize: '13px', fontWeight: '500', minWidth: '40px', textAlign: 'center',
                  color: stockBajo ? 'var(--warning)' : 'var(--text-primary)'
                }}>{p.stock}</span>
                <button
                  onClick={() => actualizarStock(p.id, 1, p.stock)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >+</button>
              </div>

              <button
                onClick={() => eliminar(p.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}