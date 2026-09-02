// Seed the Venture table from the VENTURES constant (idempotent).
import { PrismaClient } from '@prisma/client'
import { VENTURES } from '../src/lib/constants'

const db = new PrismaClient()

async function main() {
  for (const [i, v] of VENTURES.entries()) {
    const existing = await db.venture.findFirst({ where: { name: v.name } })
    if (existing) {
      console.log('exists:', v.name)
      continue
    }
    await db.venture.create({
      data: {
        name: v.name,
        tagline: v.tagline,
        description: v.description,
        href: v.href,
        icon: v.icon,
        accent: v.accent,
        badge: v.badge,
        sortOrder: i + 1,
        active: true,
      },
    })
    console.log('seeded:', v.name)
  }
  const total = await db.venture.count()
  console.log('total ventures:', total)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(() => db.$disconnect())
