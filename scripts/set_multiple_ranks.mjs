import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setMultipleRanks() {
  console.log('🔄 Mise à jour des rangs...\n')

  // Mettre Georgina 2 en Plus
  const { data: georgina, error: georginaError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'Georgina 2')
    .single()

  if (georginaError || !georgina) {
    console.error('❌ Profil Georgina 2 non trouvé:', georginaError)
  } else {
    console.log(`✅ Profil trouvé: ${georgina.username} (ID: ${georgina.id})`)

    const { data: georginaUpdate, error: georginaUpdateError } = await supabase
      .from('profiles')
      .update({ rank: 'plus' })
      .eq('id', georgina.id)
      .select()

    if (georginaUpdateError) {
      console.error('❌ Erreur mise à jour Georgina 2:', georginaUpdateError)
    } else {
      console.log(`✅ Georgina 2 mise à jour: ${georginaUpdate[0].rank}`)
    }
  }

  console.log('')

  // Mettre Sabrina 2 en Elite
  const { data: sabrina, error: sabrinaError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'Sabrina 2')
    .single()

  if (sabrinaError || !sabrina) {
    console.error('❌ Profil Sabrina 2 non trouvé:', sabrinaError)
  } else {
    console.log(`✅ Profil trouvé: ${sabrina.username} (ID: ${sabrina.id})`)

    const { data: sabrinaUpdate, error: sabrinaUpdateError } = await supabase
      .from('profiles')
      .update({ rank: 'elite' })
      .eq('id', sabrina.id)
      .select()

    if (sabrinaUpdateError) {
      console.error('❌ Erreur mise à jour Sabrina 2:', sabrinaUpdateError)
    } else {
      console.log(`✅ Sabrina 2 mise à jour: ${sabrinaUpdate[0].rank}`)
    }
  }

  console.log('\n✅ Mise à jour terminée!')
}

setMultipleRanks()
