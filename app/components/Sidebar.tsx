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

export default function Sidebar({ rol }: { rol: string }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-52 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">Mi Salón</p>
        <p className="text-xs text-gray-400 mt-0.5">Plan Pro</p>
      </div>

      <nav className="flex-1 py-2">
        <p className="text-xs text-gray-400 px-4 py-2 uppercase tracking-wider">Principal</p>
        {menuCajera.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
              ${pathname === item.href
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}

        {rol === 'admin' && (
          <>
            <p className="text-xs text-gray-400 px-4 py-2 mt-2 uppercase tracking-wider">Administración</p>
            {menuAdmin.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                  ${pathname === item.href
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}