// ─────────────────────────────────────────────────────────────
// Server-safe SEO metadata — single source of truth for
// per-page titles (main keyword first), unique descriptions,
// keywords, and structured-data builders.
//
// SEO : classic Google/Bing optimization — titles, descriptions,
//       canonicals, sitemap, robots, internal links.
// AEO : Answer Engine Optimization — FAQPage / Q&A schema and
//       direct-answer copy for voice & answer engines.
// GEO : Generative Engine Optimization — llms.txt, AI-crawler
//       access, entity-rich structured data (Person, Service).
// MEO : Media/Multi-engine Optimization — image alt standards,
//       OG/Twitter cards, RSS feed, social sameAs graph.
// ─────────────────────────────────────────────────────────────
import { SITE, SOCIALS } from '@/lib/constants'

export interface PageMeta {
  title: string
  description: string
  keywords?: string[]
}

// ── Main keyword per important page ──────────────────────────
// Calicut = Kozhikode — both forms are searched; use naturally.
export const CITY = {
  name: 'Calicut',
  alt: 'Kozhikode',
  region: 'Kerala',
  country: 'India',
  geo: { lat: 11.2588, lng: 75.7804 },
}

// ── AEO: direct-answer FAQs (services page + Help center) ────
// Question/answer pairs that answer engines can lift verbatim.
export const SERVICES_FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'What services do you offer in Calicut?',
    a: 'I offer AI-powered website and app development, photography, videography and video editing, digital marketing, AI consulting and creative media production. All services are delivered end-to-end from Calicut (Kozhikode), Kerala, for clients in India and worldwide.',
  },
  {
    q: 'How much does a website cost in Calicut, Kerala?',
    a: 'A professional website by MN.KP starts from ₹4,999 for a portfolio or business site. Larger web apps, e-commerce builds and custom platforms are quoted per scope after a free consultation. Photography starts at ₹1,499 and videography at ₹2,999.',
  },
  {
    q: 'Do you work with clients outside Calicut and Kerala?',
    a: 'Yes. While based in Calicut, Kerala, I work with clients across India and internationally over WhatsApp, email and video calls. Deliverables are shared digitally, so location is never a barrier.',
  },
  {
    q: 'How fast can you deliver a project?',
    a: 'Most websites ship in 1–2 weeks thanks to AI-accelerated workflows. Event photography is delivered color-graded within 3–5 days, and videos within a week, depending on length. You get a fixed timeline in the quote before we start.',
  },
  {
    q: 'What is AI-powered development?',
    a: 'It means I use modern AI tools to design, build, test and refine software — instead of hand-writing every line. The result for you: faster delivery, lower cost and modern quality, with a human accountable for the outcome.',
  },
  {
    q: 'How do I start a project with you?',
    a: 'Use the inquiry form on this page, message me on WhatsApp at +91 98467 50898, or email hello@mohdnihadkp.vercel.app. Tell me your idea, budget and timeline — you get a personal reply with a fixed quote within 24 hours.',
  },
]

export const PAGE_SEO: Record<string, PageMeta> = {
  home: {
    title: 'MN.KP — AI Developer & Freelancer in Calicut, Kerala | Mohammed Nihad KP',
    description:
      'Hire Mohammed Nihad KP (MN.KP) — an AI-powered web & app developer, photographer and digital creator from Calicut, Kerala. Websites, apps, media and marketing, delivered end-to-end.',
    keywords: [
      'AI developer Calicut', 'freelancer Calicut', 'web developer Kozhikode',
      'Mohammed Nihad KP', 'MN.KP', 'Kerala freelancer', 'AI web development India',
    ],
  },
  blog: {
    title: 'Blog — AI Development, Freelancing & One-Person Business | MN.KP',
    description:
      'Practical articles on AI-powered development, freelancing rates, photography and running a one-person business — written from Calicut, Kerala by Mohammed Nihad KP.',
    keywords: [
      'AI development blog', 'freelancing blog India', 'one person business',
      'AI tools blog', 'freelancer Kerala blog',
    ],
  },
  store: {
    title: 'Store — Best AI Tools, Software & Gear I Actually Use | MN.KP',
    description:
      'Honestly reviewed AI tools, software, hosting and creator gear — with prices for India, pros, cons and the best deals. Every pick is something I use in my own workflow.',
    keywords: [
      'best AI tools', 'AI tools India', 'affiliate store India',
      'software deals India', 'creator gear',
    ],
  },
  services: {
    title: 'Freelance Services in Calicut, Kerala — AI Development, Photography & Video | MN.KP',
    description:
      'Freelance services in Calicut (Kozhikode), Kerala: AI-powered website & app development, photography, videography, digital marketing and AI consulting by Mohammed Nihad KP. From ₹1,499.',
    keywords: [
      'web developer Calicut', 'photographer Calicut', 'videographer Kozhikode',
      'freelance services Kerala', 'AI development Calicut', 'website development Kozhikode',
    ],
  },
  about: {
    title: 'About Mohammed Nihad KP — AI-Powered Developer from Calicut | MN.KP',
    description:
      'The story of Mohammed Nihad KP — a Calicut-based AI-powered developer and digital creator building apps, ventures and a 195-country vision. Skills, journey and what I bring.',
    keywords: [
      'Mohammed Nihad KP', 'about Nihad KP', 'Calicut developer',
      'KP Foundation founder',
    ],
  },
  ventures: {
    title: 'KP Foundation Ventures — Calicut Store, Chaliyam, Calicut Gold & PolyStudy | MN.KP',
    description:
      'Explore the KP Foundation ecosystem built from Calicut, Kerala: Calicut Store, Chaliyam Connect, Calicut Gold and PolyStudy — one foundation, many ventures.',
    keywords: [
      'KP Foundation', 'Calicut Store', 'Chaliyam Connect', 'Calicut Gold', 'PolyStudy',
    ],
  },
  contact: {
    title: 'Contact Mohammed Nihad KP — AI Developer in Calicut, Kerala | MN.KP',
    description:
      'Contact Mohammed Nihad KP in Calicut, Kerala for projects, collaborations or questions. WhatsApp, email, phone or the 2-minute inquiry form — personal replies within 24 hours.',
    keywords: [
      'contact Nihad KP', 'Calicut web developer contact', 'hire developer Kerala',
    ],
  },
  help: {
    title: 'Help Center — FAQ, Account & Support | MN.KP',
    description:
      'Frequently asked questions about MN.KP — accounts, comments, services, orders, privacy and support. Quick answers for visitors and members.',
    keywords: ['MN.KP help', 'FAQ', 'support'],
  },
  search: {
    title: 'Search — Articles, Products & Services | MN.KP',
    description: 'Search the blog, affiliate store and services of Mohammed Nihad KP.',
  },
  legal: {
    title: 'Legal & Policies',
    description: 'Privacy policy, terms of service and platform policies of MN.KP.',
  },
}

