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

console.log('🔍 Vérification de la structure de la table profiles...\n')

// Essayer d'insérer un profil test pour voir l'erreur exacte
const testUserId = '00000000-0000-0000-0000-000000000000'

const { error } = await supabase
  .from('profiles')
  .insert({
    id: testUserId,
    email: 'test@test.com',
    username: 'Test',
    age: 25,
    gender: 'femme',
    phone_number: '+123456789',
    has_whatsapp: true,
    available24_7: false,
    rank: 'standard',
    verified: false,
    height: 170,
    weight: 60,
    breast_size: 'B',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

if (error) {
  console.log('❌ Erreur complète:')
  console.log(JSON.stringify(error, null, 2))
} else {
  console.log('✅ Test réussi! Suppression du profil test...')
  await supabase.from('profiles').delete().eq('id', testUserId)
}
