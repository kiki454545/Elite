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

// XP par type de vote
const XP_PER_VOTE = {
  top1: 50,
  top5: 20,  // top2
  top10: 10, // top3
  top50: 5,
}

async function setTestXPLevels() {
  console.log('🎯 Configuration des niveaux XP de test...\n')

  // 1. D'abord, supprimer tous les votes existants
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

  // 2. Récupérer 9 annonces approuvées
  const { data: ads, error: adsError } = await supabase
    .from('ads')
    .select('id, user_id, location')
    .eq('status', 'approved')
    .limit(9)

  if (adsError) {
    console.error('❌ Erreur récupération annonces:', adsError)
    return
  }

  if (ads.length < 9) {
    console.error(`❌ Seulement ${ads.length} annonces trouvées, il en faut 9`)
    return
  }

  console.log(`📊 ${ads.length} annonces sélectionnées pour les tests\n`)

  // 3. Récupérer tous les utilisateurs auth
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('❌ Erreur récupération auth.users:', authError)
    return
  }

  const allVoters = authUsers.users.map(u => u.id)
  console.log(`👥 ${allVoters.length} votants disponibles\n`)

  // Maximum XP possible avec tous les votants = 50 voters * 50 XP = 2500 XP
  // Ce n'est pas suffisant pour les niveaux 2+
  // Solution: On va supprimer la contrainte unique temporairement ou utiliser un autre mécanisme

  // Vérifions d'abord si on peut ajouter des votes multiples
  console.log('⚠️ ATTENTION: Avec 50 votants, max XP possible = 2500')
  console.log('   Les niveaux 2+ (3000+ XP) ne seront pas atteignables')
  console.log('   Solution: Modification directe de la base ou ajout de faux votants\n')

  // Option: Créer des utilisateurs fictifs pour les tests
  console.log('🔧 Création d\'utilisateurs fictifs pour les tests...\n')

  // On va simuler en insérant des votes avec des UUIDs générés
  // Mais cela violera la contrainte de clé étrangère...

  // Meilleure approche: désactiver temporairement la contrainte ou utiliser une autre méthode

  // Pour le moment, testons avec ce qu'on a
  const profileIds = ads.map(a => a.user_id)

  for (let i = 0; i < 9; i++) {
    const ad = ads[i]
    const targetLevel = XP_LEVELS[i]
    const profileId = ad.user_id

    console.log(`\n🎖️ Niveau ${targetLevel.level} (${targetLevel.xp} XP) - ${ad.location || 'Unknown'}`)

    // Voters disponibles pour ce profil (exclure le profil lui-même)
    const availableVoters = allVoters.filter(v => v !== profileId)

    // Calculer combien de XP on peut atteindre au max
    const maxPossibleXP = availableVoters.length * XP_PER_VOTE.top1
    const targetXP = Math.min(targetLevel.xp, maxPossibleXP)

    // Calculer les votes nécessaires
    const votesNeeded = Math.ceil(targetXP / XP_PER_VOTE.top1)
    const actualVotes = Math.min(votesNeeded, availableVoters.length)

    console.log(`   📊 Votes top1 nécessaires: ${votesNeeded}, disponibles: ${availableVoters.length}`)

    // Créer les votes
    const votesToInsert = []
    for (let v = 0; v < actualVotes; v++) {
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

      if (insertError) {
        console.error(`   ❌ Erreur insertion:`, insertError.message)
      } else {
        const actualXP = votesToInsert.length * XP_PER_VOTE.top1
        console.log(`   ✅ ${votesToInsert.length} votes ajoutés = ${actualXP} XP`)

        if (actualXP >= targetLevel.xp) {
          console.log(`   🎉 Niveau ${targetLevel.level} atteint !`)
        } else {
          console.log(`   ⚠️ XP insuffisant (${actualXP}/${targetLevel.xp}) - limité par le nombre de votants`)
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 RÉSUMÉ')
  console.log('='.repeat(60))
  console.log('Avec 50 votants, seul le niveau 1 (500 XP) peut être atteint.')
  console.log('Pour tester tous les niveaux, il faudrait:')
  console.log('  - Créer plus d\'utilisateurs de test')
  console.log('  - Ou ajouter une colonne bonus_xp aux profils')
  console.log('='.repeat(60))
}

setTestXPLevels()
