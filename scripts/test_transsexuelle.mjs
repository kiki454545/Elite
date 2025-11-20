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

console.log('🧪 Test de "transsexuelle"...\n')

// Créer d'abord un user pour avoir un UUID valide
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: 'test-transsexuelle@test.com',
  password: 'Test123!',
  email_confirm: true
})

if (authError) {
  console.log('❌ Erreur création user:', authError.message)
  process.exit(1)
}

const testId = authData.user.id

// Attendre un peu
await new Promise(resolve => setTimeout(resolve, 2000))

const { error } = await supabase
  .from('profiles')
  .insert({
    id: testId,
    email: 'test-transsexuelle@test.com',
    username: 'Test Transsexuelle',
    gender: 'transsexuelle',
    rank: 'standard',
    country: 'MT'
  })

if (error) {
  console.log('❌ "transsexuelle" - REJETÉ')
  console.log('Erreur:', error.message)
} else {
  console.log('✅ "transsexuelle" - ACCEPTÉ')
  // Supprimer le test
  await supabase.auth.admin.deleteUser(testId)
}
