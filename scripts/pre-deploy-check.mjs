#!/usr/bin/env node

/**
 * Script de vérification pré-déploiement
 * Vérifie que tous les éléments nécessaires sont en place avant de déployer
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

console.log('🔍 Vérification pré-déploiement...\n')

let errors = []
let warnings = []

// 1. Vérifier les variables d'environnement
console.log('📋 Vérification des variables d\'environnement...')
const envPath = join(process.cwd(), '.env.local')
if (!existsSync(envPath)) {
  errors.push('❌ Fichier .env.local manquant')
} else {
  const envContent = readFileSync(envPath, 'utf-8')

  if (!envContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_URL manquante')
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL configurée')
  }

  if (!envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante')
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configurée')
  }

  if (!envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
    warnings.push('⚠️  SUPABASE_SERVICE_ROLE_KEY manquante (nécessaire pour les scripts)')
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY configurée')
  }
}

// 2. Vérifier la connexion Supabase
console.log('\n🔌 Vérification de la connexion Supabase...')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (supabaseUrl && supabaseKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Tester la connexion
    const { data, error } = await supabase.from('ads').select('count').limit(1)

    if (error) {
      errors.push(`❌ Erreur de connexion à Supabase: ${error.message}`)
    } else {
      console.log('✅ Connexion à Supabase réussie')
    }
  } catch (err) {
    errors.push(`❌ Impossible de se connecter à Supabase: ${err.message}`)
  }
}

// 3. Vérifier la structure de la base de données
console.log('\n🗄️  Vérification de la structure de la base de données...')
if (supabaseUrl && supabaseKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Vérifier les colonnes importantes
    const { data: adsData, error: adsError } = await supabase
      .from('ads')
      .select('id, title, username, location, arrondissement, video_url, photos, rank')
      .limit(1)

    if (adsError) {
      if (adsError.message.includes('arrondissement')) {
        errors.push('❌ Colonne "arrondissement" manquante dans la table ads')
      }
      if (adsError.message.includes('video_url')) {
        errors.push('❌ Colonne "video_url" manquante dans la table ads')
      }
    } else {
      console.log('✅ Structure de la table ads correcte')
    }

    // Vérifier la table profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, rank, verified')
      .limit(1)

    if (profilesError) {
      errors.push(`❌ Erreur avec la table profiles: ${profilesError.message}`)
    } else {
      console.log('✅ Structure de la table profiles correcte')
    }

    // Vérifier la table favorites
    const { error: favoritesError } = await supabase
      .from('favorites')
      .select('id, user_id, ad_id')
      .limit(1)

    if (favoritesError) {
      errors.push(`❌ Erreur avec la table favorites: ${favoritesError.message}`)
    } else {
      console.log('✅ Structure de la table favorites correcte')
    }
  } catch (err) {
    errors.push(`❌ Erreur lors de la vérification de la base de données: ${err.message}`)
  }
}

// 4. Vérifier les dépendances
console.log('\n📦 Vérification des dépendances...')
const packageJsonPath = join(process.cwd(), 'package.json')
if (!existsSync(packageJsonPath)) {
  errors.push('❌ Fichier package.json manquant')
} else {
  console.log('✅ package.json présent')

  // Vérifier node_modules
  const nodeModulesPath = join(process.cwd(), 'node_modules')
  if (!existsSync(nodeModulesPath)) {
    warnings.push('⚠️  Dossier node_modules manquant (exécutez npm install)')
  } else {
    console.log('✅ node_modules présent')
  }
}

// 5. Vérifier les fichiers essentiels
console.log('\n📁 Vérification des fichiers essentiels...')
const essentialFiles = [
  ['next.config.mjs', 'next.config.js'],
  ['tsconfig.json'],
  ['tailwind.config.ts', 'tailwind.config.js'],
  ['src/app/layout.tsx'],
  ['src/app/page.tsx'],
  ['src/lib/supabase.ts']
]

essentialFiles.forEach(fileVariants => {
  const found = fileVariants.some(file => {
    const filePath = join(process.cwd(), file)
    return existsSync(filePath)
  })

  if (!found) {
    errors.push(`❌ Fichier essentiel manquant: ${fileVariants.join(' ou ')}`)
  } else {
    const existingFile = fileVariants.find(file => existsSync(join(process.cwd(), file)))
    console.log(`✅ ${existingFile}`)
  }
})

// 6. Résumé
console.log('\n' + '='.repeat(60))
console.log('📊 RÉSUMÉ DE LA VÉRIFICATION')
console.log('='.repeat(60))

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ ✅ ✅ TOUT EST PRÊT POUR LE DÉPLOIEMENT ! ✅ ✅ ✅\n')
  console.log('Vous pouvez maintenant déployer votre application sur Vercel.\n')
  process.exit(0)
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERREURS CRITIQUES À CORRIGER:\n')
    errors.forEach(error => console.log(error))
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  AVERTISSEMENTS:\n')
    warnings.forEach(warning => console.log(warning))
  }

  if (errors.length > 0) {
    console.log('\n🚫 DÉPLOIEMENT NON RECOMMANDÉ - Corrigez d\'abord les erreurs ci-dessus.\n')
    process.exit(1)
  } else {
    console.log('\n⚠️  DÉPLOIEMENT POSSIBLE AVEC AVERTISSEMENTS\n')
    process.exit(0)
  }
}
