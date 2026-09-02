// Enrich service rows with Calicut/Kozhikode location mentions
// (natural, not stuffed) for local search relevance. Idempotent.
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const UPDATES: Array<{ slug: string; description?: string; features?: string }> = [
  {
    slug: 'photography',
    description:
      'End-to-end photography in Calicut (Kozhikode), Kerala — from concept to color-graded final delivery. Events, products, portraits and brand shoots, edited professionally in Lightroom. On-location shoots across Kerala; destination work on request.',
  },
  {
    slug: 'videography',
    description:
      'Cinematic videography and precision editing with CapCut and Adobe tools — reels, promos, event films and brand stories that hold attention. Based in Calicut, Kerala; shooting across the state and editing for clients worldwide.',
  },
  {
    slug: 'ai-development',
    description:
      'I build apps, websites and digital solutions by mastering AI tools instead of hand-writing every line — meaning faster delivery, lower cost, and modern quality. Website development in Calicut, Kerala for local businesses, plus remote projects across India and abroad.',
    features: 'Portfolio & business sites|Web apps & dashboards|AI-assisted rapid delivery|SEO-ready builds',
  },
  {
    slug: 'ai-mastery',
    description:
      'Learn to leverage artificial intelligence the way I do — practical sessions on using AI tools for development, content, automation and business. One-on-one training in Calicut or online anywhere.',
  },
  {
    slug: 'marketing',
    description:
      'Full-stack digital presence — social strategy, content calendars, campaign creatives and business planning grounded in market analysis. Digital marketing services for Calicut businesses and brands across Kerala, delivered remotely worldwide.',
  },
  {
    slug: 'creative-media',
    description:
      'Complete creative production — combining Canva, PicsArt, PixelLab and Adobe into one seamless visual pipeline for your brand. Creative media services from Calicut, Kerala with fast digital delivery anywhere.',
  },
]

async function main() {
  for (const u of UPDATES) {
    const existing = await db.service.findUnique({ where: { slug: u.slug } })
    if (!existing) {
      console.log('skip (not found):', u.slug)
      continue
    }
    if (existing.description === u.description) {
      console.log('already updated:', u.slug)
      continue
    }
    await db.service.update({
      where: { slug: u.slug },
      data: {
        ...(u.description ? { description: u.description } : {}),
        ...(u.features ? { features: u.features } : {}),
      },
    })
    console.log('updated:', u.slug)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(() => db.$disconnect())
