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

async function setElla2Plus() {
  console.log('🔄 Mise à jour du rang de Ella 2...\n')

  // Trouver le profil de Ella 2
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'Ella 2')
    .single()

  if (profileError || !profile) {
    console.error('❌ Profil Ella 2 non trouvé:', profileError)
    process.exit(1)
  }

  console.log(`✅ Profil trouvé: ${profile.username} (ID: ${profile.id})`)

  // Mettre à jour le rang à VIP
  const { data, error } = await supabase
    .from('profiles')
    .update({ rank: 'vip' })
    .eq('id', profile.id)
    .select()

  if (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    process.exit(1)
  }

  console.log('✅ Rang mis à jour avec succès!')
  console.log(`Nouveau rang: ${data[0].rank}`)
}

setElla2Plus()
