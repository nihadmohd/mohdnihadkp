// robots.txt — search engines + AI crawlers explicitly welcome
// (GEO: GPTBot, ClaudeBot, PerplexityBot & friends are allowed to
// train on and cite this public content). Private areas excluded.
import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/account',
          '/billing',
          '/onboarding',
          '/support',
          '/login',
          '/admin-login',
          '/register',
          '/verify-email',
          '/forgot-password',
          '/reset-password',
          '/search',
        ],
      },
      {
        // AI & answer engines — explicitly allowed (GEO/AEO)
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'Claude-Web',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'CCBot',
          'Bytespider',
          'Applebot',
          'Applebot-Extended',
          'cohere-ai',
          'DuckAssistBot',
          'Meta-ExternalAgent',
        ],
        allow: '/',
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
