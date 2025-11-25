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

async function addBonusXPAndTest() {
  console.log('🎯 Ajout de la colonne bonus_xp et configuration des tests...\n')

  // 1. Ajouter la colonne bonus_xp si elle n'existe pas
  console.log('📊 Ajout de la colonne bonus_xp à la table profiles...')

  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bonus_xp INTEGER DEFAULT 0;`
  })

  // Si la fonction RPC n'existe pas, on essaie avec une requête directe
  // Ça peut échouer mais on continue quand même
  if (alterError) {
    console.log('⚠️ Tentative alternative via SQL direct...')
    // On va simplement essayer d'utiliser update pour voir si la colonne existe
  }

  // 2. Supprimer tous les votes existants
  console.log('\n🗑️ Suppression des votes existants...')
  const { error: deleteError } = await supabase
    .from('profile_votes')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) {
    console.error('❌ Erreur suppression votes:', deleteError)
  } else {
    console.log('✅ Votes supprimés')
  }

  // 3. Réinitialiser tous les bonus_xp
  console.log('\n🔄 Réinitialisation des bonus_xp...')
  const { error: resetError } = await supabase
    .from('profiles')
    .update({ bonus_xp: 0 })
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (resetError) {
    console.log('⚠️ La colonne bonus_xp n\'existe probablement pas encore')
    console.log('   Création via l\'interface Supabase nécessaire')
    console.log('   Allez dans Table Editor > profiles > Add column > bonus_xp (int4, default 0)')
    return
  }
  console.log('✅ Bonus XP réinitialisés')

  // 4. Récupérer 9 annonces approuvées avec leur user_id
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

  console.log(`\n📊 ${ads.length} annonces sélectionnées pour les tests\n`)

  // 5. Assigner un niveau différent à chaque profil via bonus_xp
  for (let i = 0; i < 9; i++) {
    const ad = ads[i]
    const targetLevel = XP_LEVELS[i]
    const profileId = ad.user_id

    console.log(`🎖️ Niveau ${targetLevel.level} (${targetLevel.xp} XP) - ${ad.location || 'Unknown'}`)

    // Mettre à jour le bonus_xp du profil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ bonus_xp: targetLevel.xp })
      .eq('id', profileId)

    if (updateError) {
      console.error(`   ❌ Erreur:`, updateError.message)
    } else {
      console.log(`   ✅ bonus_xp = ${targetLevel.xp}`)
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
  console.log('\n⚠️ N\'oubliez pas de mettre à jour le hook useVoting pour')
  console.log('   inclure le bonus_xp dans le calcul du score total!')
}

addBonusXPAndTest()
