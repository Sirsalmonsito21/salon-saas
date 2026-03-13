'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Plus, Clock, Check, X } from 'lucide-react'

export default function Citas() {
  const [user, setUser] = useState<any>(null)
  const [citas, setCitas] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0])
  const [form, setForm] = useState({
    cliente_id: '', servicio_id: '', empleado: '',
    fecha: new Date().toISOString().split('T')[0], hora: '', notas: ''
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const [{ data: c }, { data: s }] = await Promise.all([
        supabase.from('clientes').select('*').order('nombre'),
        supabase.from('servicios').select('*').order('nombre'),
      ])
      setClientes(c || [])
      setServicios(s || [])
      cargarCitas(fechaFiltro)
    }
    init()
  }, [])

  async function cargarCitas(fecha: string) {
    const { data } = await supabase
      .from('citas')
      .select('*, clientes(nombre), servicios(nombre)')
      .eq('fecha', fecha)
      .order('hora')
    setCitas(data || [])
  }

  async function guardarCita() {
    if (!form.hora || !form.fecha) return
    setLoading(true)
    await supabase.from('citas').insert({
      ...form,
      cliente_id: form.cliente_id || null,
      servicio_id: form.servicio_id || null,
      salon_id: user?.id
    })
    setForm({
      cliente_id: '', servicio_id: '', empleado: '',
      fecha: new Date().toISOString().split('T')[0], hora: '', notas: ''
    })
    setMostrarForm(false)
    cargarCitas(fechaFiltro)
    setLoading(false)
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from('citas').update({ estado }).eq('id', id)
    cargarCitas(fechaFiltro)
  }

  async function eliminarCita(id: string) {
    if (!confirm('¿Eliminar esta cita?')) return
    await supabase.from('citas').delete().eq('id', id)
    cargarCitas(fechaFiltro)
  }

  function colorEstado(estado: string) {
    if (estado === 'completada') return { bg: 'var(--success-light)', color: 'var(--success)' }
    if (estado === 'cancelada') return { bg: 'var(--danger-light)', color: 'var(--danger)' }
    return { bg: 'var(--warning-light)', color: 'var(--warning)' }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={18} color="var(--text-tertiary)" />
          <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>Citas</h1>
          <span style={{
            fontSize: '11px', background: 'var(--bg-elevated)', color: 'var(--text-tertiary)',
            padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border)'
          }}>{citas.length} hoy</span>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent)', border: 'none', color: 'white',
            fontSize: '13px', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer'
          }}
        >
          <Plus size={14} /> Nueva cita
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <input
          type="date"
          value={fechaFiltro}
          onChange={e => { setFechaFiltro(e.target.value); cargarCitas(e.target.value) }}
          style={{ width: 'auto' }}
        />
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {citas.length} citas para este día
        </span>
      </div>

      {mostrarForm && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Nueva cita</h2>
            <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Cliente', key: 'cliente_id', type: 'select', options: clientes },
              { label: 'Servicio', key: 'servicio_id', type: 'select', options: servicios },
              { label: 'Empleado', key: 'empleado', type: 'text', placeholder: 'Nombre del empleado' },
              { label: 'Fecha *', key: 'fecha', type: 'date' },
              { label: 'Hora *', key: 'hora', type: 'time' },
              { label: 'Notas', key: 'notas', type: 'text', placeholder: 'Notas opcionales' },
            ].map((f: any) => (
              <div key={f.key}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                    <option value="">Sin {f.label.toLowerCase()}</option>
                    {f.options?.map((o: any) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={guardarCita}
              disabled={loading}
              style={{
                background: 'var(--accent)', border: 'none', color: 'white',
                fontSize: '13px', padding: '8px 16px', borderRadius: '8px',
                cursor: 'pointer', opacity: loading ? 0.6 : 1
              }}
            >{loading ? 'Guardando...' : 'Guardar cita'}</button>
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
        {citas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            No hay citas para este día
          </div>
        ) : citas.map(cita => {
          const est = colorEstado(cita.estado)
          return (
            <div key={cita.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              transition: 'background .1s'
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '64px', flexShrink: 0 }}>
                <Clock size={13} color="var(--text-tertiary)" />
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {cita.hora?.slice(0, 5)}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {cita.clientes?.nombre || 'Sin cliente'}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {cita.servicios?.nombre || 'Sin servicio'}
                  {cita.empleado && ` · ${cita.empleado}`}
                </p>
              </div>
              {cita.notas && (
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cita.notas}
                </p>
              )}
              <span style={{
                fontSize: '11px', padding: '3px 10px', borderRadius: '99px',
                background: est.bg, color: est.color, fontWeight: '500'
              }}>
                {cita.estado}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => cambiarEstado(cita.id, 'completada')}
                  title="Completar"
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--success)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => cambiarEstado(cita.id, 'cancelada')}
                  title="Cancelar"
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
                >
                  <X size={14} />
                </button>
                <button
                  onClick={() => eliminarCita(cita.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', borderRadius: '6px', fontSize: '12px' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
                >
                  Eliminar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}