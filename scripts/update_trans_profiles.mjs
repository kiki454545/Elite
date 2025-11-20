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

console.log('🔄 Mise à jour des 3 profils trans...\n')

// Les 3 profils trans
const transProfiles = [
  { email: 'escortemalte2@gmail.com', name: 'QUEEN CAROLINA' },
  { email: 'escortemalte6@gmail.com', name: 'Lady Sara' },
  { email: 'escortemalte12@gmail.com', name: 'Joselyn Trans' }
]

for (const profile of transProfiles) {
  console.log(`Mise à jour de ${profile.name} (${profile.email})...`)

  // Trouver l'user_id
  const { data: authData } = await supabase.auth.admin.listUsers()
  const user = authData.users.find(u => u.email === profile.email)

  if (!user) {
    console.log(`  ❌ Utilisateur non trouvé`)
    continue
  }

  // Mettre à jour le profil
  const { error } = await supabase
    .from('profiles')
    .update({ gender: 'transsexual' })
    .eq('id', user.id)

  if (error) {
    console.log(`  ❌ Erreur: ${error.message}`)
  } else {
    console.log(`  ✅ Genre mis à jour vers "transsexual"`)
  }
}

console.log('\n✅ Terminé!')
