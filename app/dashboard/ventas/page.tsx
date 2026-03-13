'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { ShoppingCart, Plus, Trash2, CreditCard, Banknote, Smartphone, Printer } from 'lucide-react'

export default function Ventas() {
  const [user, setUser] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [empleados, setEmpleados] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [clienteId, setClienteId] = useState('')
  const [empleadoId, setEmpleadoId] = useState('')
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [pagos, setPagos] = useState<any[]>([{ metodo: 'efectivo', monto: '' }])
  const [loading, setLoading] = useState(false)
  const [voucher, setVoucher] = useState<any>(null)
  const voucherRef = useRef<HTMLDivElement>(null)

  const metodos = [
    { value: 'efectivo', label: 'Efectivo', icon: Banknote },
    { value: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
    { value: 'yape', label: 'Yape', icon: Smartphone },
    { value: 'plin', label: 'Plin', icon: Smartphone },
  ]

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const [{ data: c }, { data: s }, { data: p }, { data: e }, { data: v }] = await Promise.all([
        supabase.from('clientes').select('*').order('nombre'),
        supabase.from('servicios').select('*').order('nombre'),
        supabase.from('productos').select('*').order('nombre'),
        supabase.from('empleados').select('*').eq('activo', true).order('nombre'),
        supabase.from('ventas').select('*').order('created_at', { ascending: false }).limit(15)
      ])
      setClientes(c || [])
      setServicios(s || [])
      setProductos(p || [])
      setEmpleados(e || [])
      setVentas(v || [])
    }
    init()
  }, [])

  function agregarServicio(s: any) {
    const existe = items.find(i => i.ref_id === s.id && i.tipo === 'servicio')
    if (existe) {
      setItems(items.map(i => i.ref_id === s.id && i.tipo === 'servicio' ? { ...i, cantidad: i.cantidad + 1 } : i))
    } else {
      setItems([...items, { ref_id: s.id, tipo: 'servicio', descripcion: s.nombre, precio: s.precio_variable ? 0 : s.precio, cantidad: 1, precio_variable: s.precio_variable }])
    }
  }

  function agregarProducto(p: any) {
    const existe = items.find(i => i.ref_id === p.id && i.tipo === 'producto')
    if (existe) {
      setItems(items.map(i => i.ref_id === p.id && i.tipo === 'producto' ? { ...i, cantidad: i.cantidad + 1 } : i))
    } else {
      setItems([...items, { ref_id: p.id, tipo: 'producto', descripcion: p.nombre, precio: p.precio, cantidad: 1, precio_variable: false }])
    }
  }

  function agregarItemCustom() {
    setItems([...items, { ref_id: null, tipo: 'custom', descripcion: '', precio: 0, cantidad: 1, precio_variable: false }])
  }

  function actualizarItem(index: number, campo: string, valor: any) {
    setItems(items.map((item, i) => i === index ? { ...item, [campo]: valor } : item))
  }

  function eliminarItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function agregarPago() {
    setPagos([...pagos, { metodo: 'efectivo', monto: '' }])
  }

  function actualizarPago(index: number, campo: string, valor: any) {
    setPagos(pagos.map((p, i) => i === index ? { ...p, [campo]: valor } : p))
  }

  function eliminarPago(index: number) {
    if (pagos.length === 1) return
    setPagos(pagos.filter((_, i) => i !== index))
  }

  const total = items.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0)
  const totalPagado = pagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0)
  const diferencia = totalPagado - total

  async function procesarVenta() {
    if (items.length === 0 || !empleadoId) return
    setLoading(true)

    const empleado = empleados.find(e => e.id === empleadoId)
    const cliente = clientes.find(c => c.id === clienteId)

    const { data: venta, error } = await supabase.from('ventas').insert({
      cliente_id: clienteId || null,
      empleado_id: empleadoId,
      empleado_nombre: empleado?.nombre,
      total,
      metodo_pago: pagos.map(p => p.metodo).join('+'),
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

      await supabase.from('venta_pagos').insert(
        pagos.filter(p => parseFloat(p.monto) > 0).map(p => ({
          venta_id: venta.id,
          metodo: p.metodo,
          monto: parseFloat(p.monto),
          salon_id: user?.id
        }))
      )

      for (const item of items) {
        if (item.tipo === 'producto' && item.ref_id) {
          const prod = productos.find(p => p.id === item.ref_id)
          if (prod) {
            await supabase.from('productos').update({
              stock: Math.max(0, prod.stock - item.cantidad)
            }).eq('id', item.ref_id)
          }
        }
      }

      setVoucher({
        id: venta.id,
        fecha: new Date().toLocaleString('es-PE'),
        cliente: cliente?.nombre || 'Sin cliente',
        empleado: empleado?.nombre,
        items: [...items],
        pagos: [...pagos],
        total,
        notas
      })

      setItems([])
      setClienteId('')
      setEmpleadoId('')
      setNotas('')
      setPagos([{ metodo: 'efectivo', monto: '' }])

      const { data: v } = await supabase.from('ventas').select('*').order('created_at', { ascending: false }).limit(15)
      setVentas(v || [])
    }
    setLoading(false)
  }

  function imprimirVoucher() {
    const contenido = voucherRef.current?.innerHTML
    const ventana = window.open('', '_blank')
    if (!ventana || !contenido) return
    ventana.document.write(`
      <html><head><title>Voucher</title>
      <style>
        body { font-family: monospace; font-size: 13px; padding: 20px; max-width: 300px; margin: 0 auto; }
        h2 { text-align: center; font-size: 15px; }
        .linea { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; }
        .total { font-weight: bold; font-size: 15px; }
        .center { text-align: center; }
      </style>
      </head><body>${contenido}</body></html>
    `)
    ventana.document.close()
    ventana.print()
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <ShoppingCart size={18} color="var(--text-tertiary)" />
        <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>Caja / Ventas</h1>
      </div>

      {voucher && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '24px', width: '340px'
          }}>
            <div ref={voucherRef}>
              <h2 style={{ textAlign: 'center', fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Mi Salón</h2>
              <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>{voucher.fecha}</p>
              <div style={{ borderTop: '1px dashed var(--border)', marginBottom: '12px' }} />
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Cliente: <span style={{ color: 'var(--text-primary)' }}>{voucher.cliente}</span></p>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Atendido por: <span style={{ color: 'var(--text-primary)' }}>{voucher.empleado}</span></p>
              </div>
              <div style={{ borderTop: '1px dashed var(--border)', marginBottom: '12px' }} />
              {voucher.items.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.descripcion} x{item.cantidad}</span>
                  <span style={{ color: 'var(--text-primary)' }}>S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed var(--border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>S/ {voucher.total.toFixed(2)}</span>
              </div>
              {voucher.pagos.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{p.metodo}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>S/ {parseFloat(p.monto).toFixed(2)}</span>
                </div>
              ))}
              {voucher.notas && (
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Nota: {voucher.notas}</p>
              )}
              <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '12px' }}>¡Gracias por su visita!</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={imprimirVoucher}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: 'var(--accent)', border: 'none', color: 'white',
                  fontSize: '13px', padding: '10px', borderRadius: '8px', cursor: 'pointer'
                }}
              >
                <Printer size={14} /> Imprimir
              </button>
              <button
                onClick={() => setVoucher(null)}
                style={{
                  flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: '13px',
                  padding: '10px', borderRadius: '8px', cursor: 'pointer'
                }}
              >Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>Nueva venta</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Empleado <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select value={empleadoId} onChange={e => setEmpleadoId(e.target.value)}
                  style={{ borderColor: !empleadoId ? 'var(--danger)' : 'var(--border)' }}>
                  <option value="">Seleccionar empleado</option>
                  {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Cliente (opcional)</label>
                <select value={clienteId} onChange={e => setClienteId(e.target.value)}>
                  <option value="">Sin cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>

            {servicios.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Servicios</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {servicios.map(s => (
                    <button key={s.id} onClick={() => agregarServicio(s)} style={{
                      fontSize: '12px', padding: '5px 10px', borderRadius: '6px',
                      border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)', cursor: 'pointer'
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
                    >
                      {s.nombre} {s.precio_variable ? '(variable)' : `S/ ${s.precio}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {productos.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Productos</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {productos.map(p => (
                    <button key={p.id} onClick={() => agregarProducto(p)} style={{
                      fontSize: '12px', padding: '5px 10px', borderRadius: '6px',
                      border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)', cursor: 'pointer'
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
                    >
                      {p.nombre} S/ {p.precio} <span style={{ color: 'var(--text-tertiary)' }}>({p.stock})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" value={item.descripcion}
                    onChange={e => actualizarItem(i, 'descripcion', e.target.value)}
                    placeholder="Descripción" style={{ flex: 1 }} />
                  <input type="number" value={item.precio}
                    onChange={e => actualizarItem(i, 'precio', e.target.value)}
                    placeholder="Precio" style={{ width: '90px' }} />
                  <input type="number" value={item.cantidad}
                    onChange={e => actualizarItem(i, 'cantidad', parseInt(e.target.value) || 1)}
                    placeholder="Cant." style={{ width: '60px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', width: '75px', textAlign: 'right' }}>
                    S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                  </span>
                  <button onClick={() => eliminarItem(i)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
                  ><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            <button onClick={agregarItemCustom} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', color: 'var(--accent)',
              fontSize: '12px', cursor: 'pointer', padding: '0'
            }}>
              <Plus size={12} /> Agregar item manual
            </button>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>Pagos</h2>

            {pagos.map((pago, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                  {metodos.map(m => (
                    <button key={m.value} onClick={() => actualizarPago(i, 'metodo', m.value)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '4px', padding: '7px', borderRadius: '8px', fontSize: '12px',
                      border: `1px solid ${pago.metodo === m.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: pago.metodo === m.value ? 'var(--accent-light)' : 'var(--bg-elevated)',
                      color: pago.metodo === m.value ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}>
                      <m.icon size={11} /> {m.label}
                    </button>
                  ))}
                </div>
                <input type="number" value={pago.monto}
                  onChange={e => actualizarPago(i, 'monto', e.target.value)}
                  placeholder="Monto" style={{ width: '100px' }} />
                {pagos.length > 1 && (
                  <button onClick={() => eliminarPago(i)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
                  ><Trash2 size={14} /></button>
                )}
              </div>
            ))}

            <button onClick={agregarPago} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', color: 'var(--accent)',
              fontSize: '12px', cursor: 'pointer', padding: '0', marginBottom: '16px'
            }}>
              <Plus size={12} /> Agregar método de pago
            </button>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)' }}>S/ {total.toFixed(2)}</span>
              </div>
              {totalPagado > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {diferencia >= 0 ? 'Vuelto' : 'Falta'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: diferencia >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    S/ {Math.abs(diferencia).toFixed(2)}
                  </span>
                </div>
              )}
              <textarea value={notas} onChange={e => setNotas(e.target.value)}
                placeholder="Notas (opcional)" rows={2} style={{ marginBottom: '12px' }} />
              <button onClick={procesarVenta} disabled={loading || items.length === 0 || !empleadoId} style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                background: items.length === 0 || !empleadoId ? 'var(--bg-elevated)' : 'var(--success)',
                border: 'none', color: items.length === 0 || !empleadoId ? 'var(--text-tertiary)' : 'white',
                fontSize: '14px', fontWeight: '500',
                cursor: items.length === 0 || !empleadoId ? 'not-allowed' : 'pointer', transition: 'all .15s'
              }}>
                {loading ? 'Procesando...' : !empleadoId ? 'Selecciona un empleado' : `Cobrar S/ ${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px' }}>Ventas recientes</h2>
          {ventas.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px 0' }}>No hay ventas aún</p>
          ) : ventas.map(v => (
            <div key={v.id} style={{
              padding: '10px 0', borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>S/ {parseFloat(v.total).toFixed(2)}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {new Date(v.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {v.empleado_nombre && (
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{v.empleado_nombre}</p>
              )}
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{v.metodo_pago}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}