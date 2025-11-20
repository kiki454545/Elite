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

console.log('🗑️  Suppression des annonces importées...\n')

// Récupérer tous les users importés
const { data: users } = await supabase.auth.admin.listUsers()
const importedUsers = users.users.filter(u => u.email && u.email.includes('@imported.sexelite.eu'))

console.log(`Trouvé ${importedUsers.length} utilisateurs importés\n`)

for (const user of importedUsers) {
  console.log(`Suppression de ${user.email}...`)

  // Supprimer les annonces
  await supabase.from('ads').delete().eq('user_id', user.id)

  // Supprimer le profil
  await supabase.from('profiles').delete().eq('id', user.id)

  // Supprimer l'utilisateur
  await supabase.auth.admin.deleteUser(user.id)

  console.log(`  ✅ Supprimé`)
}

console.log(`\n✅ ${importedUsers.length} utilisateurs et annonces supprimés`)
