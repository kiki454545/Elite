import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Les paliers XP pour chaque niveau
const XP_LEVELS = [
  { level: 1, xp: 500 },
  { level: 2, xp: 3000 },
  { level: 3, xp: 6000 },
  { level: 4, xp: 10000 },
  { level: 5, xp: 20000 },
  { level: 6, xp: 35000 },
  { level: 7, xp: 50000 },
  { level: 8, xp: 75000 },
  { level: 9, xp: 150000 },
]

async function testAllBadgeLevels() {
  console.log('🎯 Test de tous les niveaux de badges...\n')

  // 1. Récupérer la structure de la table profile_votes
  console.log('📊 Vérification de la structure de profile_votes...')

  // 2. Supprimer tous les votes existants
  console.log('🗑️ Suppression des votes existants...')
  const { error: deleteError } = await supabase
    .from('profile_votes')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) {
    console.error('❌ Erreur suppression votes:', deleteError)
    return
  }
  console.log('✅ Votes supprimés\n')

  // 3. Récupérer 9 annonces approuvées
  const { data: ads, error: adsError } = await supabase
    .from('ads')
    .select('id, user_id, location')
    .eq('status', 'approved')
    .limit(9)

  if (adsError || !ads || ads.length < 9) {
    console.error('❌ Pas assez d\'annonces:', adsError || `${ads?.length || 0} trouvées`)
    return
  }

  console.log(`📊 ${ads.length} annonces sélectionnées\n`)

  // 4. Récupérer tous les utilisateurs auth
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('❌ Erreur récupération auth.users:', authError)
    return
  }

  const allVoters = authUsers.users.map(u => u.id)
  console.log(`👥 ${allVoters.length} votants disponibles`)
  console.log(`   Max XP possible par profil: ${allVoters.length * 50} XP\n`)

  // 5. Créer des utilisateurs fictifs pour les tests
  console.log('🔧 Création d\'utilisateurs de test pour atteindre tous les niveaux...')

  // On va créer des utilisateurs via l'API admin
  const testEmails = []
  for (let i = 1; i <= 3000; i++) {
    testEmails.push(`test_voter_${i}@test.sexelite.eu`)
  }

  // Créer les utilisateurs par batch de 50
  const createdUserIds = [...allVoters] // Commencer avec les existants

  console.log('   Création de 3000 utilisateurs de test...')

  for (let batch = 0; batch < 60; batch++) {
    const batchEmails = testEmails.slice(batch * 50, (batch + 1) * 50)

    for (const email of batchEmails) {
      const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: 'TestPassword123!',
        email_confirm: true
      })

      if (!createError && user?.user) {
        createdUserIds.push(user.user.id)
      }
    }

    process.stdout.write(`\r   Batch ${batch + 1}/60 - ${createdUserIds.length} utilisateurs créés`)
  }

  console.log(`\n✅ ${createdUserIds.length} utilisateurs disponibles pour les votes\n`)

  // 6. Assigner les votes pour chaque niveau
  const profileIds = ads.map(a => a.user_id)

  for (let i = 0; i < 9; i++) {
    const ad = ads[i]
    const targetLevel = XP_LEVELS[i]
    const profileId = ad.user_id

    console.log(`\n🎖️ Niveau ${targetLevel.level} (${targetLevel.xp} XP) - ${ad.location || 'Unknown'}`)

    // Voters disponibles (exclure le profil lui-même)
    const availableVoters = createdUserIds.filter(v => v !== profileId)

    // Calculer les votes nécessaires (top1 = 50 XP)
    const votesNeeded = Math.ceil(targetLevel.xp / 50)
    const actualVotes = Math.min(votesNeeded, availableVoters.length)

    console.log(`   📊 Votes nécessaires: ${votesNeeded}, disponibles: ${availableVoters.length}`)

    // Créer les votes par batch de 100
    let votesCreated = 0

    for (let batch = 0; batch < Math.ceil(actualVotes / 100); batch++) {
      const startIdx = batch * 100
      const endIdx = Math.min((batch + 1) * 100, actualVotes)

      const votesToInsert = []
      for (let v = startIdx; v < endIdx; v++) {
        votesToInsert.push({
          voter_id: availableVoters[v],
          profile_id: profileId,
          vote_type: 'top1',
          created_at: new Date().toISOString(),
        })
      }

      if (votesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('profile_votes')
          .insert(votesToInsert)

        if (!insertError) {
          votesCreated += votesToInsert.length
        }
      }
    }

    const actualXP = votesCreated * 50
    console.log(`   ✅ ${votesCreated} votes ajoutés = ${actualXP} XP`)

    if (actualXP >= targetLevel.xp) {
      console.log(`   🎉 Niveau ${targetLevel.level} atteint !`)
    } else {
      console.log(`   ⚠️ XP insuffisant (${actualXP}/${targetLevel.xp})`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 RÉSUMÉ DES PROFILS DE TEST')
  console.log('='.repeat(60))
  for (let i = 0; i < 9; i++) {
    const ad = ads[i]
    const targetLevel = XP_LEVELS[i]
    console.log(`Level ${targetLevel.level} (${targetLevel.xp.toLocaleString()} XP): ${ad.location || ad.id}`)
  }
  console.log('='.repeat(60))
}

testAllBadgeLevels()
