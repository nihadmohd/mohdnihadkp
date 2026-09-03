'use client'

// Desktop top navbar + mobile compact header — two different designs.
// Mobile: compact top bar + bottom tab bar (app-like).
// Desktop: full horizontal nav with live badge, search, theme, CTA.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Sun, Moon, Search, Menu, LayoutDashboard, UserRound, LogIn,
  ChevronRight, Sparkles, Radio,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle,
} from '@/components/ui/sheet'
import { useSession, isAdmin } from '@/components/site/site-context'
import { NAV_LINKS, MORE_LINKS, SITE, CV_URL } from '@/lib/constants'
import { LiveBadge } from '@/components/site/live-badge'

interface NavProps {
  route: { path: string; segments: string[] }
  announcement?: string
  onCommand: () => void
}

export function SiteNav({ route, announcement, onCommand }: NavProps) {
  const { user } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  const isActive = (path: string) =>
    path === '/' ? route.path === '/' : route.path.startsWith(path)

  return (
    <>
      {announcement && (
        <div className="relative z-40 bg-primary text-primary-foreground text-center text-[13px] font-medium px-4 py-2">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-3.5 shrink-0" aria-hidden />
            {announcement}
          </span>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled ? 'glass border-b border-border/70 shadow-sm' : 'bg-transparent'
        }`}
      >
        {/* ── Mobile header (compact) ── */}
        <div className="lg:hidden">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 min-w-0"
              aria-label={`${SITE.name} — home`}
            >
              <span className="relative grid place-items-center size-8 rounded-xl bg-primary text-primary-foreground font-display font-bold text-[11px] tracking-tight glow-sm" aria-hidden>
                MN
              </span>
              <span className="font-display font-semibold text-[15px] tracking-tight truncate">
                Nihad<span className="text-primary">KP</span>
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <LiveBadge compact />
              <button
                onClick={onCommand}
                className="grid place-items-center size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Search (Ctrl+K)"
              >
                <Search className="size-[18px]" />
              </button>
              <Sheet open={mobileMenu} onOpenChange={setMobileMenu}>
                <SheetTrigger asChild>
                  <button
                    className="grid place-items-center size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Open menu"
                  >
                    <Menu className="size-[22px]" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] max-w-xs p-0 flex flex-col">
                  <SheetTitle className="sr-only">Site menu</SheetTitle>
                  <div className="p-5 pb-2 flex items-center gap-3 border-b border-border/60">
                    {user?.image ? (
                       
                      <img src={user.image} alt={user.name || 'You'} className="size-10 rounded-full object-cover" />
                    ) : (
                      <span className="grid place-items-center size-10 rounded-full bg-primary/15 text-primary font-semibold">
                        {(user?.name || 'G')[0].toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email || 'Welcome'}</p>
                    </div>
                  </div>
                  <nav className="flex-1 overflow-y-auto scrollbar-slim p-3 space-y-1" aria-label="Mobile menu">
                    {[...NAV_LINKS, ...MORE_LINKS].map((link) => (
                      <MobileMenuItem
                        key={link.path}
                        label={link.label}
                        icon={link.icon}
                        active={isActive(link.path)}
                        path={link.path}
                        onClick={() => setMobileMenu(false)}
                      />
                    ))}
                    {isAdmin(user) && (
                      <MobileMenuItem
                        label="Admin Dashboard"
                        icon="layout-dashboard"
                        accent
                        path="/admin"
                        onClick={() => setMobileMenu(false)}
                      />
                    )}
                  </nav>
                  <div className="p-4 border-t border-border/60 space-y-2">
                    {user ? (
                      <>
                        <Button className="w-full" asChild onClick={() => setMobileMenu(false)}>
                          <Link href="/account"><UserRound className="size-4 mr-2" /> My Account</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full" asChild onClick={() => setMobileMenu(false)}>
                          <Link href="/login"><LogIn className="size-4 mr-2" /> Sign In</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild onClick={() => setMobileMenu(false)}>
                          <Link href="/register">Create Account</Link>
                        </Button>
                      </>
                    )}
                    <a
                      href={CV_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      View CV <ChevronRight className="size-3.5" />
                    </a>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* ── Desktop navbar ── */}
        <div className="hidden lg:block">
          <div className="mx-auto max-w-6xl px-6 h-16 flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-3 shrink-0 group"
              aria-label={`${SITE.name} — home`}
            >
              <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs glow-sm transition-transform group-hover:scale-105" aria-hidden>
                MN
              </span>
              <span className="font-display font-semibold text-lg tracking-tight">
                Nihad<span className="text-primary">KP</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </Link>
              ))}
              <Link
                href="/ventures"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/ventures')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                Ventures
              </Link>
            </nav>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <LiveBadge />
              <button
                onClick={onCommand}
                className="flex items-center gap-2 h-9 pl-3 pr-2 rounded-xl border border-border bg-card/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                aria-label="Open search"
              >
                <Search className="size-3.5" />
                <span className="hidden xl:inline">Search</span>
                <kbd className="hidden xl:inline-flex items-center h-5 px-1.5 rounded border bg-muted text-[10px] font-mono">Ctrl K</kbd>
              </button>
              <ThemeToggle />
              {isAdmin(user) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10"
                  asChild
                >
                  <Link href="/admin">
                    <LayoutDashboard className="size-4 mr-1.5" /> Admin
                  </Link>
                </Button>
              )}
              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-colors"
                  aria-label="Account menu"
                >
                  {user.image ? (
                     
                    <img src={user.image} alt={user.name || 'You'} className="size-6 rounded-full object-cover" />
                  ) : (
                    <span className="grid place-items-center size-6 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                      {(user.name || 'U')[0].toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium max-w-24 truncate">{user.name || 'Account'}</span>
                </Link>
              ) : (
                <>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="glow-sm" asChild>
                    <Link href="/contact"><Radio className="size-4 mr-2" /> Hire Me</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

function MobileMenuItem({
  label, icon, active, accent, onClick, path,
}: {
  label: string
  icon: string
  active?: boolean
  accent?: boolean
  onClick: () => void
  path?: string
}) {
  const Icon = iconMap[icon] || Sparkles
  const className = `w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[15px] font-medium transition-colors ${
    accent
      ? 'text-primary bg-primary/10'
      : active
      ? 'text-primary bg-primary/10'
      : 'text-foreground/80 hover:bg-muted'
  }`

  if (path) {
    return (
      <Link href={path} onClick={onClick} className={className} aria-current={active ? 'page' : undefined}>
        <Icon className="size-[18px]" aria-hidden />
        {label}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      className={className}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="size-[18px]" aria-hidden />
      {label}
    </button>
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])
  const dark = resolvedTheme === 'dark'
  return (
    <button
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="grid place-items-center size-9 rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
      aria-label={mounted ? (dark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle color theme'}
    >
      {mounted ? (dark ? <Sun className="size-4" /> : <Moon className="size-4" />) : <Moon className="size-4" />}
    </button>
  )
}

// Shared icon map (string → component) for menu items
import {
  Home, Newspaper, ShoppingBag, Briefcase, User, Network, Mail, UserRound as UserRoundIcon,
  LayoutDashboard as LayoutDashboardIcon, type LucideIcon,
} from 'lucide-react'

export const iconMap: Record<string, LucideIcon> = {
  home: Home,
  newspaper: Newspaper,
  'shopping-bag': ShoppingBag,
  briefcase: Briefcase,
  user: User,
  network: Network,
  mail: Mail,
  'user-round': UserRoundIcon,
  'layout-dashboard': LayoutDashboardIcon,
  search: Search,
  menu: Menu,
  sparkles: Sparkles,
}
