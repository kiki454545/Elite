#!/usr/bin/env node

/**
 * Script de vérification des changements de ville
 * Exécuté tous les jours à midi via cron
 *
 * Vérifie chaque annonce avec un source_url SexeModel
 * et met à jour la ville si elle a changé
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non défini')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Liste des villes françaises connues
const CITIES = [
  'Paris', 'Marseille', 'Lyon', 'Nice', 'Toulouse', 'Bordeaux', 'Lille',
  'Nantes', 'Strasbourg', 'Montpellier', 'Rennes', 'Reims', 'Le Havre',
  'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes',
  'Villeurbanne', 'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence',
  'Brest', 'Tours', 'Amiens', 'Limoges', 'Annecy', 'Perpignan',
  'Boulogne-Billancourt', 'Metz', 'Besançon', 'Orléans', 'Rouen',
  'Mulhouse', 'Caen', 'Nancy', 'Saint-Denis', 'Argenteuil', 'Montreuil',
  'Cannes', 'Antibes', 'Monaco', 'Avignon', 'Pau', 'La Rochelle',
  'Calais', 'Dunkerque', 'Versailles', 'Colmar', 'Troyes', 'Chartres'
]

// Extraire la ville depuis le HTML de SexeModel
function extractCity(html) {
  // Chercher "Ville de base" dans le HTML
  const villeBaseMatch = html.match(/Ville\s+de\s+base\s*(?:<\/[^>]+>)?\s*(?:<[^>]+>)*\s*([A-ZÀ-Ÿ][a-zà-ÿ\-]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ\-]+)*)/i)
  if (villeBaseMatch) {
    return villeBaseMatch[1].trim()
  }

  // Fallback sur la liste des villes
  for (const city of CITIES) {
    if (html.includes(city)) {
      return city
    }
  }

  return null
}

// Vérifier une annonce et mettre à jour si nécessaire
async function checkAd(ad) {
  try {
    const response = await fetch(ad.source_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9'
      }
    })

    if (!response.ok) {
      // Annonce peut-être supprimée sur SexeModel
      if (response.status === 404) {
        console.log(`   ⚠️ [${ad.id}] Annonce source supprimée (404)`)
        return { status: 'deleted', ad }
      }
      console.log(`   ⚠️ [${ad.id}] Erreur HTTP ${response.status}`)
      return { status: 'error', ad }
    }

    const html = await response.text()
    const newCity = extractCity(html)

    if (!newCity) {
      console.log(`   ⚠️ [${ad.id}] Ville non détectée`)
      return { status: 'no_city', ad }
    }

    // Comparer avec la ville actuelle
    if (newCity !== ad.location) {
      console.log(`   🔄 [${ad.id}] Changement de ville: ${ad.location} → ${newCity}`)

      // Mettre à jour en BDD
      const { error } = await supabase
        .from('ads')
        .update({
          location: newCity,
          title: `${ad.title.split(' - ')[0]} - ${newCity}` // Mettre à jour le titre aussi
        })
        .eq('id', ad.id)

      if (error) {
        console.log(`   ❌ [${ad.id}] Erreur mise à jour: ${error.message}`)
        return { status: 'update_error', ad, error }
      }

      return { status: 'updated', ad, oldCity: ad.location, newCity }
    }

    return { status: 'unchanged', ad }

  } catch (error) {
    console.log(`   ❌ [${ad.id}] Erreur: ${error.message}`)
    return { status: 'error', ad, error: error.message }
  }
}

// Délai entre les requêtes pour éviter le rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const startTime = new Date()
  console.log('='.repeat(60))
  console.log('🔍 VÉRIFICATION DES CHANGEMENTS DE VILLE')
  console.log(`   Date: ${startTime.toLocaleString('fr-FR')}`)
  console.log('='.repeat(60))

  // Récupérer toutes les annonces avec un source_url
  const { data: ads, error } = await supabase
    .from('ads')
    .select('id, title, location, source_url')
    .not('source_url', 'is', null)
    .eq('status', 'approved')

  if (error) {
    console.error('❌ Erreur récupération annonces:', error.message)
    process.exit(1)
  }

  console.log(`\n📋 ${ads.length} annonces à vérifier\n`)

  if (ads.length === 0) {
    console.log('Aucune annonce avec source_url trouvée.')
    return
  }

  // Stats
  const stats = {
    checked: 0,
    updated: 0,
    unchanged: 0,
    deleted: 0,
    errors: 0
  }

  const updates = []

  // Vérifier chaque annonce
  for (const ad of ads) {
    const result = await checkAd(ad)
    stats.checked++

    switch (result.status) {
      case 'updated':
        stats.updated++
        updates.push(result)
        break
      case 'unchanged':
        stats.unchanged++
        break
      case 'deleted':
        stats.deleted++
        break
      default:
        stats.errors++
    }

    // Délai de 2 secondes entre chaque requête pour éviter le blocage
    await delay(2000)
  }

  // Résumé
  const endTime = new Date()
  const duration = Math.round((endTime - startTime) / 1000)

  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ')
  console.log('='.repeat(60))
  console.log(`   Vérifiées: ${stats.checked}`)
  console.log(`   Mises à jour: ${stats.updated}`)
  console.log(`   Inchangées: ${stats.unchanged}`)
  console.log(`   Supprimées (source): ${stats.deleted}`)
  console.log(`   Erreurs: ${stats.errors}`)
  console.log(`   Durée: ${duration}s`)

  if (updates.length > 0) {
    console.log('\n📝 DÉTAIL DES MISES À JOUR:')
    for (const update of updates) {
      console.log(`   - ${update.ad.title}: ${update.oldCity} → ${update.newCity}`)
    }
  }

  console.log('\n✅ Vérification terminée')
}

main().catch(console.error)
