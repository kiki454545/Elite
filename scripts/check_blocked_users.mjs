import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBlockedUsers() {
  console.log('🔍 Vérification de la table blocked_users...\n')

  const { data, error, count } = await supabase
    .from('blocked_users')
    .select('*', { count: 'exact' })

  if (error) {
    console.error('❌ Erreur lors de la lecture:', error)
    return
  }

  console.log('✅ Nombre total d\'entrées:', count)
  console.log('📊 Données:\n', JSON.stringify(data, null, 2))

  // Tester une requête spécifique si on a des données
  if (data && data.length > 0) {
    const firstBlock = data[0]
    console.log('\n🧪 Test de requête avec les IDs du premier blocage:')
    console.log('user_id:', firstBlock.user_id)
    console.log('blocked_user_id:', firstBlock.blocked_user_id)

    const { data: testData, error: testError } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('user_id', firstBlock.user_id)
      .eq('blocked_user_id', firstBlock.blocked_user_id)
      .maybeSingle()

    console.log('\nRésultat du test:', testData ? '✅ Trouvé' : '❌ Non trouvé')
    if (testError) {
      console.log('Erreur:', testError)
    }
  }
}

checkBlockedUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
