'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Scissors, Plus, X } from 'lucide-react'

export default function Servicios() {
  const [user, setUser] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', precio: '', precio_variable: false, descripcion: ''
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      cargarServicios()
    }
    init()
  }, [])

  async function cargarServicios() {
    const { data } = await supabase.from('servicios').select('*').order('nombre')
    setServicios(data || [])
  }

  async function guardarServicio() {
    if (!form.nombre) return
    setLoading(true)
    await supabase.from('servicios').insert({
      nombre: form.nombre,
      precio: form.precio_variable ? 0 : parseFloat(form.precio) || 0,
      precio_variable: form.precio_variable,
      descripcion: form.descripcion,
      salon_id: user?.id
    })
    setForm({ nombre: '', precio: '', precio_variable: false, descripcion: '' })
    setMostrarForm(false)
    cargarServicios()
    setLoading(false)
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este servicio?')) return
    await supabase.from('servicios').delete().eq('id', id)
    cargarServicios()
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scissors size={18} color="var(--text-tertiary)" />
          <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>Servicios</h1>
          <span style={{
            fontSize: '11px', background: 'var(--bg-elevated)', color: 'var(--text-tertiary)',
            padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border)'
          }}>{servicios.length}</span>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent)', border: 'none', color: 'white',
            fontSize: '13px', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer'
          }}
        >
          <Plus size={14} /> Nuevo servicio
        </button>
      </div>

      {mostrarForm && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Nuevo servicio</h2>
            <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Corte de cabello"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Precio</label>
              <input
                type="number"
                value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })}
                placeholder="S/ 0.00"
                disabled={form.precio_variable}
                style={{ opacity: form.precio_variable ? 0.4 : 1 }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Descripción</label>
              <input
                type="text"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => setForm({ ...form, precio_variable: !form.precio_variable })}
                style={{
                  width: '36px', height: '20px', borderRadius: '99px', cursor: 'pointer',
                  background: form.precio_variable ? 'var(--accent)' : 'var(--bg-elevated)',
                  border: '1px solid var(--border)', position: 'relative', transition: 'background .2s'
                }}
              >
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%', background: 'white',
                  position: 'absolute', top: '2px', transition: 'left .2s',
                  left: form.precio_variable ? '18px' : '2px'
                }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Precio variable — la cajera ingresa el precio al momento de vender
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={guardarServicio}
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
        {servicios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            No hay servicios registrados
          </div>
        ) : servicios.map(s => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            transition: 'background .1s'
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--accent-light)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Scissors size={15} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{s.nombre}</p>
                {s.precio_variable && (
                  <span style={{
                    fontSize: '11px', background: 'var(--warning-light)', color: 'var(--warning)',
                    padding: '2px 8px', borderRadius: '99px'
                  }}>Precio variable</span>
                )}
              </div>
              {s.descripcion && (
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{s.descripcion}</p>
              )}
            </div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
              {s.precio_variable ? 'Variable' : `S/ ${parseFloat(s.precio).toFixed(2)}`}
            </p>
            <button
              onClick={() => eliminar(s.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}