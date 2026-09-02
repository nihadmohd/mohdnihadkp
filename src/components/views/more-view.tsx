'use client'

// More — mobile hub for everything beyond the 4 main tabs
import { UserRound, LogOut, LayoutDashboard, LifeBuoy, CircleHelp, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, isAdmin } from '@/components/site/site-context'
import { navigate } from '@/hooks/use-hash-router'
import { MORE_LINKS } from '@/lib/constants'
import { useSeo } from '@/hooks/use-seo'
import { api } from '@/lib/api-client'

export default function MoreView() {
  const { user, setUser } = useSession()
  useSeo({ title: 'More', description: 'Account, support, legal and everything else.', path: '/more', noindex: true }, ['more'])

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    navigate('/')
  }

  const groups: Array<{ title: string; items: Array<{ label: string; desc: string; icon: string; onClick: () => void }> }> = [
    {
      title: 'Account',
      items: user
        ? [
            { label: 'My Account', desc: 'Profile, password & settings', icon: 'user', onClick: () => navigate('/account') },
            { label: 'Billing & Plans', desc: 'Upgrade, downgrade or cancel', icon: 'card', onClick: () => navigate('/billing') },
            { label: 'Support Tickets', desc: 'Get help from me directly', icon: 'life', onClick: () => navigate('/support') },
            ...(isAdmin(user) ? [{ label: 'Admin Dashboard', desc: 'Manage the entire site', icon: 'admin', onClick: () => navigate('/admin') }] : []),
            { label: 'Sign Out', desc: 'See you soon', icon: 'out', onClick: logout },
          ]
        : [
            { label: 'Sign In', desc: 'Welcome back', icon: 'in', onClick: () => navigate('/login') },
            { label: 'Create Account', desc: 'Join in 30 seconds', icon: 'user', onClick: () => navigate('/register') },
          ],
    },
    {
      title: 'Explore',
      items: MORE_LINKS.filter((l) => l.path !== '/account').map((l) => ({
        label: l.label,
        desc: l.label === 'Ventures' ? 'KP Foundation ecosystem' : l.label === 'Contact' ? 'Start a conversation' : l.label === 'Search' ? 'Find anything' : 'My story & vision',
        icon: l.icon,
        onClick: () => navigate(l.path),
      })),
    },
    {
      title: 'Help & info',
      items: [
        { label: 'Help Center', desc: 'FAQs and quick guides', icon: 'help', onClick: () => navigate('/help') },
        { label: 'Privacy Policy', desc: 'Your data, your rights', icon: 'doc', onClick: () => navigate('/legal/privacy-policy') },
        { label: 'Terms of Service', desc: 'The ground rules', icon: 'doc', onClick: () => navigate('/legal/terms-of-service') },
        { label: 'All legal documents', desc: '15 policies in plain language', icon: 'doc', onClick: () => navigate('/legal/privacy-policy') },
      ],
    },
  ]

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 pb-28">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6 px-1">More</h1>

      {/* Quick account card */}
      {user && (
        <div className="rounded-2xl border border-border bg-card p-4 mb-6 flex items-center gap-4">
          <span className="grid place-items-center size-12 rounded-2xl bg-primary/15 text-primary font-semibold text-lg">
            {(user.name || 'U')[0].toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/account')}>
            <UserRound className="size-4" /> Account
          </Button>
        </div>
      )}
      {!user && (
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-sm">You&apos;re browsing as a guest</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sign in to comment, get support and unlock your account.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate('/login')}><LogOut className="size-4 rotate-180" /> Sign in</Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/register')}>Register</Button>
          </div>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.title} className="mb-7" aria-label={g.title}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 px-1">{g.title}</p>
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
            {g.items.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="grid place-items-center size-9 rounded-xl bg-muted text-foreground shrink-0">
                  {item.icon === 'user' || item.icon === 'user-round' ? <UserRound className="size-4.5" /> :
                   item.icon === 'card' ? <CreditCard className="size-4.5" /> :
                   item.icon === 'life' ? <LifeBuoy className="size-4.5" /> :
                   item.icon === 'admin' ? <LayoutDashboard className="size-4.5" /> :
                   item.icon === 'out' ? <LogOut className="size-4.5" /> :
                   item.icon === 'in' ? <LogOut className="size-4.5 rotate-180" /> :
                   item.icon === 'help' ? <CircleHelp className="size-4.5" /> :
                   item.icon === 'network' ? <LayoutDashboard className="size-4.5" /> :
                   item.icon === 'mail' ? <LifeBuoy className="size-4.5" /> :
                   item.icon === 'search' ? <CircleHelp className="size-4.5" /> :
                   <CircleHelp className="size-4.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{item.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
