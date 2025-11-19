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

async function checkAdsStructure() {
  console.log('🔍 Vérification de la structure de la table ads...\n')

  try {
    // Récupérer une annonce pour voir les colonnes disponibles
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erreur lors de la récupération des annonces:', error)
      return
    }

    if (ads && ads.length > 0) {
      console.log('📋 Colonnes disponibles dans la table ads:')
      const columns = Object.keys(ads[0])
      columns.forEach(col => {
        console.log(`  - ${col}: ${typeof ads[0][col]} = ${JSON.stringify(ads[0][col])}`)
      })

      console.log('\n✅ Colonnes attendues:')
      const expectedColumns = [
        'id',
        'user_id',
        'title',
        'description',
        'location',
        'country',
        'nearby_cities',
        'categories',
        'meeting_places',
        'services',  // ← Cette colonne doit exister
        'price',
        'photos',
        'video_url',
        'status',
        'verified',
        'views',
        'favorites_count',
        'created_at',
        'updated_at'
      ]

      const missingColumns = expectedColumns.filter(col => !columns.includes(col))

      if (missingColumns.length > 0) {
        console.log('\n⚠️  Colonnes manquantes:')
        missingColumns.forEach(col => console.log(`  ❌ ${col}`))
      } else {
        console.log('\n✅ Toutes les colonnes attendues sont présentes!')
      }

    } else {
      console.log('⚠️  Aucune annonce trouvée. Impossible de vérifier la structure.')
      console.log('\nVeuillez créer une annonce de test ou vérifier manuellement dans Supabase:')
      console.log('https://supabase.com/dashboard/project/YOUR_PROJECT/editor')
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error)
  }
}

checkAdsStructure()