// ── Structured data builders (server-rendered, no JS needed) ─
// AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not execute
// JavaScript — JSON-LD must be in the initial HTML.

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.url}/#person`,
    name: SITE.fullName,
    alternateName: ['MN.KP', 'Nihad KP'],
    jobTitle: 'AI-Powered Developer & Digital Creator',
    description: SITE.description,
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    telephone: `+${SITE.whatsappNumber}`,
    image: `${SITE.url}/avatar.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: CITY.name,
      addressRegion: CITY.region,
      addressCountry: 'IN',
    },
    sameAs: SOCIALS.filter((s) => /^https/.test(s.href)).map((s) => s.href),
    knowsAbout: [
      'AI Development', 'Web Development', 'Photography', 'Videography',
      'Digital Marketing', 'AI Tools', 'Freelancing',
    ],
    worksFor: { '@type': 'Organization', name: SITE.brand, url: SITE.url },
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: 'en-IN',
    author: { '@id': `${SITE.url}/#person` },
    publisher: { '@id': `${SITE.url}/#person` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ProfessionalService + geo — local signals for Calicut (GEO + local SEO)
export function professionalServiceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE.url}/services#service`,
    name: `${SITE.fullName} — AI Development & Creative Services`,
    description: PAGE_SEO.services.description,
    url: `${SITE.url}/services`,
    image: `${SITE.url}/og-image.png`,
    priceRange: '₹₹',
    telephone: `+${SITE.whatsappNumber}`,
    email: `mailto:${SITE.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: CITY.name,
      addressRegion: CITY.region,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CITY.geo.lat,
      longitude: CITY.geo.lng,
    },
    areaServed: [
      { '@type': 'City', name: 'Calicut' },
      { '@type': 'City', name: 'Kozhikode' },
      { '@type': 'State', name: 'Kerala' },
      { '@type': 'Country', name: 'India' },
    ],
    founder: { '@id': `${SITE.url}/#person` },
    sameAs: SOCIALS.filter((s) => /^https/.test(s.href)).map((s) => s.href),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  }
}

// AEO — FAQPage schema for answer engines (services, help center)
export function faqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function blogPostingJsonLd(post: {
  title: string
  slug: string
  excerpt?: string | null
  coverImage?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
  content?: string
  authorName?: string | null
  tags?: string
}) {
  const url = `${SITE.url}/blog/${post.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.excerpt || PAGE_SEO.blog.description,
    image: post.coverImage || `${SITE.url}/og-image.png`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    inLanguage: 'en-IN',
    keywords: (post.tags || '').split(',').map((t) => t.trim()).filter(Boolean).join(', '),
    wordCount: post.content ? post.content.split(/\s+/).filter(Boolean).length : undefined,
    author: {
      '@type': 'Person',
      name: post.authorName || SITE.fullName,
      url: `${SITE.url}/about`,
      '@id': `${SITE.url}/#person`,
    },
    publisher: { '@id': `${SITE.url}/#person` },
    isPartOf: { '@id': `${SITE.url}/#website` },
  }
}

export function productJsonLd(product: {
  name: string
  slug: string
  description?: string
  image?: string | null
  price?: number | null
  listPrice?: number | null
  currency?: string
  rating?: number | null
  ratingCount?: number | null
  brand?: string | null
  merchant?: string | null
  affiliateUrl?: string
  pros?: string
  cons?: string
}) {
  const url = `${SITE.url}/store/${product.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: (product.description || PAGE_SEO.store.description).slice(0, 500),
    image: product.image || `${SITE.url}/og-image.png`,
    url,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    positiveNotes: product.pros
      ? { '@type': 'ItemList', itemListElement: product.pros.split('|').filter(Boolean).map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p })) }
      : undefined,
    negativeNotes: product.cons
      ? { '@type': 'ItemList', itemListElement: product.cons.split('|').filter(Boolean).map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c })) }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: product.affiliateUrl || url,
      priceCurrency: product.currency || 'INR',
      price: product.price ?? undefined,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: product.merchant || 'Affiliate partner' },
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.ratingCount || 5,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }
}

// Inline <script> renderer for server components
export function jsonLdScript(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify(data).replace(/</g, '\\u003c'),
  }
}
