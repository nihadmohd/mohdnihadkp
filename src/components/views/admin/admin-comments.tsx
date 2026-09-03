'use client'

// Admin comments — moderation queue (approve / delete)
import { useCallback, useEffect, useState } from 'react'
import { MessageSquare, Check, Trash2, ExternalLink, Loader2, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

interface Comment {
  id: string
  content: string
  approved: boolean
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
  post: { id: string; title: string; slug: string }
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ comments: Comment[]; counts: Record<string, number> }>('/api/comments?admin=true&limit=50')
      setComments(res.comments)
      setCounts(res.counts)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const approve = async (c: Comment) => {
    try {
      await api(`/api/comments/${c.id}`, { method: 'PATCH' })
      setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, approved: true } : x)))
      setCounts((prev) => ({ ...prev, pending: Math.max(0, (prev.pending || 0) - 1), approved: (prev.approved || 0) + 1 }))
      toast({ title: 'Comment approved', description: `Now visible on “${c.post.title}”.` })
    } catch (err) {
      toast({ title: 'Failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const remove = async (c: Comment) => {
    try {
      await api(`/api/comments/${c.id}`, { method: 'DELETE' })
      setComments((prev) => prev.filter((x) => x.id !== c.id))
    } catch (err) {
      toast({ title: 'Delete failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const filtered = comments.filter((c) =>
    filter === 'all' ? true : filter === 'pending' ? !c.approved : c.approved
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Comment moderation</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{counts.pending || 0} pending · {counts.approved || 0} approved</p>
        </div>
        <div className="flex gap-1.5">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && comments.length === 0 ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyView
          title={filter === 'pending' ? 'Moderation queue is clear' : filter === 'approved' ? 'No approved comments yet' : 'No comments yet'}
          message="Reader comments appear here for approval before going live — spam never makes it through."
          icon={<MessageSquare className="size-7 text-muted-foreground" />}
        />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((c) => (
            <li key={c.id} className={`rounded-2xl border bg-card p-4 ${!c.approved ? 'border-amber-500/40' : 'border-border'}`}>
              <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                <span className="grid place-items-center size-8 rounded-full bg-primary/15 text-primary text-xs font-bold shrink-0">
                  {(c.user.name || 'A')[0].toUpperCase()}
                </span>
                <span className="text-sm font-semibold">{c.user.name || 'Anonymous'}</span>
                <button
                  onClick={() => router.push(`/blog/${c.post.slug}`)}
                  className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 truncate"
                >
                  on “{c.post.title}” <ExternalLink className="size-3 shrink-0" />
                </button>
                <time className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1">
                  <Clock3 className="size-3" /> {new Date(c.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{c.content}</p>
              <div className="flex gap-2 mt-3.5">
                {!c.approved && (
                  <Button size="sm" onClick={() => approve(c)}>
                    <Check className="size-3.5" /> Approve
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(c)}>
                  <Trash2 className="size-3.5" /> Delete
                </Button>
                {c.approved && <Badge variant="secondary" className="ml-auto self-center text-primary border-primary/30">live</Badge>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
