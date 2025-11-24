import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function generateFavicons() {
  console.log('🎨 Génération des favicons...\n')

  const svgPath = join(__dirname, '..', 'public', 'favicon.svg')
  const svgBuffer = readFileSync(svgPath)

  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
  ]

  for (const { size, name } of sizes) {
    const outputPath = join(__dirname, '..', 'public', name)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath)
    console.log(`✓ ${name} généré (${size}x${size})`)
  }

  console.log('\n✅ Tous les favicons ont été générés avec succès!')
  console.log('\n📝 Fichiers créés:')
  sizes.forEach(({ name }) => console.log(`  - public/${name}`))
}

generateFavicons().catch(err => {
  console.error('❌ Erreur:', err.message)
  process.exit(1)
})
