'use client'

// Hook: apply SEO data whenever deps change
import { useEffect } from 'react'
import { applySeo, type SeoData } from '@/lib/seo'

export function useSeo(data: SeoData, deps: unknown[] = []) {
  useEffect(() => {
    applySeo(data)
     
  }, deps)
}
