// Seed V2 tables: marquee items, ad units, footer links, media library,
// and a couple of sample form submissions. Idempotent — safe to re-run.
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  // ── Media library (images, GIFs, stickers) ─────────────────
  const mediaCount = await db.media.count()
  if (mediaCount === 0) {
    await db.media.createMany({
      data: [
        { name: 'Rocket sticker', url: '/sticker-rocket.png', type: 'sticker', alt: 'Rocket sticker' },
        { name: 'Spark sticker', url: '/sticker-spark.png', type: 'sticker', alt: 'Spark sticker' },
        { name: 'Camera sticker', url: '/sticker-camera.png', type: 'sticker', alt: 'Camera sticker' },
        { name: 'Star sticker', url: '/sticker-star.png', type: 'sticker', alt: 'Star sticker' },
        { name: 'AI cover', url: '/blog-ai.png', type: 'image', alt: 'AI blog cover', width: 1200, height: 630 },
        { name: 'Stack cover', url: '/blog-stack.png', type: 'image', alt: 'Stack blog cover', width: 1200, height: 630 },
        { name: 'World cover', url: '/blog-world.png', type: 'image', alt: 'World blog cover', width: 1200, height: 630 },
        { name: 'Bouncing dots GIF', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif', type: 'gif', alt: 'Rotating earth animation' },
      ],
    })
    console.log('✓ Media seeded')
  }

  // ── Marquee (scrolling image strip) ────────────────────────
  const marqueeCount = await db.marqueeItem.count()
  if (marqueeCount === 0) {
    await db.marqueeItem.createMany({
      data: [
        { title: 'AI-Powered Builds', imageUrl: '/marquee-ai.png', linkUrl: '/#/blog', badge: 'New', sortOrder: 1 },
        { title: 'KP Foundation', imageUrl: '/marquee-foundation.png', linkUrl: '/#/ventures', badge: '', sortOrder: 2 },
        { title: 'Photography', imageUrl: '/marquee-photo.png', linkUrl: '/#/services', badge: 'Service', sortOrder: 3 },
        { title: 'Calicut Store', imageUrl: '/marquee-store.png', linkUrl: '/#/store', badge: 'Shop', sortOrder: 4 },
        { title: 'Video & Motion', imageUrl: '/marquee-video.png', linkUrl: '/#/services', badge: '', sortOrder: 5 },
        { title: '195-Country Vision', imageUrl: '/marquee-world.png', linkUrl: '/#/about', badge: 'Vision', sortOrder: 6 },
      ],
    })
    console.log('✓ Marquee seeded')
  }

  // ── Footer links (admin-editable) ──────────────────────────
  const footerCount = await db.footerLink.count()
  if (footerCount === 0) {
    await db.footerLink.createMany({
      data: [
        // main — brand + social
        { section: 'main', label: 'About MN.KP', url: '/about', sortOrder: 1 },
        { section: 'main', label: 'Contact', url: '/contact', sortOrder: 2 },
        { section: 'main', label: 'Newsletter', url: '/#newsletter', sortOrder: 3 },
        // explore
        { section: 'explore', label: 'Blog', url: '/blog', sortOrder: 1 },
        { section: 'explore', label: 'Store', url: '/store', sortOrder: 2 },
        { section: 'explore', label: 'Services', url: '/services', sortOrder: 3 },
        { section: 'explore', label: 'Search', url: '/search', sortOrder: 4 },
        { section: 'explore', label: 'Help Center', url: '/help', sortOrder: 5 },
        // ventures
        { section: 'ventures', label: 'KP Foundation', url: '/ventures', sortOrder: 1 },
        { section: 'ventures', label: 'Calicut Store', url: '/ventures', sortOrder: 2 },
        { section: 'ventures', label: 'Chaliyam Connect', url: '/ventures', sortOrder: 3 },
        { section: 'ventures', label: 'Calicut Gold', url: '/ventures', sortOrder: 4 },
        { section: 'ventures', label: 'PolyStudy', url: '/ventures', sortOrder: 5 },
        // legal
        { section: 'legal', label: 'Privacy Policy', url: '/legal/privacy-policy', sortOrder: 1 },
        { section: 'legal', label: 'Terms of Service', url: '/legal/terms-of-service', sortOrder: 2 },
        { section: 'legal', label: 'Affiliate Disclosure', url: '/legal/affiliate-disclosure', sortOrder: 3 },
        { section: 'legal', label: 'Cookie Policy', url: '/legal/cookie-policy', sortOrder: 4 },
        { section: 'legal', label: 'Sitemap', url: '/sitemap.xml', sortOrder: 5 },
      ],
    })
    console.log('✓ Footer links seeded')
  }

  // ── Ad units (affiliate ads across the site) ───────────────
  const adCount = await db.adUnit.count()
  if (adCount === 0) {
    // Link ads to real products where possible
    const products = await db.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      take: 8,
      select: { id: true, name: true },
    })

    const byName = (kw: string) => products.find((p) => p.name.toLowerCase().includes(kw))?.id
    await db.adUnit.createMany({
      data: [
        {
          title: 'Featured Pick', description: 'Hand-picked by Nihad — the best value in the store right now.',
          productId: products[0]?.id ?? null, placement: 'home', badge: 'Sponsored', sortOrder: 1,
        },
        {
          title: 'Reader Favourite', description: 'The tool most blog readers end up buying.',
          productId: products[1]?.id ?? null, placement: 'blog-list', badge: 'Affiliate', sortOrder: 1,
        },
        {
          title: 'Used In This Article', description: 'Everything I recommend here, I use daily.',
          productId: products[2]?.id ?? null, placement: 'blog-inline', badge: 'Affiliate pick', sortOrder: 1,
        },
        {
          title: 'Gear I Trust', description: 'Zero fluff — only tested gear makes the list.',
          productId: products[3]?.id ?? null, placement: 'blog-sidebar', badge: 'Ad', sortOrder: 1,
        },
        {
          title: 'Store Highlight', description: 'This week\u2019s most-clicked product.',
          productId: products[4]?.id ?? null, placement: 'store', badge: 'Hot', sortOrder: 1,
        },
        {
          title: 'Built With This', description: 'Book a service and see this stack in action.',
          productId: products[5]?.id ?? null, placement: 'services', badge: 'Sponsored', sortOrder: 1,
        },
        {
          title: 'Support MN.KP', description: 'Buying through our links supports free content at no extra cost.',
          linkUrl: '/store', imageUrl: null, placement: 'footer', badge: 'Affiliate', sortOrder: 1,
        },
      ].map((ad) => ({ ...ad, active: true })),
    })
    console.log('✓ Ad units seeded')
  }

  // ── Sample form submissions (so inbox isn't empty) ─────────
  const subCount = await db.formSubmission.count()
  if (subCount === 0) {
    await db.formSubmission.createMany({
      data: [
        {
          formType: 'contact', name: 'Aisha Rahman', email: 'aisha.rahman@example.com',
          phone: '+91 98460 12345', subject: 'Wedding photography — Dec 2026',
          message: 'Hi Nihad, saw your portfolio. Need a full-day wedding shoot in Calicut on 12 Dec. What are your packages?',
          page: '/contact', status: 'NEW',
        },
        {
          formType: 'newsletter', email: 'deepak.menon@example.com', name: 'Deepak Menon',
          page: '/', status: 'NEW', data: JSON.stringify({ source: 'footer' }),
        },
        {
          formType: 'service-inquiry', name: 'Farhana K', email: 'farhana.k@example.com',
          phone: '+91 94470 55667', subject: 'AI web app for boutique',
          message: 'I run a small boutique in Kozhikode and want an AI-powered online store with WhatsApp ordering.',
          page: '/services', status: 'READ', data: JSON.stringify({ budget: '₹50,000–₹1,00,000', service: 'AI Development' }),
        },
      ],
    })
    console.log('✓ Sample submissions seeded')
  }

  // ── Upgrade seeded products with richer affiliate data ─────
  const withSource = await db.product.count({ where: { NOT: { source: 'CUSTOM' } } })
  if (withSource === 0) {
    const all = await db.product.findMany({ select: { id: true, name: true, price: true } })
    const merchants: Array<[string, string, string]> = [
      ['hosting', 'AMAZON', 'Amazon Associates'],
      ['logitech', 'AMAZON', 'Amazon Associates'],
      ['keyboard', 'AMAZON', 'Amazon Associates'],
      ['camera', 'AMAZON', 'Amazon Associates'],
      ['mic', 'FLIPKART', 'Flipkart Affiliate'],
      ['samsung', 'FLIPKART', 'Flipkart Affiliate'],
      ['notion', 'CUSTOM', 'Direct partner'],
      ['figma', 'CUSTOM', 'Direct partner'],
    ]
    let i = 0
    for (const p of all) {
      const [source, , badge] = merchants[i % merchants.length]
      await db.product.update({
        where: { id: p.id },
        data: {
          source,
          badge: i < 3 ? ["Editor's Choice", 'Best Value', 'Top Rated'][i] : (i % 2 === 0 ? 'Popular' : null),
          listPrice: p.price ? Math.round(p.price * 1.25) : null,
          ratingCount: 120 + i * 37,
          brand: source === 'AMAZON' ? 'Amazon' : source === 'FLIPKART' ? 'Flipkart' : 'MN.KP Pick',
          pros: 'Genuine value|Daily-driver tested|Great support',
          cons: i % 2 === 0 ? 'Premium price' : 'Learning curve',
          specs: 'Warranty:1 year|Shipping:Pan-India|Returns:30-day',
          coupon: i % 3 === 0 ? 'MNKP10' : null,
          couponNote: i % 3 === 0 ? '10% off at checkout' : null,
          disclosure: 'As an Amazon Associate, MN.KP earns from qualifying purchases.',
        },
      })
      i++
    }
    console.log('✓ Products enriched with affiliate data')
  }

  console.log('V2 seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
