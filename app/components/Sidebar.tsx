'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, ShoppingCart, Users,
  ClipboardList, Package, Scissors, UserCog, BarChart2, LogOut, ChevronRight
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
  { label: 'Reportes', icon: BarChart2, href: '/dashboard/reportes' },
  { label: 'Empleados', icon: UserCog, href: '/dashboard/empleados' },
  { label: 'Servicios', icon: Scissors, href: '/dashboard/servicios' },
  { label: 'Productos', icon: Package, href: '/dashboard/productos' },
]

export default function Sidebar({ rol, onRolChange, salonId }: {
  rol: string
  onRolChange?: (rol: string) => void
  salonId?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: '220px', flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
          background: 'linear-gradient(135deg, #5b5bd6, #7c6af7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '700', color: 'white'
        }}>S</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-.01em' }}>Mi Salón</p>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
            Plan Pro · {rol === 'admin' ? 'Admin' : 'Cajera'}
          </p>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        <p style={{
          fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500',
          padding: '8px 8px 4px', textTransform: 'uppercase', letterSpacing: '.08em'
        }}>Principal</p>

        {menuCajera.map((item) => {
          const active = pathname === item.href
          return (
            <button key={item.href} onClick={() => router.push(item.href)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
              padding: '7px 10px', fontSize: '13px', border: 'none', borderRadius: '7px',
              background: active ? 'var(--bg-hover)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: active ? '500' : '400',
              cursor: 'pointer', transition: 'all .1s', textAlign: 'left',
              marginBottom: '1px',
              borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)' }}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          )
        })}

        {rol === 'admin' && (
          <>
            <p style={{
              fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500',
              padding: '14px 8px 4px', textTransform: 'uppercase', letterSpacing: '.08em'
            }}>Administración</p>
            {menuAdmin.map((item) => {
              const active = pathname === item.href
              return (
                <button key={item.href} onClick={() => router.push(item.href)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
                  padding: '7px 10px', fontSize: '13px', border: 'none', borderRadius: '7px',
                  background: active ? 'var(--bg-hover)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: active ? '500' : '400',
                  cursor: 'pointer', transition: 'all .1s', textAlign: 'left',
                  marginBottom: '1px',
                  borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)' }}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              )
            })}
          </>
        )}
      </nav>

      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
        {onRolChange && (
          <button onClick={() => onRolChange(rol === 'admin' ? 'cajera' : 'admin')} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 10px', fontSize: '12px', border: 'none', borderRadius: '7px',
            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
            marginBottom: '2px'
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >
            <span>{rol === 'admin' ? '← Vista cajera' : '→ Vista admin'}</span>
            <ChevronRight size={12} />
          </button>
        )}
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
          padding: '7px 10px', fontSize: '13px', border: 'none', borderRadius: '7px',
          background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--danger)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}