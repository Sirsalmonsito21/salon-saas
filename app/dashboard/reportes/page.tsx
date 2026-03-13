'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart2, TrendingUp, Users, ShoppingCart } from 'lucide-react'

export default function Reportes() {
  const [ventas, setVentas] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [pagos, setPagos] = useState<any[]>([])
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null)
  const [itemsVenta, setItemsVenta] = useState<any[]>([])
  const [pagosVenta, setPagosVenta] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filtro, setFiltro] = useState('hoy')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  useEffect(() => { cargarDatos() }, [filtro])

  function getRango() {
    const hoy = new Date()
    const inicio = new Date()
    if (filtro === 'hoy') {
      inicio.setHours(0, 0, 0, 0)
    } else if (filtro === 'semana') {
      inicio.setDate(hoy.getDate() - 7)
    } else if (filtro === 'mes') {
      inicio.setDate(1)
    } else if (filtro === 'custom') {
      return { inicio: fechaInicio, fin: fechaFin + 'T23:59:59' }
    }
    return { inicio: inicio.toISOString(), fin: hoy.toISOString() }
  }

  async function cargarDatos() {
    setLoading(true)
    const { inicio, fin } = getRango()
    if (!inicio || !fin) { setLoading(false); return }

    const [{ data: v }, { data: i }, { data: p }] = await Promise.all([
      supabase.from('ventas').select('*').gte('created_at', inicio).lte('created_at', fin).order('created_at', { ascending: false }),
      supabase.from('venta_items').select('*'),
      supabase.from('venta_pagos').select('*'),
    ])

    setVentas(v || [])
    setItems(i || [])
    setPagos(p || [])
    setLoading(false)
  }

  async function verDetalleVenta(venta: any) {
    setVentaSeleccionada(venta)
    const [{ data: i }, { data: p }] = await Promise.all([
      supabase.from('venta_items').select('*').eq('venta_id', venta.id),
      supabase.from('venta_pagos').select('*').eq('venta_id', venta.id),
    ])
    setItemsVenta(i || [])
    setPagosVenta(p || [])
  }

  const totalIngresos = ventas.reduce((acc, v) => acc + parseFloat(v.total), 0)

  const porEmpleado = ventas.reduce((acc: any, v) => {
    const nombre = v.empleado_nombre || 'Sin empleado'
    if (!acc[nombre]) acc[nombre] = { total: 0, ventas: 0 }
    acc[nombre].total += parseFloat(v.total)
    acc[nombre].ventas += 1
    return acc
  }, {})

  const ventaIds = ventas.map(v => v.id)
  const itemsFiltrados = items.filter(i => ventaIds.includes(i.venta_id))
  const pagosFiltrados = pagos.filter(p => ventaIds.includes(p.venta_id))

  const porMetodo = pagosFiltrados.reduce((acc: any, p) => {
    if (!acc[p.metodo]) acc[p.metodo] = 0
    acc[p.metodo] += parseFloat(p.monto)
    return acc
  }, {})

  const porItem = itemsFiltrados.reduce((acc: any, i) => {
    if (!acc[i.descripcion]) acc[i.descripcion] = { total: 0, cantidad: 0 }
    acc[i.descripcion].total += parseFloat(i.precio) * i.cantidad
    acc[i.descripcion].cantidad += i.cantidad
    return acc
  }, {})

  const filtros = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Semana' },
    { value: 'mes', label: 'Este mes' },
    { value: 'custom', label: 'Personalizado' },
  ]

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <BarChart2 size={18} color="var(--text-tertiary)" />
        <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>Reportes</h1>
      </div>

      {ventaSeleccionada && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '24px', width: '400px', maxHeight: '80vh', overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>Detalle de venta</h2>
              <button onClick={() => setVentaSeleccionada(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Fecha: <span style={{ color: 'var(--text-primary)' }}>{new Date(ventaSeleccionada.created_at).toLocaleString('es-PE')}</span></p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Empleado: <span style={{ color: 'var(--text-primary)' }}>{ventaSeleccionada.empleado_nombre || '—'}</span></p>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Items</p>
              {itemsVenta.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.descripcion} x{item.cantidad}</span>
                  <span style={{ color: 'var(--text-primary)' }}>S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pagos</p>
              {pagosVenta.length > 0 ? pagosVenta.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{p.metodo}</span>
                  <span style={{ color: 'var(--text-primary)' }}>S/ {parseFloat(p.monto).toFixed(2)}</span>
                </div>
              )) : (
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{ventaSeleccionada.metodo_pago}</p>
              )}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>S/ {parseFloat(ventaSeleccionada.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filtros.map(f => (
          <button key={f.value} onClick={() => setFiltro(f.value)} style={{
            padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
            border: `1px solid ${filtro === f.value ? 'var(--accent)' : 'var(--border)'}`,
            background: filtro === f.value ? 'var(--accent-light)' : 'var(--bg-elevated)',
            color: filtro === f.value ? 'var(--accent)' : 'var(--text-secondary)',
          }}>{f.label}</button>
        ))}
        {filtro === 'custom' && (
          <>
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={{ width: 'auto' }} />
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{ width: 'auto' }} />
            <button onClick={cargarDatos} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
              background: 'var(--accent)', border: 'none', color: 'white', cursor: 'pointer'
            }}>Buscar</button>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Ingresos totales', value: `S/ ${totalIngresos.toFixed(2)}`, icon: TrendingUp, color: 'var(--success)' },
          { label: 'Total ventas', value: ventas.length, icon: ShoppingCart, color: 'var(--accent)' },
          { label: 'Empleados activos', value: Object.keys(porEmpleado).length, icon: Users, color: '#8b5cf6' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{m.label}</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color }}>
                <m.icon size={14} />
              </div>
            </div>
            <p style={{ fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>Por empleado</h2>
          {Object.keys(porEmpleado).length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>Sin datos</p>
          ) : Object.entries(porEmpleado).sort((a: any, b: any) => b[1].total - a[1].total).map(([nombre, data]: any) => (
            <div key={nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{nombre}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{data.ventas} venta{data.ventas !== 1 ? 's' : ''}</p>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--success)' }}>S/ {data.total.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>Por método de pago</h2>
          {Object.keys(porMetodo).length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>Sin datos</p>
          ) : Object.entries(porMetodo).sort((a: any, b: any) => b[1] - a[1]).map(([metodo, total]: any) => (
            <div key={metodo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{metodo}</p>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--accent)' }}>S/ {total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>Servicios y productos más vendidos</h2>
          {Object.keys(porItem).length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>Sin datos</p>
          ) : Object.entries(porItem).sort((a: any, b: any) => b[1].total - a[1].total).slice(0, 8).map(([nombre, data]: any) => (
            <div key={nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{nombre}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{data.cantidad} unidad{data.cantidad !== 1 ? 'es' : ''}</p>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>S/ {data.total.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>Detalle de ventas</h2>
          {ventas.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>Sin ventas en este período</p>
          ) : ventas.map(v => (
            <div key={v.id}
              onClick={() => verDetalleVenta(v)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer'
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{v.empleado_nombre || 'Sin empleado'}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {new Date(v.created_at).toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>S/ {parseFloat(v.total).toFixed(2)}</p>
                <p style={{ fontSize: '11px', color: 'var(--accent)' }}>Ver detalle →</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}