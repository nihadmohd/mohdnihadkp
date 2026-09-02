'use client'

// Mobile bottom tab bar — app-like navigation (5 tabs + safe area support)
import { motion } from 'framer-motion'
import { Home, Newspaper, ShoppingBag, Briefcase, LayoutGrid, type LucideIcon } from 'lucide-react'
import { MOBILE_TABS } from '@/lib/constants'
import { navigate } from '@/hooks/use-hash-router'

const TAB_ICONS: Record<string, LucideIcon> = {
  home: Home,
  newspaper: Newspaper,
  'shopping-bag': ShoppingBag,
  briefcase: Briefcase,
  menu: LayoutGrid,
}

export function BottomNav({ route }: { route: { path: string } }) {
  const isActive = (path: string) =>
    path === '/' ? route.path === '/' : route.path.startsWith(path)
  // "More" is active for any path not covered by the other tabs
  const isMoreActive =
    route.path.startsWith('/more') ||
    !MOBILE_TABS.some((t) => t.path !== '/more' && isActive(t.path))

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border/70 pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {MOBILE_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.icon] || LayoutGrid
          const active = tab.path === '/more' ? isMoreActive : isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={tab.label}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute top-0 w-9 h-1 rounded-b-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon className="size-[21px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
