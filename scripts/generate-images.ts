// Generate brand images: avatar, OG banner, blog covers
// Run: bun scripts/generate-images.ts
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import sharp from 'sharp'

async function generate(prompt: string, outputPath: string, size: string) {
  const zai = await ZAI.create()
  const response = await zai.images.generations.create({ prompt, size })
  const base64 = response.data[0].base64
  fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'))
  console.log(`✓ ${outputPath}`)
}

async function main() {
  // Profile avatar — stylized professional portrait illustration
  await generate(
    'Minimalist vector-style portrait illustration of a young Indian male tech entrepreneur, short black hair, trimmed beard, confident subtle smile, emerald green and dark teal color palette, geometric tech circuit accents in background, modern flat illustration style, clean professional headshot, high quality',
    'public/avatar.png',
    '1024x1024'
  )

  // OG banner — brand card for social sharing (generated 1344x768, cropped to 1200x630)
  await generate(
    'Sleek dark tech banner, deep charcoal black background with glowing emerald green neon grid lines and circuit patterns, subtle amber gold accent glow, abstract futuristic digital workspace, no text, wide cinematic composition, premium high-tech aesthetic, high quality detailed',
    'public/og-raw.png',
    '1344x768'
  )
  await sharp('public/og-raw.png')
    .resize(1200, 630, { fit: 'cover' })
    .png()
    .toFile('public/og-image.png')
  console.log('✓ public/og-image.png (1200x630)')

  // Blog covers (3)
  await generate(
    'Abstract illustration of artificial intelligence and human collaboration, glowing emerald neural network merging with human silhouette typing on laptop, dark background with green and amber neon accents, modern flat tech illustration, high quality',
    'public/blog-ai.png',
    '1344x768'
  )

  await generate(
    'Flat lay of a professional creative desk from above: camera, drone, laptop with code editor, notebook, mechanical keyboard, coffee, moody dark desk with emerald green ambient lighting accents, cinematic, high quality photography style',
    'public/blog-stack.png',
    '1344x768'
  )

  await generate(
    'World map made of glowing connection dots and travel lines, dark background, emerald green glowing nodes with a highlighted route, adventurous premium tech aesthetic, no text, high quality',
    'public/blog-world.png',
    '1344x768'
  )

  console.log('All images generated.')
}

main().catch((e) => {
  console.error('Image generation failed:', e)
  process.exit(1)
})
