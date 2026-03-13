'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ClipboardList, Plus, X, Clock, CheckCircle } from 'lucide-react'

export default function Asistencias() {
  const [user, setUser] = useState<any>(null)
  const [asistencias, setAsistencias] = useState<any[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0])
  const [form, setForm] = useState({
    empleado_nombre: '', fecha: new Date().toISOString().split('T')[0],
    hora_entrada: '', hora_salida: '', notas: ''
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      cargarAsistencias(fechaFiltro)
    }
    init()
  }, [])

  async function cargarAsistencias(fecha: string) {
    const { data } = await supabase
      .from('asistencias')
      .select('*')
      .eq('fecha', fecha)
      .order('hora_entrada')
    setAsistencias(data || [])
  }

  async function guardarAsistencia() {
    if (!form.empleado_nombre || !form.hora_entrada) return
    setLoading(true)
    await supabase.from('asistencias').insert({ ...form, salon_id: user?.id })
    setForm({
      empleado_nombre: '', fecha: new Date().toISOString().split('T')[0],
      hora_entrada: '', hora_salida: '', notas: ''
    })
    setMostrarForm(false)
    cargarAsistencias(fechaFiltro)
    setLoading(false)
  }

  async function registrarSalida(id: string) {
    const ahora = new Date().toTimeString().slice(0, 5)
    await supabase.from('asistencias').update({ hora_salida: ahora }).eq('id', id)
    cargarAsistencias(fechaFiltro)
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este registro?')) return
    await supabase.from('asistencias').delete().eq('id', id)
    cargarAsistencias(fechaFiltro)
  }

  function calcularHoras(entrada: string, salida: string) {
    if (!entrada || !salida) return null
    const [eh, em] = entrada.split(':').map(Number)
    const [sh, sm] = salida.split(':').map(Number)
    const minutos = (sh * 60 + sm) - (eh * 60 + em)
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}m`
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardList size={18} color="var(--text-tertiary)" />
          <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>Asistencias</h1>
          <span style={{
            fontSize: '11px', background: 'var(--bg-elevated)', color: 'var(--text-tertiary)',
            padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border)'
          }}>{asistencias.length} hoy</span>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent)', border: 'none', color: 'white',
            fontSize: '13px', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer'
          }}
        >
          <Plus size={14} /> Registrar entrada
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <input
          type="date"
          value={fechaFiltro}
          onChange={e => { setFechaFiltro(e.target.value); cargarAsistencias(e.target.value) }}
          style={{ width: 'auto' }}
        />
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {asistencias.length} registros para este día
        </span>
      </div>

      {mostrarForm && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Registrar asistencia</h2>
            <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Empleado *', key: 'empleado_nombre', type: 'text', placeholder: 'Nombre del empleado' },
              { label: 'Fecha', key: 'fecha', type: 'date' },
              { label: 'Hora entrada *', key: 'hora_entrada', type: 'time' },
              { label: 'Hora salida', key: 'hora_salida', type: 'time' },
              { label: 'Notas', key: 'notas', type: 'text', placeholder: 'Notas opcionales' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={(f as any).placeholder}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={guardarAsistencia}
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
        {asistencias.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            No hay registros para este día
          </div>
        ) : asistencias.map(a => {
          const horas = calcularHoras(a.hora_entrada, a.hora_salida)
          const activo = !a.hora_salida
          return (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              transition: 'background .1s'
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: activo ? 'var(--success-light)' : 'var(--bg-elevated)',
                color: activo ? 'var(--success)' : 'var(--text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '500', flexShrink: 0
              }}>
                {a.empleado_nombre.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{a.empleado_nombre}</p>
                  {activo && (
                    <span style={{
                      fontSize: '11px', background: 'var(--success-light)', color: 'var(--success)',
                      padding: '2px 8px', borderRadius: '99px', fontWeight: '500'
                    }}>En turno</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} /> Entrada: {a.hora_entrada?.slice(0, 5)}
                  </span>
                  {a.hora_salida && (
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={10} /> Salida: {a.hora_salida?.slice(0, 5)}
                    </span>
                  )}
                  {horas && (
                    <span style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={10} /> {horas}
                    </span>
                  )}
                </div>
                {a.notas && (
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{a.notas}</p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activo && (
                  <button
                    onClick={() => registrarSalida(a.id)}
                    style={{
                      fontSize: '12px', padding: '5px 12px', borderRadius: '6px',
                      border: '1px solid var(--success)', background: 'var(--success-light)',
                      color: 'var(--success)', cursor: 'pointer'
                    }}
                  >
                    Registrar salida
                  </button>
                )}
                <button
                  onClick={() => eliminar(a.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}