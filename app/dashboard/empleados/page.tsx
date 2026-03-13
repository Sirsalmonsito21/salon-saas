'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserCog, Plus, X, Phone, Mail, Check } from 'lucide-react'

export default function Empleados() {
  const [user, setUser] = useState<any>(null)
  const [empleados, setEmpleados] = useState<any[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', cargo: '', telefono: '', email: '',
    activo: true
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      cargarEmpleados()
    }
    init()
  }, [])

  async function cargarEmpleados() {
    const { data } = await supabase
      .from('empleados')
      .select('*')
      .order('nombre')
    setEmpleados(data || [])
  }

  async function guardarEmpleado() {
    if (!form.nombre) return
    setLoading(true)
    await supabase.from('empleados').insert({ ...form, salon_id: user?.id })
    setForm({ nombre: '', cargo: '', telefono: '', email: '', activo: true })
    setMostrarForm(false)
    cargarEmpleados()
    setLoading(false)
  }

  async function toggleActivo(id: string, activo: boolean) {
    await supabase.from('empleados').update({ activo: !activo }).eq('id', id)
    cargarEmpleados()
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este empleado?')) return
    await supabase.from('empleados').delete().eq('id', id)
    cargarEmpleados()
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserCog size={18} color="var(--text-tertiary)" />
          <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>Empleados</h1>
          <span style={{
            fontSize: '11px', background: 'var(--bg-elevated)', color: 'var(--text-tertiary)',
            padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border)'
          }}>{empleados.length}</span>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent)', border: 'none', color: 'white',
            fontSize: '13px', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer'
          }}
        >
          <Plus size={14} /> Nuevo empleado
        </button>
      </div>

      {mostrarForm && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Nuevo empleado</h2>
            <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Nombre *', key: 'nombre', type: 'text', placeholder: 'Nombre completo' },
              { label: 'Cargo', key: 'cargo', type: 'text', placeholder: 'Ej: Estilista, Manicurista' },
              { label: 'Teléfono', key: 'telefono', type: 'text', placeholder: '999 999 999' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'email@ejemplo.com' },
            ].map(f => (
              <div key={f.key}>
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
              onClick={guardarEmpleado}
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
        {empleados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            No hay empleados registrados
          </div>
        ) : empleados.map(emp => (
          <div key={emp.id} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            transition: 'background .1s'
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: emp.activo ? 'var(--accent-light)' : 'var(--bg-elevated)',
              color: emp.activo ? 'var(--accent)' : 'var(--text-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '500', flexShrink: 0
            }}>
              {emp.nombre.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{emp.nombre}</p>
                {emp.cargo && (
                  <span style={{
                    fontSize: '11px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                    padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border)'
                  }}>{emp.cargo}</span>
                )}
                <span style={{
                  fontSize: '11px',
                  background: emp.activo ? 'var(--success-light)' : 'var(--bg-elevated)',
                  color: emp.activo ? 'var(--success)' : 'var(--text-tertiary)',
                  padding: '2px 8px', borderRadius: '99px'
                }}>{emp.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                {emp.telefono && (
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={10} /> {emp.telefono}
                  </span>
                )}
                {emp.email && (
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={10} /> {emp.email}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => toggleActivo(emp.id, emp.activo)}
                style={{
                  fontSize: '12px', padding: '5px 12px', borderRadius: '6px',
                  border: `1px solid ${emp.activo ? 'var(--border)' : 'var(--success)'}`,
                  background: emp.activo ? 'var(--bg-elevated)' : 'var(--success-light)',
                  color: emp.activo ? 'var(--text-secondary)' : 'var(--success)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Check size={12} />
                {emp.activo ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => eliminar(emp.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}