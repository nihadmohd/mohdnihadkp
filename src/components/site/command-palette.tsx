'use client'

// Ctrl+K command palette — global search + quick navigation
import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Search, Loader2, FileText, ShoppingBag, Briefcase, Home, CornerDownLeft } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { NAV_LINKS, MORE_LINKS } from '@/lib/constants'

interface SearchResult {
  type: 'post' | 'product' | 'service' | 'page'
  title: string
  description: string
  path: string
}

const QUICK = [
  ...NAV_LINKS.map((l) => ({ type: 'page' as const, title: l.label, description: 'Go to page', path: l.path })),
  ...MORE_LINKS.filter((l) => l.path !== '/search').map((l) => ({ type: 'page' as const, title: l.label, description: 'Go to page', path: l.path })),
  { type: 'page' as const, title: 'Ventures', description: 'KP Foundation ecosystem', path: '/ventures' },
]

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor] = useState(0)
  const router = useRouter()

  const reset = () => {
    setQuery('')
    setResults([])
    setCursor(0)
  }

  useEffect(() => {
    if (!open || query.trim().length < 2) return
    const t = setTimeout(() => {
      if (query.trim().length < 2) {
        setResults(QUICK as SearchResult[])
        setLoading(false)
        return
      }
      setLoading(true)
      api<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(query)}`)
        .then((d) => {
          setResults(d.results || [])
          setCursor(0)
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [query, open])

  const go = (path: string) => {
    setOpen(false)
    router.push(path)
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault()
      go(results[cursor].path)
    }
  }

  const icon = (type: SearchResult['type']) =>
    type === 'post' ? <FileText className="size-4 text-primary" />
    : type === 'product' ? <ShoppingBag className="size-4 text-chart-2" />
    : type === 'service' ? <Briefcase className="size-4 text-chart-3" />
    : <Home className="size-4 text-muted-foreground" />

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogContent className="top-[20%] translate-y-0 p-0 gap-0 overflow-hidden max-w-lg rounded-2xl">
        <DialogTitle className="sr-only">Search the site</DialogTitle>
        <DialogDescription className="sr-only">Search posts, products, services and pages</DialogDescription>
        <div className="flex items-center gap-3 border-b border-border px-4 h-14">
          {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : <Search className="size-4 text-muted-foreground" />}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search posts, products, services…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            aria-label="Search query"
          />
          <kbd className="text-[10px] font-mono border rounded px-1.5 py-0.5 text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto scrollbar-slim p-2">
          {results.length === 0 && !loading && query.trim().length >= 2 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-muted-foreground mt-1">Try different keywords — or browse the blog.</p>
            </div>
          ) : (
            <ul role="listbox" aria-label="Search results">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.title}-${i}`}>
                  <button
                    role="option"
                    aria-selected={i === cursor}
                    onClick={() => go(r.path)}
                    onMouseEnter={() => setCursor(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      i === cursor ? 'bg-primary/10' : 'hover:bg-muted/60'
                    }`}
                  >
                    <span className="grid place-items-center size-8 rounded-lg bg-muted shrink-0">{icon(r.type)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{r.title}</span>
                      <span className="block text-xs text-muted-foreground truncate">{r.description}</span>
                    </span>
                    {i === cursor && <CornerDownLeft className="size-3.5 text-muted-foreground shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-border px-4 py-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <kbd className="font-mono border rounded px-1">↑↓</kbd> navigate
            <kbd className="font-mono border rounded px-1">↵</kbd> open
          </span>
          <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
