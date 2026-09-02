'use client'

// AdminGate — client-side access control for /admin/* routes.
// Mirrors the old SPA gate: loading → 401 (sign-in) → 403 (not
// admin) → AdminView. Realtime feed/alerts arrive via context.
import { useSession, isAdmin } from '@/components/site/site-context'
import { RouteFallback } from '@/components/site/app-shell'
import { ForbiddenView } from '@/components/views/states'
import AdminView from '@/components/views/admin/admin-view'

export function AdminGate({ section, sub }: { section: string; sub?: string }) {
  const { user, loaded } = useSession()

  if (!loaded) return <RouteFallback />
  if (!user) {
    return <ForbiddenView code={401} message="Sign in required" showLogin />
  }
  if (!isAdmin(user)) {
    return <ForbiddenView code={403} message="This area is for the site administrator." />
  }
  return <AdminView section={section} sub={sub} />
}
