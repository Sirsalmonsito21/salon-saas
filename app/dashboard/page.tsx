'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ShoppingCart, Calendar, Users, Cake } from 'lucide-react'

export default function Dashboard() {
  const [ventas, setVentas] = useState(0)
  const [citas, setCitas] = useState(0)
  const [clientes, setClientes] = useState(0)
  const [cumples, setCumples] = useState(0)

  useEffect(() => {
    async function cargarDatos() {
      const hoy = new Date().toISOString().split('T')[0]

      const [{ data: v }, { data: c }, { data: cl }] = await Promise.all([
        supabase.from('ventas').select('total').gte('created_at', hoy),
        supabase.from('citas').select('id').eq('fecha', hoy),
        supabase.from('clientes').select('fecha_nac'),
      ])

      const totalVentas = (v || []).reduce((acc: number, x: any) => acc + parseFloat(x.total), 0)
      setVentas(totalVentas)
      setCitas((c || []).length)
      setClientes((cl || []).length)

      const hoyDate = new Date()
      const cumpleHoy = (cl || []).filter((c: any) => {
        if (!c.fecha_nac) return false
        const cumple = new Date(c.fecha_nac)
        return cumple.getDate() === hoyDate.getDate() && cumple.getMonth() === hoyDate.getMonth()
      })
      setCumples(cumpleHoy.length)
    }
    cargarDatos()
  }, [])

  const metrics = [
    { label: 'Ventas hoy', value: `S/ ${ventas.toFixed(2)}`, sub: 'ingresos del día', icon: ShoppingCart, color: 'var(--accent)' },
    { label: 'Citas hoy', value: `${citas}`, sub: 'agendadas', icon: Calendar, color: '#8b5cf6' },
    { label: 'Clientes', value: `${clientes}`, sub: 'registrados', icon: Users, color: 'var(--success)' },
    { label: 'Cumpleaños hoy', value: `${cumples}`, sub: 'clientes', icon: Cake, color: 'var(--warning)' },
  ]

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>Inicio</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{m.label}</span>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'var(--bg-elevated)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: m.color
              }}>
                <m.icon size={14} />
              </div>
            </div>
            <p style={{ fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)' }}>{m.value}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '16px'
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>Citas del día</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
            No hay citas para hoy
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '16px'
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>Cumpleaños esta semana</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
            No hay cumpleaños esta semana
          </p>
        </div>
      </div>
    </>
  )
}