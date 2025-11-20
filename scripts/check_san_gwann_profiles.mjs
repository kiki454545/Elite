import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: ads } = await supabase
  .from('ads')
  .select('user_id, title')
  .eq('location', 'San Ġwann')

console.log(`\n📊 Profils des ${ads.length} annonces de San Ġwann:\n`)

for (const ad of ads) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, age, phone_number, gender, verified')
    .eq('id', ad.user_id)
    .single()

  if (profile) {
    console.log(`${ad.title}:`)
    console.log(`  Age: ${profile.age || '?'}`)
    console.log(`  Tel: ${profile.phone_number || 'Pas de tel'}`)
    console.log(`  Genre: ${profile.gender || '?'}`)
    console.log(`  Vérifié: ${profile.verified ? 'Oui' : 'Non'}`)
    console.log('')
  }
}
