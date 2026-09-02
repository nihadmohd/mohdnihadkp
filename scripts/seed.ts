// Seed script — admin account, posts, products, services, plans, settings
// Run: bun scripts/seed.ts
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const db = new PrismaClient()

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const ADMIN_EMAIL = 'admin@nihadkp.com'
const ADMIN_PASSWORD = 'Nihad@2026'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90)
}

async function main() {
  console.log('🌱 Seeding database…')

  // ── Admin user ──────────────────────────────────────────────
  const admin = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: 'Mohammed Nihad KP',
      passwordHash: hashPassword(ADMIN_PASSWORD),
      role: 'ADMIN',
      emailVerified: new Date(),
      onboarded: true,
      plan: 'BUSINESS',
    },
  })
  console.log(`✓ Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)

  // ── Plans ───────────────────────────────────────────────────
  const plans = [
    { code: 'FREE', name: 'Free', priceMonthly: 0, sortOrder: 0, features: 'Read all blog posts|Browse the store|Submit service inquiries|Community comments' },
    { code: 'PRO', name: 'Pro', priceMonthly: 299, sortOrder: 1, features: 'Everything in Free|Monthly newsletter drops|Early access to articles|Priority inquiry queue|Downloadable resources' },
    { code: 'BUSINESS', name: 'Business', priceMonthly: 999, sortOrder: 2, features: 'Everything in Pro|Priority project slots|Free consultation calls|Custom content requests|WhatsApp direct line' },
  ]
  for (const p of plans) {
    await db.plan.upsert({ where: { code: p.code }, update: p, create: p })
  }
  console.log('✓ Plans: Free / Pro / Business')

  // ── Services ────────────────────────────────────────────────
  const services = [
    { title: 'Photography & Photo Editing', slug: 'photography', icon: 'camera', priceFrom: '₹1,499', sortOrder: 1, featured: true,
      description: 'End-to-end photography — from concept to color-graded final delivery. Events, products, portraits and brand shoots, edited professionally in Lightroom.',
      features: 'Event & product shoots|Professional color grading|Retouching & enhancement|Fast delivery' },
    { title: 'Videography & Video Editing', slug: 'videography', icon: 'video', priceFrom: '₹2,999', sortOrder: 2, featured: true,
      description: 'Cinematic videography and precision editing with CapCut and Adobe tools — reels, promos, event films and brand stories that hold attention.',
      features: 'Cinematic event films|Reels & short-form content|Motion graphics & titles|Sound design included' },
    { title: 'Websites & Apps Using AI', slug: 'ai-development', icon: 'code', priceFrom: '₹4,999', sortOrder: 3, featured: true,
      description: 'I build apps, websites and digital solutions by mastering AI tools instead of hand-writing every line — meaning faster delivery, lower cost, and modern quality.',
      features: 'Portfolio & business sites|Web apps & dashboards|AI-assisted rapid delivery|SEO-ready builds' },
    { title: 'AI Mastery Consulting', slug: 'ai-mastery', icon: 'brain', priceFrom: '₹999', sortOrder: 4,
      description: 'Learn to leverage artificial intelligence the way I do — practical sessions on using AI tools for development, content, automation and business.',
      features: '1-on-1 AI tool training|Workflow automation setup|Prompt engineering|Team workshops' },
    { title: 'Digital Marketing', slug: 'marketing', icon: 'megaphone', priceFrom: '₹2,499', sortOrder: 5,
      description: 'Full-stack digital presence — social strategy, content calendars, campaign creatives and business planning grounded in market analysis.',
      features: 'Social media strategy|Content calendars|Campaign creatives|Market analysis & planning' },
    { title: 'Creative Media Production', slug: 'creative-media', icon: 'palette', priceFrom: '₹1,999', sortOrder: 6,
      description: 'Complete creative production — combining Canva, PicsArt, PixelLab and Adobe into one seamless visual pipeline for your brand.',
      features: 'Brand visual kits|Social creatives|Print & digital design|Consistent visual language' },
  ]
  for (const s of services) {
    await db.service.upsert({ where: { slug: s.slug }, update: s, create: s })
  }
  console.log(`✓ Services: ${services.length}`)

  // ── Blog posts ──────────────────────────────────────────────
  const posts = [
    {
      title: 'Why I Build With AI Instead of Writing Every Line of Code',
      slug: 'why-i-build-with-ai',
      tags: 'ai, development, philosophy',
      category: 'AI',
      featured: true,
      excerpt: "I don't hand-write every line of code — and that's exactly the point. Here's the reasoning behind mastering AI tools instead of competing with them.",
      seoTitle: 'Why I Build With AI Instead of Writing Every Line of Code',
      seoDescription: "A freelancer's case for AI-driven development: how mastering AI tools beats competing with them, and what it means for clients.",
      content: `Everyone asks the same question when they hear how I work: *"But didn't you write the code yourself?"*

The honest answer: no, not every line. And that is the strategy, not a shortcut.

## The shift that changed everything

After my Computer Engineering diploma, I noticed something uncomfortable. The traditional path — memorize syntax, grind for years, compete on raw typing speed — was becoming a commodity. Meanwhile, a small group of people were learning to *direct* AI tools: describe precisely, review intelligently, test ruthlessly.

The second group shipped 10x faster. I chose to join them.

## What "AI-driven execution" actually means

It's not typing "build my website" and hoping. The real workflow looks like this:

1. **Architecture first** — I still design the system, the data models, the flow. AI doesn't decide *what* to build; I do.
2. **Precise delegation** — instead of writing boilerplate for hours, I generate it and review every line like a senior engineer reviewing a junior's PR.
3. **Rapid testing loops** — AI generates test cases, I validate edge cases. Software testing is where AI assistance compounds the most.
4. **Human polish** — the last 20% (the feel, the details, the judgment) is where I spend my human hours.

## What this means for clients

- **Lower cost**: you're not paying for hours of boilerplate typing.
- **Faster delivery**: what took months now takes weeks, honestly.
- **Modern quality**: the stack is current because updating is cheap.

## The honest limits

AI-assisted doesn't mean flawless. Hallucinations happen. Dependencies go stale. That's why review discipline matters more, not less. The tools amplify judgment — good or bad.

The people who will win the next decade aren't the ones who avoid AI, nor the ones who blindly trust it. They're the ones who **master** it. That's the entire thesis of how I work — and this website you're reading is built the same way.`,
    },
    {
      title: 'The One-Person Business Stack: Every Tool I Actually Use in 2026',
      slug: 'one-person-business-stack-2026',
      tags: 'tools, business, freelancing',
      category: 'Business',
      featured: true,
      excerpt: 'The complete, honest toolkit behind a one-person digital business from Calicut — hosting, AI, design, and why each one earned its place.',
      seoTitle: 'The One-Person Business Stack (2026) — Every Tool I Use',
      seoDescription: 'Hosting, AI tools, design apps and workflow: the honest 2026 toolkit running a one-person digital business from Kerala.',
      content: `Running a one-person business means every tool either saves you time or costs you money. After years of experimenting, here's what survived — and what each one actually does for me.

## Foundation: where everything lives

**Vercel and Netlify** host most of my projects. Both have free tiers generous enough for real client work in the beginning, and deploys are instant — push to GitHub, done.

**Firebase** handles the projects that need auth, storage and realtime data without me maintaining a backend. For Postgres-backed apps, **Neon** (serverless Postgres) with **Supabase** (auth + storage + realtime on top) is my current default — that's literally the stack this site is designed around.

**GitHub** is non-negotiable. Everything versioned, everything backed up, every AI tool gets a repository to work with.

## The AI core

This deserves its own post (and will get one), but the short version: I treat AI tools as *team members* with different skills. One drafts, one reviews, one tests, one designs. My job is orchestration and quality control.

## Creative pipeline

- **CapCut** — 80% of my video edits, fast
- **Adobe suite** — the professional 20% that clients pay for
- **Lightroom** — every photo you'll ever see from me passes through it
- **Canva, PicsArt, PixelLab** — social creatives and quick brand visuals
- **Google ecosystem** — workspace, business profile, analytics: the operations backbone

## The business side

Market analysis, business planning, and team management run on the Google ecosystem plus honest spreadsheets. No fancy tool replaces knowing your numbers.

## The rule that ties it together

Every tool above pays for itself in saved hours or earned revenue. The moment one stops doing that, it gets cut — no sentimentality. That discipline is probably worth more than the stack itself.`,
    },
    {
      title: 'From Calicut to 195 Countries: The Plan Behind the Goal',
      slug: 'calicut-to-195-countries',
      tags: 'vision, travel, business',
      category: 'Business',
      featured: false,
      excerpt: "Traveling to all 195 countries sounds like a dream. Here's the actual plan — the business model, the timeline, and why I'm building it from Kerala.",
      seoTitle: 'From Calicut to 195 Countries — The Plan Behind the Goal',
      seoDescription: 'How a developer from Calicut plans to visit all 195 countries: the business model, the ventures, and the honest math.',
      content: `When I say I want to visit all 195 countries, people hear "travel dream." I hear "business architecture problem." Here's the difference.

## Why the goal exists

It's not a bucket list item. It's a forcing function. A goal that big forces you to build income that isn't chained to your location, systems that run without you, and skills the world pays for anywhere.

## The three pillars

**1. Location-independent income.** AI-driven development work is my core. Clients in Europe, the GCC, and beyond pay for outcomes — they don't care where I sit. Remote-first isn't a perk; it's the strategy.

**2. Ventures that compound.** KP Foundation is the parent — Calicut Store, Chaliyam Connect, Calicut Gold and PolyStudy live under it. Each one is designed to eventually run with minimal daily input. Slow to build, but they stack.

**3. Skills that travel.** Photography, videography, AI mastery, marketing — every skill in my toolkit earns money in any country. The plan literally pays for the journey.

## The honest math

195 countries at roughly 3–4 per year once the income engine is stable. Some years will be slower — that's fine. The visa rejections, the maritime detours, the scholarship years in between: all part of the route, not obstacles to it.

## Why I'm public about it

Accountability compounds like interest. Every client who reads this knows what they're buying into: someone building something long-term, not chasing quick projects.

Calicut is home base. The world is the plan.`,
    },
    {
      title: 'Photography Meets AI: My Complete Workflow From Shoot to Delivery',
      slug: 'photography-meets-ai-workflow',
      tags: 'photography, ai, workflow',
      category: 'Media',
      featured: false,
      excerpt: "Cull, grade, retouch, deliver — here's exactly how AI changed each stage of my photography workflow without losing the human eye.",
      seoTitle: 'Photography Meets AI: My Shoot-to-Delivery Workflow',
      seoDescription: 'The complete AI-assisted photography workflow: culling, color grading in Lightroom, retouching and delivery — and where the human eye stays essential.',
      content: `Photography was my first craft — years before AI entered my toolkit. Combining the two is where things got interesting.

## Stage 1: The shoot (100% human)

No AI points a camera. Composition, light, moment, connection with the subject — this is the craft that AI cannot replace and clients actually feel in the final photos.

## Stage 2: Culling (AI-assisted)

Reviewing 2,000 frames from an event used to eat entire evenings. AI-assisted culling tools now flag blinks, blur and duplicates in minutes. I still make every keep/reject call — but I make it from a shortlist, not a mountain.

## Stage 3: Color grading (Lightroom + presets + AI)

My base grades live in Lightroom presets I've refined over years. AI suggestions help with batch corrections (white balance drift across an event is the classic example). The signature look — warm, honest, editorial — stays mine.

## Stage 4: Retouching (surgical, selective)

Heavy, obvious retouching looks cheap. AI cleanup handles distractions (a stray wire, a photobomber) in seconds. Skin stays real. People should recognize themselves.

## Stage 5: Delivery

Galleries, watermarks, export presets — automated. The client experience feels instant, which is exactly the point.

## The takeaway

AI removed the boring hours between the art and the delivery. It didn't touch the art. That's the healthy division of labor in every part of my work — and probably the honest answer to "will AI replace creative professionals?" Not the ones who master it.`,
    },
    {
      title: "How I Shipped This Website (Yes, With AI — and Here's the Architecture)",
      slug: 'how-i-shipped-this-website',
      tags: 'ai, development, meta',
      category: 'AI',
      featured: true,
      excerpt: "The site you're reading right now — here's the full architecture, the realtime engine, the admin dashboard, and how it was built.",
      seoTitle: 'How I Shipped This Website — Full Architecture Breakdown',
      seoDescription: 'The complete architecture of nihadkp.com: Next.js 16, realtime live visitors, admin dashboard, SEO strategy and the AI-driven build process.',
      content: `You're reading the proof of concept. This website *is* my portfolio piece — built with the exact workflow I sell.

## The stack

- **Next.js 16** with App Router, React 19, TypeScript
- **Tailwind CSS 4 + shadcn/ui** for the design system
- **Prisma + Postgres** (Neon/Supabase-ready; SQLite in development)
- **socket.io** realtime service for live visitor counts
- Custom **JWT auth** with scrypt hashing — no third-party lock-in

## The features I'm proudest of

**Live visitor counting.** The badge in the navigation is a true realtime count — WebSocket connections, not fake numbers. The admin dashboard sees which pages live visitors are reading *right now*.

**A real admin dashboard.** Every piece of content — this post included — is managed from it: posts with a markdown editor and per-post SEO fields, store products, services, inquiries, comments moderation, users, analytics charts, even a maintenance mode switch.

**Full customer lifecycle.** Register, verify email, reset password, onboarding, billing plans with upgrade/downgrade/cancel flows, support tickets with a real conversation thread, a help center — the works.

**15 legal documents** in plain language. Most portfolios skip this entirely.

**SEO on every route**: per-page titles, meta descriptions, OpenGraph, JSON-LD structured data (BlogPosting, Person, BreadcrumbList), sitemap, robots.

## How AI actually built this

I designed the architecture, the data model, every screen and interaction. AI wrote boilerplate at my direction. I reviewed, tested, and refined everything you can click. Total build time: about a day. The traditional estimate for this feature set would be weeks.

## Try it

Open the command palette with **Ctrl+K**. Watch the live counter. Register an account. If you're the admin, the dashboard is one click away. Everything works — because a portfolio that doesn't function is just a poster.`,
    },
    {
      title: 'The Freelancer Pricing Guide I Wish Someone Gave Me in Kerala',
      slug: 'freelancer-pricing-guide-kerala',
      tags: 'business, freelancing, pricing',
      category: 'Business',
      featured: false,
      excerpt: "Pricing is where freelancers bleed the most. The exact framework I use — from ₹1,499 shoots to five-figure projects — without underselling.",
      seoTitle: 'The Freelancer Pricing Guide I Wish Someone Gave Me',
      seoDescription: 'How a Kerala freelancer prices photography, video, websites and AI services — the framework, the numbers, and the psychology.',
      content: `When I started, I priced like most freelancers in Kerala: low, scared, and hoping volume would save me. It doesn't. Here's the framework I use now.

## The three pricing anchors

**Value anchor.** What does the client actually gain? A website that brings ₹5L/month in new business is worth more than ₹5,000 — even if it takes me a week.

**Time anchor.** My minimum hourly floor. AI makes me fast, but speed is *my* advantage, not a discount — the client pays for outcomes, not my hours.

**Market anchor.** Local rates matter for local clients, global rates for remote ones. The same website costs differently for a Calicut store and a Dubai brand. That's not dishonesty; that's two different markets.

## The actual numbers I publish

- Photography from **₹1,499** — enough to filter serious clients, low enough to start relationships
- Videography from **₹2,999** — editing hours dominate the real cost
- Websites & apps from **₹4,999** — AI-driven speed makes honest pricing possible
- AI training from **₹999**/session — knowledge work, priced per value delivered

"From" matters: it's a floor, not a ceiling. Scoping happens per project.

## Rules that protect you

1. **50% upfront, always.** No exceptions, no matter how friendly the client.
2. **Scope in writing** — email or WhatsApp confirmation counts. Memory doesn't.
3. **Changes cost.** Two rounds included, then hourly. Say it before the project, not during.
4. **Raise prices when booked out.** Full calendar = you're undercharging.

## The mindset shift

Cheap clients are the *most* demanding — an inverse law of freelancing. Every rupee you add filters better clients in. I learned it late; you get to learn it from this post.`,
    },
  ]

  for (const p of posts) {
    const existing = await db.post.findUnique({ where: { slug: p.slug } })
    if (!existing) {
      await db.post.create({
        data: {
          ...p,
          authorId: admin.id,
          published: true,
          readingMinutes: Math.max(2, Math.round(p.content.split(/\s+/).length / 200)),
          views: Math.floor(Math.random() * 120) + 40,
          publishedAt: new Date(Date.now() - Math.floor(Math.random() * 40) * 24 * 3600 * 1000),
        },
      })
    }
  }
  console.log(`✓ Posts: ${posts.length}`)

  // ── Store products (affiliate) ──────────────────────────────
  const products = [
    { name: 'Hostinger Premium Hosting', category: 'Hosting', merchant: 'Hostinger', price: 149, rating: 4.5, featured: true, clicks: 34,
      affiliateUrl: 'https://hostinger.in',
      description: 'Where I host client sites when they need cPanel-style simplicity. First-year pricing is genuinely cheap and support actually replies. Best for small business sites and landing pages.' },
    { name: 'Vercel Pro', category: 'Hosting', merchant: 'Vercel', price: 1700, rating: 4.8, featured: true, clicks: 21,
      affiliateUrl: 'https://vercel.com',
      description: 'The platform behind most of my Next.js deploys (this site runs on the same pattern). Zero-config, instant previews on every git push. Pro unlocks team features and analytics.' },
    { name: 'Neon Serverless Postgres', category: 'Database', merchant: 'Neon', price: 0, rating: 4.7, featured: true, clicks: 18,
      affiliateUrl: 'https://neon.tech',
      description: 'Serverless Postgres with a generous free tier — the database this platform is designed around. Branching databases like git branches is a genuinely new capability.' },
    { name: 'Supabase', category: 'Database', merchant: 'Supabase', price: 0, rating: 4.6, featured: true, clicks: 27,
      affiliateUrl: 'https://supabase.com',
      description: 'Open-source Firebase alternative on Postgres. Auth, storage, realtime and row-level security in one free tier. My default for apps that need a backend fast.' },
    { name: 'Canva Pro', category: 'Design', merchant: 'Canva', price: 499, rating: 4.7, featured: false, clicks: 42,
      affiliateUrl: 'https://canva.com',
      description: 'The workhorse of my social creatives pipeline. Brand kits, resize-magic and background remover save hours every week. Clients never believe the speed.' },
    { name: 'CapCut Pro', category: 'Video', merchant: 'CapCut', price: 799, rating: 4.6, featured: false, clicks: 38,
      affiliateUrl: 'https://capcut.com',
      description: '80% of my video edits happen here — speed is unmatched for reels and social content. The Pro tier unlocks the full template and effects library I use for client work.' },
    { name: 'Adobe Creative Cloud', category: 'Design', merchant: 'Adobe', price: 4230, rating: 4.4, featured: false, clicks: 12,
      affiliateUrl: 'https://adobe.com',
      description: 'The professional 20% — Premiere Pro for final client edits, Photoshop for retouching. The subscription stings but the industry compatibility is non-negotiable.' },
    { name: 'Logitech C920 HD Webcam', category: 'Gear', merchant: 'Amazon', price: 4500, rating: 4.4, featured: false, clicks: 15,
      affiliateUrl: 'https://amazon.in',
      description: 'The client-call camera that never let me down — sharp 1080p, reliable autofocus, works everywhere without drivers.' },
    { name: 'Godox SL60W Lighting Kit', category: 'Gear', merchant: 'Amazon', price: 8500, rating: 4.5, featured: false, clicks: 9,
      affiliateUrl: 'https://amazon.in',
      description: 'Daylight-balanced key light that transformed my indoor shoots and video calls alike. Bowens mount means the accessory ecosystem is endless.' },
    { name: 'Keychron K2 Mechanical Keyboard', category: 'Gear', merchant: 'Amazon', price: 5900, rating: 4.6, featured: false, clicks: 23,
      affiliateUrl: 'https://amazon.in',
      description: 'Hot-swappable, wireless, Mac/Windows toggle. Long build days deserve a keyboard that makes typing feel good.' },
    { name: 'ChatGPT Plus', category: 'AI Tools', merchant: 'OpenAI', price: 1999, rating: 4.5, featured: true, clicks: 51,
      affiliateUrl: 'https://chat.openai.com',
      description: 'My daily driver for drafting, planning and reviewing. The single highest-ROI subscription in the entire stack — it pays for itself on day one each month.' },
    { name: 'Midjourney Standard', category: 'AI Tools', merchant: 'Midjourney', price: 2450, rating: 4.7, featured: false, clicks: 19,
      affiliateUrl: 'https://midjourney.com',
      description: 'Concept art, mood boards and cover visuals. Photoreal mode keeps blurring the line between generated and shot — great for pre-visualizing client projects.' },
  ]
  for (const p of products) {
    const slug = slugify(p.name)
    const existing = await db.product.findUnique({ where: { slug } })
    if (!existing) {
      await db.product.create({ data: { ...p, slug, active: true, sortOrder: 0 } })
    }
  }
  console.log(`✓ Products: ${products.length}`)

  // ── Settings ────────────────────────────────────────────────
  const settings: Array<[string, string]> = [
    ['siteName', 'Mohammed Nihad KP'],
    ['tagline', 'AI-Powered Developer & Digital Creator'],
    ['announcement', 'This platform is live — blog, store, services & a realtime admin dashboard. Explore!'],
    ['maintenanceMode', 'false'],
    ['contactEmail', 'hello@nihadkp.com'],
    ['whatsappNumber', '919846750898'],
    ['showLiveCounter', 'true'],
    ['blogEnabled', 'true'],
    ['storeEnabled', 'true'],
    ['seoTitle', 'Mohammed Nihad KP — AI-Powered Developer & Digital Creator'],
    ['seoDescription', 'Portfolio, blog, store and services of Mohammed Nihad KP — freelancer, businessman and AI-driven developer from Calicut, Kerala.'],
    ['footerNote', 'Built with AI, from Calicut to the world.'],
  ]
  for (const [key, value] of settings) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
  }
  console.log('✓ Settings')

  // ── Demo analytics (page views so charts look alive) ────────
  const viewCount = await db.pageView.count()
  if (viewCount < 20) {
    const paths = ['/', '/blog', '/store', '/services', '/about', '/ventures', '/contact', '/blog/why-i-build-with-ai', '/help', '/search']
    const referrers = ['', '', '', 'https://www.google.com/', 'https://www.instagram.com/', 'https://www.linkedin.com/', 'https://x.com/', 'https://chat.whatsapp.com/']
    for (let i = 0; i < 90; i++) {
      const daysAgo = Math.floor(Math.random() * 7)
      await db.pageView.create({
        data: {
          path: paths[Math.floor(Math.random() * paths.length)],
          referrer: referrers[Math.floor(Math.random() * referrers.length)] || null,
          sessionId: `seed-${Math.floor(Math.random() * 40)}`,
          device: Math.random() > 0.45 ? 'mobile' : 'desktop',
          createdAt: new Date(Date.now() - daysAgo * 24 * 3600 * 1000 - Math.floor(Math.random() * 20) * 3600 * 1000),
        },
      })
    }
    console.log('✓ Demo analytics: 90 page views')
  }

  console.log('\n🎉 Seed complete!')
  console.log(`\n➜ Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  console.log('➜ Visit /#/login and sign in, then /#/admin')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
