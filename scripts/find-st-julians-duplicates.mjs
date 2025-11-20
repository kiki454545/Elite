import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function findDuplicates() {
  try {
    console.log('🔍 Recherche des doublons à St. Julian\'s...\n')

    const { data: ads } = await supabase
      .from('ads')
      .select('id, title, user_id, created_at')
      .eq('location', 'St. Julian\'s')
      .order('created_at')

    console.log(`📊 Total: ${ads.length} profils à St. Julian's\n`)

    // Grouper par titre
    const titleGroups = {}
    ads.forEach(ad => {
      if (!titleGroups[ad.title]) {
        titleGroups[ad.title] = []
      }
      titleGroups[ad.title].push(ad)
    })

    // Trouver les doublons
    const duplicates = Object.entries(titleGroups)
      .filter(([title, ads]) => ads.length > 1)

    console.log(`🔍 ${duplicates.length} profils avec doublons trouvés:\n`)

    const idsToDelete = []

    duplicates.forEach(([title, adsList]) => {
      console.log(`\n📝 "${title}": ${adsList.length} fois`)
      adsList.forEach((ad, i) => {
        const date = new Date(ad.created_at)
        console.log(`   ${i + 1}. ID: ${ad.id.substring(0, 8)}... - ${date.toISOString().slice(0, 19)}`)

        // Garder le DERNIER créé (le plus récent), supprimer les autres
        if (i < adsList.length - 1) {
          idsToDelete.push(ad.id)
          console.log(`      ❌ À supprimer`)
        } else {
          console.log(`      ✅ À garder`)
        }
      })
    })

    console.log(`\n\n📋 RÉSUMÉ`)
    console.log(`═══════════════════════════════════`)
    console.log(`📊 Total annonces: ${ads.length}`)
    console.log(`🗑️  Annonces à supprimer: ${idsToDelete.length}`)
    console.log(`✅ Annonces à garder: ${ads.length - idsToDelete.length}`)

    if (idsToDelete.length > 0) {
      console.log(`\n⚠️  IDs à supprimer:`)
      idsToDelete.slice(0, 10).forEach(id => console.log(`   - ${id}`))
      if (idsToDelete.length > 10) {
        console.log(`   ... et ${idsToDelete.length - 10} autres`)
      }

      console.log(`\n🔄 Suppression en cours...`)

      const { error } = await supabase
        .from('ads')
        .delete()
        .in('id', idsToDelete)

      if (error) {
        console.error(`❌ Erreur suppression:`, error.message)
      } else {
        console.log(`✅ ${idsToDelete.length} annonces supprimées avec succès!`)
      }

      // Vérifier le nouveau total
      const { count } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('location', 'St. Julian\'s')

      console.log(`\n📊 Nouveau total St. Julian's: ${count} annonces`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

findDuplicates()
