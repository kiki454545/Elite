import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateMeetingPlaces() {
  console.log('🔄 Migration des termes de lieux de rencontre...\n')

  try {
    // Récupérer toutes les annonces avec meeting_places
    const { data: ads, error: fetchError } = await supabase
      .from('ads')
      .select('id, meeting_places')
      .not('meeting_places', 'is', null)

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des annonces:', fetchError)
      process.exit(1)
    }

    if (!ads || ads.length === 0) {
      console.log('✅ Aucune annonce à migrer')
      return
    }

    console.log(`📊 ${ads.length} annonces à vérifier\n`)

    let updatedCount = 0
    const updates = []

    for (const ad of ads) {
      if (!ad.meeting_places || ad.meeting_places.length === 0) continue

      let needsUpdate = false
      const updatedPlaces = ad.meeting_places.map(place => {
        if (place === 'Domicile') {
          needsUpdate = true
          return 'Incall'
        }
        if (place === 'Chez vous') {
          needsUpdate = true
          return 'Outcall'
        }
        if (place === "Chez l'escorte") {
          needsUpdate = true
          return 'Incall'
        }
        return place
      })

      if (needsUpdate) {
        updates.push({ id: ad.id, meeting_places: updatedPlaces })
        console.log(`🔄 Annonce ${ad.id}:`)
        console.log(`   Avant: ${ad.meeting_places.join(', ')}`)
        console.log(`   Après: ${updatedPlaces.join(', ')}`)
      }
    }

    if (updates.length === 0) {
      console.log('\n✅ Aucune mise à jour nécessaire - tous les termes sont déjà à jour')
      return
    }

    console.log(`\n📝 ${updates.length} annonces à mettre à jour`)
    console.log('⏳ Mise à jour en cours...\n')

    // Mettre à jour chaque annonce
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('ads')
        .update({ meeting_places: update.meeting_places })
        .eq('id', update.id)

      if (updateError) {
        console.error(`❌ Erreur lors de la mise à jour de l'annonce ${update.id}:`, updateError)
      } else {
        updatedCount++
      }
    }

    console.log(`\n✅ Migration terminée !`)
    console.log(`   ${updatedCount}/${updates.length} annonces mises à jour avec succès`)

  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
    process.exit(1)
  }
}

migrateMeetingPlaces()
