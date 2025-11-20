import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 Récupération du profil Perla...\n')

const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', 'Perla')
  .single()

if (error) {
  console.log('Erreur:', error)
} else {
  console.log('Profil Perla:')
  console.log(JSON.stringify(profile, null, 2))
}
