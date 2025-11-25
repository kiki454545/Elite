import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupTestData() {
  console.log('🧹 Nettoyage des données de test...\n')

  // 1. Supprimer tous les votes
  console.log('🗑️ Suppression de tous les votes...')
  const { error: deleteVotesError, count: votesCount } = await supabase
    .from('profile_votes')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('*', { count: 'exact', head: true })

  if (deleteVotesError) {
    console.error('❌ Erreur suppression votes:', deleteVotesError)
  } else {
    console.log('✅ Votes supprimés')
  }

  // 2. Supprimer les utilisateurs de test (ceux avec email @test.sexelite.eu)
  console.log('\n🗑️ Suppression des utilisateurs de test...')

  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('❌ Erreur récupération utilisateurs:', authError)
    return
  }

  const testUsers = authUsers.users.filter(u => u.email && u.email.includes('@test.sexelite.eu'))
  console.log(`   📊 ${testUsers.length} utilisateurs de test trouvés`)

  let deletedCount = 0
  for (const user of testUsers) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    if (!deleteError) {
      deletedCount++
    }
    if (deletedCount % 100 === 0) {
      process.stdout.write(`\r   🗑️ ${deletedCount}/${testUsers.length} utilisateurs supprimés`)
    }
  }

  console.log(`\n✅ ${deletedCount} utilisateurs de test supprimés`)

  console.log('\n' + '='.repeat(50))
  console.log('✅ NETTOYAGE TERMINÉ')
  console.log('='.repeat(50))
}

cleanupTestData()
