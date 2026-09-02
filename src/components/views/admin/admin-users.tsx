'use client'

// Admin users — member management (roles, bans, stats)
import { useCallback, useEffect, useState } from 'react'
import {
  Users, Search, ShieldCheck, Ban, Trash2, Loader2, BadgeCheck, Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { api } from '@/lib/api-client'
import { useSession } from '@/components/site/site-context'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

interface UserRow {
  id: string
  email: string
  name: string | null
  role: string
  banned: boolean
  plan: string
  emailVerified: string | null
  lastLoginAt: string | null
  createdAt: string
  _count: { posts: number; comments: number }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user: me } = useSession()
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (query) params.set('q', query)
      const res = await api<{ users: UserRow[]; pages: number; total: number }>(`/api/users?${params}`)
      setUsers(res.users)
      setPages(res.pages)
      setTotal(res.total)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, query, toast])

  useEffect(() => { load() }, [load])

  const patch = async (u: UserRow, body: Record<string, unknown>) => {
    try {
      const res = await api<{ user: UserRow }>(`/api/users/${u.id}`, { method: 'PATCH', body })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...res.user } : x)))
      toast({ title: 'User updated', description: `${u.email} → ${res.user.role}${res.user.banned ? ' (banned)' : ''}` })
    } catch (err) {
      toast({ title: 'Update failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const remove = async (u: UserRow) => {
    try {
      await api(`/api/users/${u.id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((x) => x.id !== u.id))
      toast({ title: 'User deleted', description: u.email })
    } catch (err) {
      toast({ title: 'Delete failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Members</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{total} registered accounts</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search name or email…" className="pl-9 h-9 w-52" aria-label="Search users" />
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <EmptyView title="No members found" message={query ? 'Try a different search.' : 'Accounts appear here as people register.'} icon={<Users className="size-7 text-muted-foreground" />} />
      ) : (
        <ul className="space-y-2.5">
          {users.map((u) => {
            const isMe = u.id === me?.id
            return (
              <li key={u.id} className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
                <span className="grid place-items-center size-10 rounded-full bg-primary/15 text-primary font-bold shrink-0">
                  {(u.name || u.email)[0].toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">{u.name || '—'}</p>
                    {u.role === 'ADMIN' && <Badge className="text-[10px] gap-1"><Crown className="size-2.5" /> admin</Badge>}
                    {isMe && <Badge variant="secondary" className="text-[10px]">you</Badge>}
                    {u.banned && <Badge variant="secondary" className="text-[10px] text-destructive border-destructive/30">banned</Badge>}
                    {u.plan !== 'FREE' && <Badge variant="secondary" className="text-[10px] text-primary border-primary/30">{u.plan}</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex gap-2 flex-wrap">
                    <span className="truncate">{u.email}</span>
                    <span className="flex items-center gap-1"><BadgeCheck className={`size-3 ${u.emailVerified ? 'text-primary' : 'text-muted-foreground/50'}`} />{u.emailVerified ? 'verified' : 'unverified'}</span>
                    <span>· {u._count.comments} comments</span>
                    <span>· joined {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon" variant="ghost" className="size-8"
                    title={u.role === 'ADMIN' ? 'Demote to user' : 'Promote to admin'}
                    aria-label="Toggle admin role"
                    disabled={isMe}
                    onClick={() => patch(u, { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                  >
                    <ShieldCheck className={`size-4 ${u.role === 'ADMIN' ? 'text-primary' : ''}`} />
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="size-8"
                    title={u.banned ? 'Unban' : 'Ban'}
                    aria-label="Toggle ban"
                    disabled={isMe}
                    onClick={() => patch(u, { banned: !u.banned })}
                  >
                    <Ban className={`size-4 ${u.banned ? 'text-destructive' : ''}`} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="size-8 text-destructive" disabled={isMe} aria-label="Delete user">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {u.email}?</AlertDialogTitle>
                        <AlertDialogDescription>Their account, comments and tickets will be permanently removed.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep account</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(u)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span>Page {page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
