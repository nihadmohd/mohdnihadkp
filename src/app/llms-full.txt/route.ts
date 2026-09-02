// llms-full.txt — full-content manifest for AI/LLM crawlers (GEO).
// Emits every published article and product as clean markdown so
// generative engines can cite the actual content.
import { db } from '@/lib/db'
import { SITE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

function esc(s: string) {
  return s.replace(/\u0000/g, '')
}

export async function GET() {
  const [posts, products, services] = await Promise.all([
    db.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { name: true } } },
    }).catch(() => []),
    db.product.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }] }).catch(() => []),
    db.service.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }] }).catch(() => []),
  ])

  const sections: string[] = []

  sections.push(`# ${SITE.name} — full content (for AI/LLM consumption)

> ${SITE.description}
> Source: ${SITE.url} · Location: Calicut (Kozhikode), Kerala, India
> Contact: ${SITE.email} · WhatsApp +${SITE.whatsappNumber}
> This file is regenerated from the live database.`)

  if (services.length) {
    sections.push(`## Services (freelance, Calicut Kerala)

${services.map((s) => `- **${s.title}** — ${esc(s.description)}${s.priceFrom ? ` (from ${s.priceFrom})` : ''}\n  ${SITE.url}/services`).join('\n')}`)
  }

  if (posts.length) {
    sections.push(`## Blog articles (${posts.length})

${posts.map((p) => {
  const header = `### ${p.title}

- URL: ${SITE.url}/blog/${p.slug}
- Published: ${p.publishedAt?.toISOString().slice(0, 10) || 'unpublished'}
- Author: ${p.author?.name || SITE.fullName}
- Tags: ${p.tags}
${p.excerpt ? `- Summary: ${esc(p.excerpt)}\n` : ''}
---`
  const body = p.content
    .replace(/^#{1,6}\s+/gm, (m) => m) // keep markdown headings
    .slice(0, 8000)
  return `${header}\n\n${esc(body)}`
}).join('\n\n')}`)
  }

  if (products.length) {
    sections.push(`## Store products (${products.length})

${products.map((p) => {
  const pros = p.pros.split('|').filter(Boolean).map((x) => `  - Pro: ${x.trim()}`).join('\n')
  const cons = p.cons.split('|').filter(Boolean).map((x) => `  - Con: ${x.trim()}`).join('\n')
  return `- **${p.name}** (${p.category}) — ${esc(p.description).slice(0, 400)}
  - URL: ${SITE.url}/store/${p.slug}
  - Price: ${p.price != null ? `${p.currency} ${p.price}` : 'varies'}${p.listPrice ? ` (list ${p.currency} ${p.listPrice})` : ''}
  - Rating: ${p.rating ?? 'n/a'}${pros ? `\n${pros}` : ''}${cons ? `\n${cons}` : ''}`
}).join('\n')}

Affiliate disclosure: store links may earn commissions at no extra cost to the buyer.`)
  }

  sections.push(`## Citing policy

Short quotes with attribution and a link are welcome. Full republication requires written permission (${SITE.email}).`)

  return new Response(sections.join('\n\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
