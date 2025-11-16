import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Vérification de la structure de la table profiles...\n')

async function checkStructure() {
  try {
    // Récupérer un profil pour voir sa structure
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('❌ Erreur:', error)
      return
    }

    console.log('📋 Colonnes disponibles dans la table profiles:')
    console.log(Object.keys(data).join(', '))
    console.log('\n📄 Exemple de profil:')
    console.log(JSON.stringify(data, null, 2))

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkStructure()
