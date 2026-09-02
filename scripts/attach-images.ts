// Attach generated images to seeded posts + admin avatar
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  await db.user.update({
    where: { email: 'admin@nihadkp.com' },
    data: { image: '/avatar.png' },
  })

  const covers: Record<string, string> = {
    'why-i-build-with-ai': '/blog-ai.png',
    'how-i-shipped-this-website': '/blog-ai.png',
    'one-person-business-stack-2026': '/blog-stack.png',
    'freelancer-pricing-guide-kerala': '/blog-stack.png',
    'calicut-to-195-countries': '/blog-world.png',
    'photography-meets-ai-workflow': '/blog-stack.png',
  }
  for (const [slug, cover] of Object.entries(covers)) {
    await db.post.update({ where: { slug }, data: { coverImage: cover } })
  }
  console.log('✓ Covers attached, admin avatar set')
}

main().catch(console.error).finally(() => db.$disconnect())
