import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPremiumUsers() {
  console.log('🔍 Vérification des utilisateurs premium...\n')

  // Récupérer tous les profils qui ne sont pas "standard"
  const { data: premiumProfiles, error } = await supabase
    .from('profiles')
    .select('id, username, rank')
    .neq('rank', 'standard')

  if (error) {
    console.error('❌ Erreur:', error)
    return
  }

  console.log(`📊 ${premiumProfiles.length} profils premium trouvés:\n`)

  for (const profile of premiumProfiles) {
    console.log(`👤 ${profile.username}`)
    console.log(`   ID: ${profile.id}`)
    console.log(`   Rang: ${profile.rank}`)
    console.log('')
  }
}

checkPremiumUsers()
