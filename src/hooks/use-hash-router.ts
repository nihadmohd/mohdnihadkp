'use client'

// ─────────────────────────────────────────────────────────────
// Path router — real-URL navigation for full SEO support.
// Routes look like: /blog, /blog/my-post, /admin/posts
//
// Same public API as the previous hash router (navigate /
// useHashRouter / back) so every view keeps working, but URLs
// are now real, indexable, server-rendered paths.
//
// Next.js App Router powers the actual navigation; a module-level
// router bridge lets `navigate()` work from any context.
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export interface RouteMatch {
  /** e.g. "/blog/my-post" (always starts with "/") */
  path: string
  /** path segments: ["blog", "my-post"] */
  segments: string[]
  /** query string parsed from "/blog?q=hello" */
  query: Record<string, string>
}

// Bridge: latest router instance from any mounted component
let routerRef: ReturnType<typeof useRouter> | null = null

export function navigate(path: string, opts: { replace?: boolean } = {}) {
  const target = path.startsWith('/') ? path : `/${path}`
  if (typeof window === 'undefined') return

  const current = window.location.pathname + window.location.search
  const r = routerRef

  if (!r) {
    // Router not mounted yet — plain location navigation
    if (opts.replace) window.location.replace(target)
    else if (current !== target) window.location.assign(target)
    return
  }

  if (opts.replace) {
    r.replace(target)
  } else if (current !== target) {
    r.push(target)
  } else {
    // same route — force scroll to top for consistency
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export function useHashRouter(): RouteMatch & {
  navigate: typeof navigate
  back: () => void
} {
  const pathname = usePathname() || '/'
  const sp = useSearchParams()
  const router = useRouter()

  // Bridge for module-level navigate() — set after mount (effects
  // flush before any user interaction can call navigate).
  useEffect(() => {
    routerRef = router
  }, [router])

  const query: Record<string, string> = {}
  sp.forEach((v, k) => {
    query[k] = v
  })

  // Normalize: strip trailing slashes (except root)
  let path = pathname
  if (path !== '/' && path.endsWith('/')) path = path.replace(/\/+$/, '') || '/'

  const back = useCallback(() => {
    router.back()
  }, [router])

  return { path, segments: path.split('/').filter(Boolean), query, navigate, back }
}
