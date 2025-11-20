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

console.log('🔍 Recherche de la contrainte gender...\n')

// Essayer de récupérer la définition de la contrainte via une requête SQL
const { data, error } = await supabase.rpc('get_constraint_definition', {
  constraint_name: 'profiles_gender_check'
})

if (error) {
  console.log('Impossible de récupérer via RPC, essayons autrement...')
}

// Essayer différentes valeurs courantes
const commonGenders = [
  'male', 'female', 'man', 'woman', 'homme', 'femme',
  'trans', 'transgender', 'transsexual', 'transsexuelle',
  'couple', 'non-binary', 'non-binaire', 'other', 'autre'
]

console.log('Test des valeurs courantes:\n')

for (const gender of commonGenders) {
  const { data: authData } = await supabase.auth.admin.createUser({
    email: `test-${gender}@test.com`,
    password: 'Test123!',
    email_confirm: true
  })

  const testId = authData.user.id
  await new Promise(resolve => setTimeout(resolve, 500))

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: testId,
      email: `test-${gender}@test.com`,
      username: `Test ${gender}`,
      gender: gender,
      rank: 'standard',
      country: 'MT'
    })

  if (error) {
    console.log(`❌ "${gender}"`)
    // Supprimer le user quand même
    await supabase.auth.admin.deleteUser(testId)
  } else {
    console.log(`✅ "${gender}" - ACCEPTÉ!`)
    // Nettoyer
    await supabase.from('profiles').delete().eq('id', testId)
    await supabase.auth.admin.deleteUser(testId)
  }
}
