'use client'

// ─────────────────────────────────────────────────────────────
// Hash router — SPA navigation without page routes.
// Routes look like: #/blog, #/blog/my-post, #/admin/posts
//
// Uses useSyncExternalStore so the SSR snapshot ('/') and the
// client snapshot (real hash) can differ WITHOUT hydration
// mismatch errors — React re-renders with the client value
// immediately after hydration.
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useSyncExternalStore } from 'react'

export interface RouteMatch {
  /** e.g. "/blog/my-post" (always starts with "/") */
  path: string
  /** path segments: ["blog", "my-post"] */
  segments: string[]
  /** query string parsed from "#/blog?q=hello" */
  query: Record<string, string>
}

function parseHash(): RouteMatch {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [pathPart, queryPart] = raw.split('?')
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`
  const query: Record<string, string> = {}
  if (queryPart) {
    for (const [k, v] of new URLSearchParams(queryPart)) query[k] = v
  }
  return {
    path: path.replace(/\/+$/, '') || '/',
    segments: path.split('/').filter(Boolean),
    query,
  }
}

export function navigate(path: string, opts: { replace?: boolean } = {}) {
  const target = `#${path.startsWith('/') ? path : `/${path}`}`
  if (opts.replace) {
    window.history.replaceState(null, '', target)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else if (window.location.hash !== target) {
    window.location.hash = target
  } else {
    // same route — force scroll to top for consistency
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// ── Global store (single listener, cached snapshot) ──────────
const SERVER_SNAPSHOT: RouteMatch = { path: '/', segments: [], query: {} }
let cached: RouteMatch | null = null
let listening = false
const listeners = new Set<() => void>()

function refreshSnapshot() {
  cached = parseHash()
  listeners.forEach((l) => l())
}

function ensureListener() {
  if (listening || typeof window === 'undefined') return
  listening = true
  window.addEventListener('hashchange', () => {
    refreshSnapshot()
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  })
}

function subscribe(cb: () => void) {
  ensureListener()
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot(): RouteMatch {
  if (!cached) cached = parseHash()
  return cached
}

function getServerSnapshot(): RouteMatch {
  return SERVER_SNAPSHOT
}

export function useHashRouter(): RouteMatch & {
  navigate: typeof navigate
  back: () => void
} {
  const route = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const back = useCallback(() => {
    if (window.history.length > 1) window.history.back()
    else navigate('/')
  }, [])

  return { ...route, navigate, back }
}

// Scroll restore + history support for hash router
export function useScrollRestorationOnMount(routePath: string) {
  useEffect(() => {
    const key = `scroll:${routePath}`
    const saved = sessionStorage.getItem(key)
    if (saved) {
      window.scrollTo({ top: parseInt(saved, 10) || 0, behavior: 'instant' as ScrollBehavior })
    }
    return () => {
      sessionStorage.setItem(key, String(window.scrollY))
    }
  }, [routePath])
}
