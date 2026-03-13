'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, ShoppingCart, Users,
  ClipboardList, Package, Scissors, UserCog, BarChart2, LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const menuCajera = [
  { label: 'Inicio', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Citas', icon: Calendar, href: '/dashboard/citas' },
  { label: 'Caja / Ventas', icon: ShoppingCart, href: '/dashboard/ventas' },
  { label: 'Clientes', icon: Users, href: '/dashboard/clientes' },
  { label: 'Asistencias', icon: ClipboardList, href: '/dashboard/asistencias' },
]

const menuAdmin = [
  { label: 'Productos', icon: Package, href: '/dashboard/productos' },
  { label: 'Servicios', icon: Scissors, href: '/dashboard/servicios' },
  { label: 'Empleados', icon: UserCog, href: '/dashboard/empleados' },
  { label: 'Reportes', icon: BarChart2, href: '/dashboard/reportes' },
]

export default function Sidebar({ rol, onRolChange, salonId }: { rol: string, onRolChange?: (rol: string) => void, salonId?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: '220px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: '600', color: 'white'
        }}>S</div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>Mi Salón</p>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Plan Pro</p>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        <p style={{
          fontSize: '11px', color: 'var(--text-tertiary)',
          padding: '12px 20px 6px', textTransform: 'uppercase', letterSpacing: '.06em'
        }}>Principal</p>

        {menuCajera.map((item) => {
          const active = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '7px 20px', fontSize: '13px', border: 'none',
                background: active ? 'var(--bg-hover)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? '500' : '400',
                cursor: 'pointer', transition: 'all .1s', textAlign: 'left',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          )
        })}

        {rol === 'admin' && (
          <>
            <p style={{
              fontSize: '11px', color: 'var(--text-tertiary)',
              padding: '16px 20px 6px', textTransform: 'uppercase', letterSpacing: '.06em'
            }}>Administración</p>
            {menuAdmin.map((item) => {
              const active = pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '7px 20px', fontSize: '13px', border: 'none',
                    background: active ? 'var(--bg-hover)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: active ? '500' : '400',
                    cursor: 'pointer', transition: 'all .1s', textAlign: 'left',
                    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              )
            })}
          </>
        )}
      </nav>

      <div style={{ padding: '12px 12px', borderTop: '1px solid var(--border)' }}>
        {onRolChange && (
          <button
            onClick={() => onRolChange(rol === 'admin' ? 'cajera' : 'admin')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '7px 8px', fontSize: '13px', border: 'none',
              background: 'transparent', color: 'var(--text-tertiary)',
              cursor: 'pointer', borderRadius: '6px', marginBottom: '4px'
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
          >
            {rol === 'admin' ? '← Vista cajera' : '→ Vista admin'}
          </button>
        )}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '7px 8px', fontSize: '13px', border: 'none',
            background: 'transparent', color: 'var(--text-tertiary)',
            cursor: 'pointer', transition: 'color .1s', borderRadius: '6px',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}