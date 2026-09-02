'use client'

// ─────────────────────────────────────────────────────────────
// UX state views: 404, 403, 500, maintenance, offline, empty,
// error, loading — consistent, helpful, on-brand.
// ─────────────────────────────────────────────────────────────
import Link from 'next/link'
import {
  Compass, ShieldAlert, ServerCrash, Wrench, WifiOff, Inbox, SearchX,
  RefreshCw, Home, ArrowLeft, LogIn, FileQuestion, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { navigate } from '@/hooks/use-hash-router'

function StateShell({
  code, title, message, icon, actions,
}: {
  code?: string
  title: string
  message: string
  icon: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0 grid-bg mask-fade-b opacity-30" aria-hidden />
      <div className="relative max-w-md w-full text-center">
        <div className="mx-auto mb-6 grid place-items-center size-20 rounded-3xl border border-border bg-card shadow-sm">
          {icon}
        </div>
        {code && (
          <p className="font-display font-bold text-7xl tracking-tighter bg-gradient-to-b from-primary to-primary/30 bg-clip-text text-transparent" aria-hidden>
            {code}
          </p>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight mt-3">{title}</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">{message}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>
      </div>
    </div>
  )
}

export function NotFoundView() {
  return (
    <StateShell
      code="404"
      title="This page drifted off the map"
      message="The page you're looking for doesn't exist, moved, or was never built (yet). Let's get you back on track."
      icon={<FileQuestion className="size-9 text-primary" />}
      actions={
        <>
          <Button onClick={() => navigate('/')}>
            <Home className="size-4" /> Back home
          </Button>
          <Button variant="outline" onClick={() => navigate('/blog')}>
            Read the blog
          </Button>
          <Button variant="ghost" onClick={() => navigate('/search')}>
            <SearchX className="size-4" /> Search
          </Button>
        </>
      }
    />
  )
}

export function ForbiddenView({ code = 403, message = "You don't have permission to access this area.", showLogin = false }: { code?: number; message?: string; showLogin?: boolean }) {
  return (
    <StateShell
      code={String(code)}
      title={code === 401 ? 'Sign in required' : 'Access restricted'}
      message={
        code === 401
          ? 'This area needs you to be signed in first. Your session may have expired.'
          : message
      }
      icon={<ShieldAlert className="size-9 text-primary" />}
      actions={
        <>
          {showLogin && (
            <Button onClick={() => navigate('/login')}>
              <LogIn className="size-4" /> Sign in
            </Button>
          )}
          <Button variant={showLogin ? 'outline' : 'default'} onClick={() => navigate('/')}>
            <Home className="size-4" /> Home
          </Button>
          <Button variant="ghost" onClick={() => navigate('/contact')}>
            Contact support
          </Button>
        </>
      }
    />
  )
}

export function ErrorView({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <StateShell
      code="500"
      title="Something broke on my side"
      message="An unexpected error occurred. It has been noted. Try again — if it persists, the admin dashboard logs will show details."
      icon={<ServerCrash className="size-9 text-primary" />}
      actions={
        <>
          {reset && (
            <Button onClick={reset}>
              <RefreshCw className="size-4" /> Try again
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="size-4" /> Home
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Reload site
          </Button>
        </>
      }
    />
  )
}

export function MaintenanceView({ message }: { message?: string }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl animate-aurora" aria-hidden />
      <div className="relative max-w-md w-full text-center">
        <div className="mx-auto mb-6 grid place-items-center size-20 rounded-3xl border border-border bg-card shadow-sm">
          <Wrench className="size-9 text-primary animate-pulse" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Scheduled upgrade</p>
        <h1 className="font-display text-3xl font-bold tracking-tight mt-2">Back soon — even better</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          {message ||
            'I am upgrading the platform right now. Everything will be back shortly — usually within a few minutes.'}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" /> Check again
          </Button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          Need something urgent?{' '}
          <a
            href="https://api.whatsapp.com/send?phone=919846750898&text=Hello...!"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            WhatsApp me
          </a>
        </p>
      </div>
    </div>
  )
}

export function OfflineView() {
  return (
    <StateShell
      title="You're offline"
      message="No internet connection detected. Pages you've visited recently may still be available — everything else resumes the moment you reconnect."
      icon={<WifiOff className="size-9 text-primary" />}
      actions={
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" /> Retry connection
        </Button>
      }
    />
  )
}

// ── Reusable empty state (blog, store, inquiries, comments…) ──
export function EmptyView({
  title = 'Nothing here yet',
  message = 'When there is something to show, it will appear here first.',
  icon,
  action,
}: {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="relative flex-1 flex items-center justify-center px-4 py-14">
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-5 grid place-items-center size-16 rounded-2xl border border-dashed border-border bg-muted/40">
          {icon || <Inbox className="size-7 text-muted-foreground" />}
        </div>
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{message}</p>
        {action && <div className="mt-6 flex justify-center gap-3">{action}</div>}
      </div>
    </div>
  )
}

export function NoSearchResultsView({ query }: { query: string }) {
  return (
    <EmptyView
      title={`No results for "${query}"`}
      message="Try different keywords, check the spelling, or explore the sections directly below."
      icon={<SearchX className="size-7 text-muted-foreground" />}
      action={
        <Button variant="outline" onClick={() => navigate('/blog')}>
          Browse all posts
        </Button>
      }
    />
  )
}

// Generic inline error state for view-level data fetching failures
export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 flex items-start gap-4">
      <span className="grid place-items-center size-10 rounded-xl bg-destructive/15 text-destructive shrink-0">
        <AlertTriangleIcon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm">Something went wrong</p>
        <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
        {onRetry && (
          <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
            <RefreshCw className="size-3.5" /> Retry
          </Button>
        )}
      </div>
    </div>
  )
}

function AlertTriangleIcon() {
  return <AlertTriangle className="size-5" />
}
export { StateShell }
export const BackLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    href={to}
    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
  >
    <ArrowLeft className="size-4" /> {label}
  </Link>
)
