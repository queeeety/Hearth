import { NavLink } from 'react-router-dom'
import { Home, ClipboardCheck, ShoppingCart, ListTodo, User } from 'lucide-react'

const TABS = [
  { to: '/',         icon: Home,          label: 'Home'    },
  { to: '/chores',   icon: ClipboardCheck, label: 'Chores'  },
  { to: '/buyings',  icon: ShoppingCart,  label: 'Supplies' },
  { to: '/my-work',  icon: ListTodo,      label: 'My Work' },
  { to: '/me',       icon: User,          label: 'Me'      },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[rgba(60,60,67,0.12)] z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-[49px]">
        {TABS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-green-primary' : 'text-[rgba(60,60,67,0.45)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
