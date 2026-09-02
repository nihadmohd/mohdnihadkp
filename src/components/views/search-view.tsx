'use client'

// Search — global site search view (deep results with type filters)
import { useCallback, useEffect, useState } from 'react'
import { Search as SearchIcon, Loader2, FileText, ShoppingBag, Briefcase, Home } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/shared/section-heading'
import { NoSearchResultsView } from '@/components/views/states'
import { useSeo } from '@/hooks/use-seo'
import { navigate } from '@/hooks/use-hash-router'
import { api } from '@/lib/api-client'

interface SearchResult {
  type: 'post' | 'product' | 'service' | 'page'
  title: string
  description: string
  path: string
}

const TYPE_META: Record<SearchResult['type'], { label: string; icon: typeof FileText; color: string }> = {
  post: { label: 'Article', icon: FileText, color: 'text-primary' },
  product: { label: 'Product', icon: ShoppingBag, color: 'text-chart-2' },
  service: { label: 'Service', icon: Briefcase, color: 'text-chart-3' },
  page: { label: 'Page', icon: Home, color: 'text-muted-foreground' },
}

export default function SearchView({ query: initialQuery }: { query: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [debounced, setDebounced] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [searched, setSearched] = useState(false)

  useSeo(
    { title: 'Search', description: 'Search articles, products, services and pages across the site.', path: '/search', noindex: true },
    ['search']
  )

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const search = useCallback(async () => {
    if (debounced.length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    try {
      const res = await api<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(debounced)}`)
      setResults(res.results || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [debounced])

  useEffect(() => {
    search()
  }, [search])

  const filtered = filter === 'all' ? results : results.filter((r) => r.type === filter)
  const counts = {
    all: results.length,
    ...['post', 'product', 'service', 'page'].reduce(
      (acc, t) => ({ ...acc, [t]: results.filter((r) => r.type === t).length }),
      {} as Record<string, number>
    ),
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      <SectionHeading
        eyebrow="Search"
        title="Find anything on the site"
        description="Articles, products, services and pages — all in one place."
      />

      <form
        onSubmit={(e) => { e.preventDefault(); search() }}
        className="relative mb-6"
        role="search"
      >
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" aria-hidden />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type at least 2 characters…"
          className="pl-12 h-13 rounded-2xl text-base py-3.5"
          aria-label="Search query"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-5 animate-spin text-primary" aria-hidden />
        )}
      </form>

      {results.length > 0 && (
        <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-slim" role="group" aria-label="Result type filter">
          {(['all', 'post', 'product', 'service', 'page'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === t ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={filter === t}
            >
              {t === 'all' ? `All (${counts.all})` : `${TYPE_META[t].label}s (${counts[t]})`}
            </button>
          ))}
        </div>
      )}

      {!searched && debounced.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <SearchIcon className="size-8 text-muted-foreground mx-auto mb-3" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Try &ldquo;AI tools&rdquo;, &ldquo;photography&rdquo;, &ldquo;hosting&rdquo; or &ldquo;marketing&rdquo;.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        searched ? <NoSearchResultsView query={debounced} /> : null
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((r, i) => {
            const meta = TYPE_META[r.type]
            return (
              <li key={`${r.type}-${r.title}-${i}`} style={{ animation: `fadeIn 0.35s ${i * 0.04}s both` }}>
                <button
                  onClick={() => navigate(r.path)}
                  className="w-full text-left rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-primary/40 transition-colors flex items-center gap-4 group"
                >
                  <span className="grid place-items-center size-11 rounded-xl bg-muted shrink-0 group-hover:bg-primary/10 transition-colors">
                    <meta.icon className={`size-5 ${meta.color}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold truncate">{r.title}</span>
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground border rounded-full px-2 py-0.5">
                        {meta.label}
                      </span>
                    </span>
                    <span className="block text-sm text-muted-foreground mt-0.5 line-clamp-1">{r.description}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
