// MN.KP brand assets: logo, favicon set, marquee banners, stickers
// Run: bun scripts/generate-brand.ts
import fs from 'fs'
import sharp from 'sharp'

const GOLD = (id: string) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f6e27a"/>
    <stop offset="0.5" stop-color="#d4af37"/>
    <stop offset="1" stop-color="#b8860b"/>
  </linearGradient>`

const DEEP = '#0c1210'

async function svgToPng(svg: string, out: string, w: number, h: number) {
  await sharp(Buffer.from(svg), { density: 300 }).resize(w, h).png().toFile(out)
  console.log(`✓ ${out} (${w}x${h})`)
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function main() {
  // ── 1. Favicon / app icon (square) ───────────────────────
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>${GOLD('gold')}</defs>
  <rect width="512" height="512" rx="108" fill="${DEEP}"/>
  <rect x="14" y="14" width="484" height="484" rx="96" fill="none" stroke="url(#gold)" stroke-width="8" opacity="0.9"/>
  <text x="256" y="268" font-family="Arial, Helvetica, sans-serif" font-size="196" font-weight="800" fill="url(#gold)" text-anchor="middle" letter-spacing="4">MN</text>
  <text x="256" y="382" font-family="Arial, Helvetica, sans-serif" font-size="104" font-weight="800" fill="#f6e27a" text-anchor="middle" letter-spacing="6">.KP</text>
</svg>`
  fs.writeFileSync('public/icon.svg', iconSvg)
  await svgToPng(iconSvg, 'public/favicon.png', 48, 48)
  await svgToPng(iconSvg, 'public/apple-touch-icon.png', 180, 180)
  await svgToPng(iconSvg, 'public/icon-192.png', 192, 192)
  await svgToPng(iconSvg, 'public/icon-512.png', 512, 512)

  // ── 2. Wordmark logo (wide) ───────────────────────────────
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200">
  <defs>${GOLD('gold2')}</defs>
  <rect x="8" y="40" width="120" height="120" rx="28" fill="${DEEP}" stroke="url(#gold2)" stroke-width="3"/>
  <text x="68" y="112" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="800" fill="#f6e27a" text-anchor="middle">MN</text>
  <text x="68" y="144" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800" fill="#d4af37" text-anchor="middle">.KP</text>
  <text x="152" y="128" font-family="Arial, Helvetica, sans-serif" font-size="104" font-weight="800" fill="url(#gold2)" letter-spacing="4">MN.KP</text>
</svg>`
  fs.writeFileSync('public/logo.svg', logoSvg)
  await svgToPng(logoSvg, 'public/logo.png', 360, 100)

  // ── 3. Marquee banners (wide cards for the scrolling strip) ──
  const banners: Array<{ file: string; title: string; sub: string; c1: string; c2: string }> = [
    { file: 'marquee-ai', title: 'AI Development', sub: 'Websites & apps, shipped fast', c1: '#052e22', c2: '#0c1210' },
    { file: 'marquee-photo', title: 'Photography', sub: 'Shot &amp; graded in Lightroom', c1: '#1f1503', c2: '#0c1210' },
    { file: 'marquee-video', title: 'Videography', sub: 'Reels, promos & brand films', c1: '#101c26', c2: '#0c1210' },
    { file: 'marquee-store', title: 'MN.KP Store', sub: 'Curated tools & gear picks', c1: '#26180a', c2: '#0c1210' },
    { file: 'marquee-foundation', title: 'KP Foundation', sub: 'One foundation, many ventures', c1: '#0b2820', c2: '#0c1210' },
    { file: 'marquee-world', title: 'Calicut → World', sub: 'The 195-country mission', c1: '#0a1626', c2: '#0c1210' },
  ]
  for (const b of banners) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320">
  <defs>${GOLD('g')}<radialGradient id="glow" cx="0.8" cy="0.2" r="1">
    <stop offset="0" stop-color="${b.c1}"/><stop offset="1" stop-color="${b.c2}"/>
  </radialGradient></defs>
  <rect width="640" height="320" rx="36" fill="url(#glow)"/>
  <circle cx="560" cy="60" r="150" fill="${b.c1}" opacity="0.55"/>
  <rect x="6" y="6" width="628" height="308" rx="32" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.8"/>
  <circle cx="80" cy="228" r="7" fill="#f6e27a"/>
  <text x="80" y="132" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="800" fill="#f6e27a">${esc(b.title.split(' ').slice(0, 2).join(' ').toUpperCase())}</text>
  <text x="80" y="196" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="400" fill="#e8e4d8" opacity="0.85">${esc(b.sub)}</text>
</svg>`
    await svgToPng(svg, `public/${b.file}.png`, 640, 320)
  }

  // ── 4. Stickers (transparent PNGs) ───────────────────────
  const stickers = [
    {
      file: 'sticker-star', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs>${GOLD('gs')}</defs>
  <path d="M120 18 L146 92 L224 96 L162 144 L184 220 L120 176 L56 220 L78 144 L16 96 L94 92 Z" fill="url(#gs)" stroke="#8a6d1a" stroke-width="6" stroke-linejoin="round"/>
</svg>`,
    },
    {
      file: 'sticker-rocket', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs>${GOLD('gr')}<linearGradient id="fire" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e27a"/><stop offset="1" stop-color="#d97706"/></linearGradient></defs>
  <path d="M120 16 C160 56 172 108 168 152 L72 152 C68 108 80 56 120 16 Z" fill="url(#gr)" stroke="#8a6d1a" stroke-width="6"/>
  <circle cx="120" cy="92" r="22" fill="#0c1210" stroke="#f6e27a" stroke-width="5"/>
  <path d="M72 152 L44 196 L76 186 Z" fill="url(#gr)"/>
  <path d="M168 152 L196 196 L164 186 Z" fill="url(#gr)"/>
  <path d="M100 160 L120 228 L140 160 Z" fill="url(#fire)"/>
</svg>`,
    },
    {
      file: 'sticker-camera', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs>${GOLD('gc')}</defs>
  <rect x="24" y="64" width="192" height="128" rx="24" fill="url(#gc)" stroke="#8a6d1a" stroke-width="6"/>
  <rect x="88" y="40" width="64" height="28" rx="10" fill="url(#gc)"/>
  <circle cx="120" cy="128" r="42" fill="#0c1210" stroke="#f6e27a" stroke-width="6"/>
  <circle cx="120" cy="128" r="20" fill="#f6e27a" opacity="0.85"/>
  <circle cx="188" cy="88" r="10" fill="#0c1210"/>
</svg>`,
    },
    {
      file: 'sticker-spark', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs>${GOLD('gp')}</defs>
  <path d="M120 12 C132 78 162 108 228 120 C162 132 132 162 120 228 C108 162 78 132 12 120 C78 108 108 78 120 12 Z" fill="url(#gp)" stroke="#8a6d1a" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="120" cy="120" r="16" fill="#fff7cf"/>
</svg>`,
    },
  ]
  for (const s of stickers) {
    await sharp(Buffer.from(s.svg), { density: 300 }).resize(240, 240).png().toFile(`public/${s.file}.png`)
    console.log(`✓ public/${s.file}.png (240x240)`)
  }

  console.log('MN.KP brand assets complete.')
}

main().catch((e) => {
  console.error('Brand generation failed:', e)
  process.exit(1)
})
