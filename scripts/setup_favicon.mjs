import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function setupFavicon() {
  console.log('🎨 Configuration du nouveau favicon...\n')

  const sourcePath = join(__dirname, '..', 'public', 'favicon-source.png')

  if (!existsSync(sourcePath)) {
    console.error('❌ Fichier source non trouvé: favicon-source.png')
    console.log('\n📝 Instructions:')
    console.log('1. Sauvegardez votre image dans: public/favicon-source.png')
    console.log('2. Relancez ce script: node scripts/setup_favicon.mjs')
    process.exit(1)
  }

  console.log('✓ Image source trouvée\n')

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
    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath)
    console.log(`✓ ${name} généré (${size}x${size})`)
  }

  // Générer le SVG optimisé
  console.log('\n📝 Génération du SVG...')
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f4a896;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#d89078;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c07d6a;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
  </defs>
  <image href="/favicon-source.png" width="512" height="512" filter="url(#shadow)"/>
</svg>`

  const svgPath = join(__dirname, '..', 'public', 'favicon.svg')
  writeFileSync(svgPath, svgContent)
  console.log('✓ favicon.svg généré')

  console.log('\n✅ Tous les favicons ont été générés avec succès!')
  console.log('\n📝 Fichiers créés:')
  sizes.forEach(({ name }) => console.log(`  - public/${name}`))
  console.log('  - public/favicon.svg')
  console.log('\n🚀 Vous pouvez maintenant rafraîchir votre navigateur pour voir le nouveau favicon!')
}

setupFavicon().catch(err => {
  console.error('❌ Erreur:', err.message)
  process.exit(1)
})
