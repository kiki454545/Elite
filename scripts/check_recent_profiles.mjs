import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const { data: profiles, error } = await supabase
  .from('profiles')
  .select('id, username, age, phone_number, created_at')
  .order('created_at', { ascending: false })
  .limit(15)

if (error) {
  console.error('Erreur:', error)
} else {
  console.log(`\n📊 ${profiles.length} profils les plus récents:\n`)
  profiles.forEach((p, i) => {
    console.log(`${i+1}. ${p.username || 'Sans nom'} (${p.age || '?'} ans) - ${p.phone_number || 'Pas de tel'}`)
  })
}
