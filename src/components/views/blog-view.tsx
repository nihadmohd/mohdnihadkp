'use client'

// Blog — searchable, tag-filtered, paginated article grid.
// Accepts server-rendered initial data so crawlers get real HTML.
import { useCallback, useEffect, useRef, useState, Fragment } from 'react'
import { Search, Newspaper, Tag, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton, SectionHeading } from '@/components/shared/section-heading'
import { EmptyView, NoSearchResultsView, InlineError } from '@/components/views/states'
import { PostCard } from '@/components/views/home-view'
import { AdSlot } from '@/components/shared/ad-slot'
import { MarqueeStrip } from '@/components/shared/marquee-strip'
import { useSeo } from '@/hooks/use-seo'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { SITE } from '@/lib/constants'

interface PostRow {
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

export interface PostsResponse {
  posts: PostRow[]
  total: number
  pages: number
  tags: string[]
}

export default function BlogView({ initial }: { initial?: PostsResponse | null }) {
  const [query, setQuery] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PostsResponse | null>(initial || null)
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')
  // Skip the first (default-filter) fetch when server data is already in place
  const skipFirst = useRef(Boolean(initial))

  useSeo(
    {
      title: 'Blog — AI Development, Freelancing & One-Person Business',
      description: 'Practical articles on AI-powered development, freelancing rates, photography and running a one-person business — written from Calicut, Kerala by Mohammed Nihad KP.',
      path: '/blog',
    },
    ['blog']
  )

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 350)
    return () => clearTimeout(t)
  }, [query])

  const load = useCallback(async () => {
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '9' })
      if (debouncedQ) params.set('q', debouncedQ)
      if (tag) params.set('tag', tag)
      const res = await api<PostsResponse>(`/api/posts?${params}`)
      setData(res)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQ, tag])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [debouncedQ, tag])

  const searching = debouncedQ.length > 0

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      <SectionHeading
        eyebrow="The blog"
        title={searching ? `Searching “${debouncedQ}”` : 'Ideas, tested in the real world'}
        description="AI workflows, one-person business lessons, tool reviews and build logs — written between projects, from Calicut."
      />

      {/* Scrolling highlights strip */}
      <MarqueeStrip className="mt-7 mb-8" />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="pl-10 h-11 rounded-xl"
            aria-label="Search articles"
          />
        </div>
        {data?.tags && data.tags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-slim pb-1 sm:pb-0" role="group" aria-label="Filter by tag">
            <Tag className="size-4 text-muted-foreground shrink-0 mr-1" aria-hidden />
            <FilterChip label="All" active={tag === ''} onClick={() => setTag('')} />
            {data.tags.map((t) => (
              <FilterChip key={t} label={t} active={tag === t} onClick={() => setTag(tag === t ? '' : t)} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {error ? (
        <InlineError message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : !data || data.posts.length === 0 ? (
        searching ? <NoSearchResultsView query={debouncedQ} /> : (
          <EmptyView
            title="First articles are on the way"
            message="The blog is warming up — new pieces on AI-powered building are being drafted right now."
            icon={<Newspaper className="size-7 text-muted-foreground" />}
            action={<Button variant="outline" asChild><Link href="/">Back home</Link></Button>}
          />
        )
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4" aria-live="polite">
            {data.total} article{data.total === 1 ? '' : 's'}{tag ? ` tagged “${tag}”` : ''}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.posts.map((post, i) => (
              <Fragment key={post.id}>
                <PostCard post={post as unknown as Record<string, unknown>} delay={i * 0.05} />
                {/* Affiliate ad injected into the grid (after 3rd and 7th card) */}
                {(i === 2 || i === 6) && (
                  <div className="sm:col-span-2 lg:col-span-1 h-full">
                    <AdSlot placement="blog-list" variant="card" className="[&>button]:h-full" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <nav className="mt-9 flex items-center justify-center gap-2" aria-label="Pagination">
              <Button
                variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: data.pages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) < 2 || p === 1 || p === data.pages)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground">…</span>}
                    <button
                      onClick={() => setPage(p)}
                      aria-current={p === page ? 'page' : undefined}
                      className={`grid place-items-center size-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page ? 'bg-primary text-primary-foreground' : 'border border-border hover:border-primary/40'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <Button
                variant="outline" size="sm" disabled={page === data.pages} onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
