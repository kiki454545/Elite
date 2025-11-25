import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function removeNumbersFromAdNames() {
  try {
    console.log('🔍 Recherche des annonces avec des numéros dans le nom...\n')

    // Récupérer le nombre total d'annonces
    const { count } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 ${count} annonces au total dans la base\n`)

    let allAds = []
    const pageSize = 1000
    let page = 0

    // Récupérer toutes les annonces par lots de 1000
    while (true) {
      const { data: ads, error: fetchError } = await supabase
        .from('ads')
        .select('id, name')
        .order('name')
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (fetchError) {
        console.error('❌ Erreur lors de la récupération des annonces:', fetchError)
        break
      }

      if (!ads || ads.length === 0) {
        break
      }

      allAds = allAds.concat(ads)
      console.log(`📥 Chargé ${allAds.length} annonces...`)
      page++

      if (ads.length < pageSize) {
        break
      }
    }

    console.log(`\n✅ Total chargé : ${allAds.length} annonces\n`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const ad of allAds) {
      // Vérifier si le nom contient des chiffres
      if (!/\d/.test(ad.name)) {
        // Pas de chiffres, on passe
        skippedCount++
        continue
      }

      // Retirer tous les chiffres du nom et nettoyer les espaces en trop
      let newName = ad.name.replace(/\d+/g, '').trim()

      // Nettoyer les espaces multiples
      newName = newName.replace(/\s+/g, ' ')

      // Si le nouveau nom est vide ou identique, on passe
      if (!newName || newName === ad.name || newName.length < 2) {
        skippedCount++
        continue
      }

      // Mettre à jour le nom directement (même si ça existe déjà, c'est voulu)
      const { error: updateError } = await supabase
        .from('ads')
        .update({ name: newName })
        .eq('id', ad.id)

      if (updateError) {
        console.error(`❌ ${ad.name} → ${newName} : ${updateError.message}`)
        errorCount++
      } else {
        console.log(`✅ ${ad.name} → ${newName}`)
        updatedCount++
      }

      // Petit délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Terminé !')
    console.log(`✅ Noms d'annonces modifiés: ${updatedCount}`)
    console.log(`⏭️  Ignorés (pas de numéros ou nom trop court): ${skippedCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Erreur globale:', error)
  }
}

removeNumbersFromAdNames()
