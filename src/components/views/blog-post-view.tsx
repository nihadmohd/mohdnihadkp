'use client'

// Blog post — full article, share, comments, related posts. SEO: article JSON-LD.
import { useCallback, useEffect, useState } from 'react'
import {
  CalendarDays, Clock, Eye, Share2, ArrowLeft, MessageSquare, Send, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Markdown } from '@/components/markdown'
import { InlineError, EmptyView } from '@/components/views/states'
import { PostCard } from '@/components/views/home-view'
import { AdSlot } from '@/components/shared/ad-slot'
import { useSeo } from '@/hooks/use-seo'
import { useSession } from '@/components/site/site-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { SITE, SOCIALS } from '@/lib/constants'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export interface PostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  tags: string
  views: number
  readingMinutes: number
  publishedAt: string | null
  seoTitle: string | null
  seoDescription: string | null
  author: { id: string; name: string | null; image: string | null }
  comments: CommentRow[]
}

interface CommentRow {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

interface RelatedRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  tags: string
  views: number
  readingMinutes: number
  publishedAt: string | null
}

export default function BlogPostView({ slug, initial }: { slug: string; initial?: PostRow | null }) {
  const [post, setPost] = useState<PostRow | null>(initial || null)
  const [related, setRelated] = useState<RelatedRow[]>([])
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')
  const { user } = useSession()
  const { toast } = useToast()
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [commentDone, setCommentDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const load = useCallback(async () => {
    // Server-rendered post already in place — only top up related posts
    if (initial) {
      try {
        const tag = post?.tags.split(',')[0]?.trim() || ''
        const rel = await api<{ posts: RelatedRow[] }>(
          `/api/posts?limit=3${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`
        )
        setRelated(rel.posts.filter((p) => p.slug !== slug).slice(0, 3))
      } catch { /* related posts are optional */ }
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api<{ post: PostRow }>(`/api/posts?slug=${encodeURIComponent(slug)}`)
      setPost(res.post)
      const tag = res.post.tags.split(',')[0]?.trim()
      const rel = await api<{ posts: RelatedRow[] }>(
        `/api/posts?limit=3${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`
      )
      setRelated(rel.posts.filter((p) => p.slug !== slug).slice(0, 3))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    load()
  }, [load])

  // ── Accurate view counting ──────────────────────────────────
  // One POST per post per mount, with a stable per-visitor session id.
  // The server de-duplicates via the unique (postId, sessionId) ledger,
  // so refreshes and return visits within the session don't inflate counts.
  useEffect(() => {
    if (!post?.id) return
    let sid = ''
    try {
      sid = localStorage.getItem('nihad_sid') || ''
      if (!sid) {
        sid = (crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)
        localStorage.setItem('nihad_sid', sid)
      }
    } catch { /* private mode */ }
    api<{ views: number; uniqueViews: number }>(`/api/posts/${post.id}/view`, {
      method: 'POST',
      body: { sessionId: sid || `anon-${Math.random().toString(36).slice(2)}` },
    })
      .then((d) => {
        setPost((p) => (p && p.id === post.id ? { ...p, views: d.views } : p))
      })
      .catch(() => {})
  }, [post?.id])

  useSeo(
    post
      ? {
          title: post.seoTitle || post.title,
          description: post.seoDescription || post.excerpt || SITE.description,
          path: `/blog/${post.slug}`,
          type: 'article',
          publishedTime: post.publishedAt || undefined,
          tags: post.tags.split(',').filter(Boolean),
          author: post.author?.name || SITE.name,
        }
      : { title: 'Article', description: SITE.description, path: `/blog/${slug}` },
    [post?.id, post?.title]
  )

  const share = async () => {
    const url = `${window.location.origin}/blog/${slug}`
    const shareData = { title: post?.title || SITE.name, text: post?.excerpt || '', url }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch { /* cancelled — fall through to copy */ }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({ title: 'Link copied', description: 'Share it anywhere — it opens right at this article.' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Could not copy', description: 'Copy the address bar URL instead.', variant: 'destructive' })
    }
  }

  const submitComment = async () => {
    if (!user) {
      toast({ title: 'Sign in to comment', description: 'Create a free account to join the conversation.' })
      router.push('/login')
      return
    }
    if (comment.trim().length < 2 || sending) return
    setSending(true)
    try {
      const res = await api<{ message: string }>('/api/comments', {
        method: 'POST',
        body: { postId: post?.id, content: comment.trim() },
      })
      setCommentDone(true)
      setComment('')
      toast({ title: 'Comment submitted', description: res.message })
    } catch (err) {
      toast({ title: 'Could not submit', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-16 space-y-6" aria-busy="true">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-52" />
        <div className="pt-4 space-y-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <EmptyView
        title="Article not found"
        message="This post may have been moved, unpublished, or never existed. The blog has plenty more."
        action={
          <>
            <Button asChild><Link href="/blog">All articles</Link></Button>
            <Button variant="outline" onClick={() => load()}>Retry</Button>
          </>
        }
      />
    )
  }

  const date = post.publishedAt ? new Date(post.publishedAt) : null
  const tags = post.tags.split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-14 pb-24 lg:pb-14">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:gap-14">
      <article className="min-w-0 max-w-3xl mx-auto lg:mx-0 w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-7" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground truncate max-w-[40vw]">{post.title}</span>
      </nav>

      <header>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-[1.12]">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-muted-foreground text-lg mt-4 leading-relaxed text-balance">{post.excerpt}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            {post.author?.image ? (
               
              <img src={post.author.image} alt={post.author.name || 'Author'} className="size-7 rounded-full object-cover" />
            ) : (
              <span className="grid place-items-center size-7 rounded-full bg-primary/15 text-primary text-xs font-bold">
                {(post.author?.name || SITE.name)[0]}
              </span>
            )}
            <span className="font-medium text-foreground">{post.author?.name || SITE.name}</span>
          </span>
          {date && (
            <time dateTime={date.toISOString()} className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          )}
          <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {post.readingMinutes} min read</span>
          <span className="flex items-center gap-1.5"><Eye className="size-3.5" /> {Intl.NumberFormat('en', { notation: 'compact' }).format(post.views)} views</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <Link key={t} href="/blog">
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                #{t}
              </Badge>
            </Link>
          ))}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={share}>
            {copied ? <Check className="size-4 text-primary" /> : <Share2 className="size-4" />}
            Share
          </Button>
        </div>
      </header>

      {post.coverImage && (
        <figure className="mt-8 rounded-2xl overflow-hidden border border-border">
          { }
          <img src={post.coverImage} alt={post.title} className="w-full aspect-[16/8] object-cover" loading="lazy" />
        </figure>
      )}

      <div className="mt-9">
        <Markdown content={post.content} />
      </div>

      {/* Inline affiliate ad (admin-managed, blog-inline placement) */}
      <AdSlot placement="blog-inline" variant="inline" className="mt-2" />

      {/* Internal links — blog → services & store */}
      <aside className="mt-10 grid sm:grid-cols-2 gap-4" aria-label="Explore related pages">
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 flex flex-col gap-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Work with me</p>
          <p className="text-sm font-medium leading-snug">
            Need a website, app or media built like this? I do it end-to-end from Calicut, Kerala.
          </p>
          <Link
            href="/services"
            className="text-sm font-semibold text-primary hover:underline text-left block"
          >
            See my freelance services →
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My toolkit</p>
          <p className="text-sm font-medium leading-snug">
            The AI tools, software and gear behind these articles — honestly reviewed.
          </p>
          <Link
            href="/store"
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left block"
          >
            Browse the curated store →
          </Link>
        </div>
      </aside>

      {/* Author box */}
      <div className="mt-12 rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <span className="grid place-items-center size-16 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-xl shrink-0 glow-sm">
          {(post.author?.name || SITE.name).split(' ').map((w) => w[0]).slice(0, 2).join('')}
        </span>
        <div className="flex-1">
          <p className="font-semibold">{post.author?.name || SITE.name}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            AI-powered developer and digital creator from Calicut. Building in public — apps, ventures and the odd 195-country plan.
          </p>
        </div>
        <a
          href={SOCIALS[0].href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button variant="outline" size="sm">Say hello</Button>
        </a>
      </div>

      {/* Comments */}
      <section className="mt-12" aria-label="Comments">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-5">
          <MessageSquare className="size-5 text-primary" />
          Discussion
          <span className="text-sm font-normal text-muted-foreground">({post.comments.length})</span>
        </h2>

        {user && !commentDone ? (
          <div className="rounded-2xl border border-border bg-card p-4 mb-6">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add to the discussion — be kind, be specific…"
              rows={3}
              maxLength={2000}
              aria-label="Write a comment"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">Comments appear after approval.</p>
              <Button size="sm" onClick={submitComment} disabled={sending || comment.trim().length < 2}>
                {sending ? <Send className="size-3.5 animate-pulse" /> : <Send className="size-3.5" />} Post
              </Button>
            </div>
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center mb-6">
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
              {' '}to join the discussion — it takes 30 seconds.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 mb-6 flex items-center gap-3">
            <Check className="size-5 text-primary shrink-0" />
            <p className="text-sm">Comment submitted — it will appear once approved. Thanks for contributing!</p>
          </div>
        )}

        {post.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-2xl">
            No comments yet — yours could set the tone.
          </p>
        ) : (
          <ul className="space-y-4">
            {post.comments.map((c) => (
              <li key={c.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                      {(c.user.name || 'A')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{c.user.name || 'Anonymous'}</p>
                    <time className="text-xs text-muted-foreground" dateTime={c.createdAt}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </time>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mt-14" aria-label="Related articles">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold">Keep reading</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog"><ArrowLeft className="size-4" /> All articles</Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((r, i) => (
              <PostCard key={r.id} post={r as unknown as Record<string, unknown>} delay={i * 0.05} />
            ))}
          </div>
        </section>
      )}
      </article>

      {/* Desktop sidebar — sticky affiliate ads + quick links */}
      <aside className="hidden lg:block" aria-label="Article sidebar">
        <div className="sticky top-20 space-y-5">
          <AdSlot placement="blog-sidebar" variant="sidebar" limit={2} />
          {related.length > 0 && (
            <nav className="rounded-2xl border border-border bg-card p-4" aria-label="More articles">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Keep reading</p>
              <ul className="space-y-3">
                {related.slice(0, 3).map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="text-left block text-sm font-medium leading-snug hover:text-primary transition-colors line-clamp-2"
                    >
                      {r.title}
                    </Link>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.readingMinutes} min read</p>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </aside>
      </div>
    </div>
  )
}
