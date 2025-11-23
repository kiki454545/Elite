import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function resetRanks() {
  console.log('🔧 Réinitialisation des rangs pour Ella 2, Georgina 2 et Sabrina 2...\n')

  const usernames = ['Ella 2', 'Georgina 2', 'Sabrina 2']

  for (const username of usernames) {
    console.log(`📝 Traitement de ${username}...`)
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ rank: 'standard' })
      .eq('username', username)
      .select()

    if (error) {
      console.error(`❌ Erreur pour ${username}:`, error)
    } else if (data && data.length > 0) {
      console.log(`✅ ${username} -> rang mis à "standard"`)
    } else {
      console.log(`⚠️  ${username} -> profil non trouvé`)
    }
  }

  console.log('\n✨ Terminé !')
}

resetRanks()
