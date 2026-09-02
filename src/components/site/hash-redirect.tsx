'use client'

// Legacy hash-URL redirect — V1/V2 links look like:
//   https://nihadkp.com/#/blog/my-post
// Search engines and AI crawlers treat "#..." as the same page,
// so all public URLs are now real paths (/blog/my-post). This
// component converts any legacy hash URL to its real path on
// first load, keeping old shared links alive.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function HashRedirect() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash || hash.length < 3) return
    const raw = hash.replace(/^#/, '')
    if (!raw.startsWith('/')) return // e.g. #main-content anchor — leave alone

    const [pathPart, queryPart] = raw.split('?')
    let target = pathPart.startsWith('/') ? pathPart : `/${pathPart}`
    target = target.replace(/\/+$/, '') || '/'
    if (queryPart) target += `?${queryPart}`

    // Map old store detail shape #/store/item/{slug} → /store/{slug}
    target = target.replace(/^\/store\/item\//, '/store/')

    if (target !== '/' && target !== window.location.pathname) {
      router.replace(target)
    }
  }, [router])

  return null
}
