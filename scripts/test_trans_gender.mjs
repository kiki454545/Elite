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

console.log('🧪 Test de valeurs pour transgender...\n')

const testValues = ['trans', 'transgender', 'transsexual', 'ts', 'shemale', 'ladyboy', 'other', 'male', 'female']

for (const gender of testValues) {
  const testId = `test-gender-${Date.now()}-${Math.random()}`

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
    console.log(`❌ "${gender}" - REJETÉ`)
  } else {
    console.log(`✅ "${gender}" - ACCEPTÉ`)
    // Supprimer le test
    await supabase.auth.admin.deleteUser(testId)
  }

  // Petite pause pour éviter de surcharger
  await new Promise(resolve => setTimeout(resolve, 100))
}
