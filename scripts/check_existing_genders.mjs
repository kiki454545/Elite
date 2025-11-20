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

console.log('🔍 Vérification des valeurs de gender existantes...\n')

const { data: profiles } = await supabase
  .from('profiles')
  .select('username, gender')
  .not('gender', 'is', null)
  .limit(10)

if (profiles && profiles.length > 0) {
  console.log('Valeurs de gender trouvées:')
  profiles.forEach(p => {
    console.log(`  ${p.username}: "${p.gender}"`)
  })
} else {
  console.log('Aucun profil avec gender défini trouvé')
}

// Essayer différentes valeurs
console.log('\n🧪 Test de différentes valeurs de gender...\n')

const testValues = ['f', 'm', 'female', 'male', 'femme', 'homme', 'trans', 't']

for (const gender of testValues) {
  const testId = `test-${gender}-${Date.now()}`

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: testId,
      email: `test-${gender}@test.com`,
      username: `Test ${gender}`,
      gender: gender,
      rank: 'standard'
    })

  if (error) {
    console.log(`❌ "${gender}" - REJETÉ`)
  } else {
    console.log(`✅ "${gender}" - ACCEPTÉ`)
    // Supprimer le test
    await supabase.from('profiles').delete().eq('id', testId)
  }
}
