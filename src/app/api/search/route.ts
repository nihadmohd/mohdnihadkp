// GET /api/search — global site search (posts, products, services, pages)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, handleError } from '@/lib/api-helpers'

const STATIC_PAGES = [
  { title: 'Home', description: 'Portfolio, highlights and what I do', path: '/', type: 'page' },
  { title: 'Blog', description: 'Articles on AI, building and business', path: '/blog', type: 'page' },
  { title: 'Store', description: 'Curated affiliate products & tools', path: '/store', type: 'page' },
  { title: 'Services', description: 'Photography, video, AI development and more', path: '/services', type: 'page' },
  { title: 'About', description: 'My story, vision and skills', path: '/about', type: 'page' },
  { title: 'Ventures', description: 'KP Foundation and its ecosystem', path: '/ventures', type: 'page' },
  { title: 'Contact', description: 'Get in touch', path: '/contact', type: 'page' },
  { title: 'Help Center', description: 'FAQs and guides', path: '/help', type: 'page' },
  { title: 'Support', description: 'Open a support ticket', path: '/support', type: 'page' },
  { title: 'Billing & Plans', description: 'Membership plans', path: '/billing', type: 'page' },
]

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase()
    if (q.length < 2) return ok({ results: [], q })

    const [posts, products, services] = await Promise.all([
      db.post.findMany({
        where: {
          published: true,
          OR: [{ title: { contains: q } }, { excerpt: { contains: q } }, { tags: { contains: q } }],
        },
        take: 8,
        select: { title: true, slug: true, excerpt: true },
        orderBy: { views: 'desc' },
      }),
      db.product.findMany({
        where: {
          active: true,
          OR: [{ name: { contains: q } }, { description: { contains: q } }, { category: { contains: q } }],
        },
        take: 8,
        select: { name: true, slug: true, description: true, category: true },
      }),
      db.service.findMany({
        where: {
          active: true,
          OR: [{ title: { contains: q } }, { description: { contains: q } }],
        },
        take: 6,
        select: { title: true, slug: true, description: true },
      }),
    ])

    const pages = STATIC_PAGES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )

    const results = [
      ...posts.map((p) => ({
        type: 'post' as const,
        title: p.title,
        description: p.excerpt || 'Read the article',
        path: `/blog/${p.slug}`,
      })),
      ...products.map((p) => ({
        type: 'product' as const,
        title: p.name,
        description: p.description.slice(0, 120) || `in ${p.category}`,
        path: '/store',
      })),
      ...services.map((s) => ({
        type: 'service' as const,
        title: s.title,
        description: s.description.slice(0, 120),
        path: '/services',
      })),
      ...pages.map((p) => ({ ...p, type: 'page' as const })),
    ]

    return ok({ results, q, counts: { posts: posts.length, products: products.length, services: services.length, pages: pages.length } })
  } catch (err) {
    return handleError(err)
  }
}
