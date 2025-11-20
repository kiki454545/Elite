import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: ads } = await supabase
  .from('ads')
  .select('user_id, title')
  .eq('location', 'San Ġwann')

console.log(`\nVérification des profils pour ${ads.length} annonces:\n`)

for (const ad of ads) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, age, phone_number')
    .eq('id', ad.user_id)
    .single()

  if (error || !profile) {
    console.log(`❌ ${ad.title} - PROFIL MANQUANT (user_id: ${ad.user_id})`)
  } else {
    console.log(`✅ ${ad.title} - ${profile.username || 'pas de username'} (${profile.age || '?'} ans, ${profile.phone_number || 'pas de tel'})`)
  }
}
