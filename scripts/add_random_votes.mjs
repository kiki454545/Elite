import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Ratios de votes basés sur les vues
const VOTE_RATIOS = {
  top1: { min: 0.0001, max: 0.0005 },   // 0.01% à 0.05% des vues
  top5: { min: 0.0007, max: 0.001 },    // 0.07% à 0.1% des vues
  top10: { min: 0.001, max: 0.002 },    // 0.1% à 0.2% des vues
  top50: { min: 0.002, max: 0.004 },    // 0.2% à 0.4% des vues
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomRatio(min, max) {
  return Math.random() * (max - min) + min
}

async function addRandomVotes() {
  console.log('🎲 Ajout de votes aléatoires basés sur les vues...\n')

  // 1. Récupérer toutes les annonces approuvées avec leurs vues
  const { data: ads, error: adsError } = await supabase
    .from('ads')
    .select('id, user_id, views, location')
    .eq('status', 'approved')

  if (adsError) {
    console.error('❌ Erreur récupération annonces:', adsError)
    return
  }

  console.log(`📊 ${ads.length} annonces approuvées trouvées\n`)

  // 2. Récupérer tous les utilisateurs réels depuis auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('❌ Erreur récupération auth.users:', authError)
    return
  }

  // Utiliser les IDs des vrais utilisateurs auth
  const voterIds = authUsers.users.map(u => u.id)
  console.log(`👥 ${voterIds.length} profils disponibles comme voters\n`)

  // 3. Récupérer les votes existants pour éviter les doublons
  const { data: existingVotes, error: votesError } = await supabase
    .from('profile_votes')
    .select('voter_id, profile_id')

  if (votesError) {
    console.error('❌ Erreur récupération votes existants:', votesError)
    return
  }

  const existingVotesSet = new Set(
    existingVotes?.map(v => `${v.voter_id}-${v.profile_id}`) || []
  )

  let totalVotesAdded = 0
  let stats = { top1: 0, top5: 0, top10: 0, top50: 0 }

  // 4. Pour chaque annonce, ajouter des votes basés sur les vues
  for (const ad of ads) {
    const views = ad.views || 0
    if (views < 10) {
      console.log(`⏭️  ${ad.location || ad.id}: ${views} vues (trop peu, ignoré)`)
      continue
    }

    const profileId = ad.user_id

    // Calculer le nombre de votes pour chaque type
    const voteCounts = {
      top1: Math.floor(views * getRandomRatio(VOTE_RATIOS.top1.min, VOTE_RATIOS.top1.max)),
      top5: Math.floor(views * getRandomRatio(VOTE_RATIOS.top5.min, VOTE_RATIOS.top5.max)),
      top10: Math.floor(views * getRandomRatio(VOTE_RATIOS.top10.min, VOTE_RATIOS.top10.max)),
      top50: Math.floor(views * getRandomRatio(VOTE_RATIOS.top50.min, VOTE_RATIOS.top50.max)),
    }

    // Assurer au moins 1 vote si des vues existent
    if (views >= 100 && voteCounts.top50 === 0) voteCounts.top50 = 1
    if (views >= 500 && voteCounts.top10 === 0) voteCounts.top10 = 1
    if (views >= 1000 && voteCounts.top5 === 0) voteCounts.top5 = 1
    if (views >= 2000 && voteCounts.top1 === 0) voteCounts.top1 = 1

    const totalVotes = voteCounts.top1 + voteCounts.top5 + voteCounts.top10 + voteCounts.top50

    if (totalVotes === 0) {
      console.log(`⏭️  ${ad.location || ad.id}: ${views} vues (0 votes calculés)`)
      continue
    }

    console.log(`\n📍 ${ad.location || 'Unknown'} (${views} vues):`)
    console.log(`   🥇 Top 1: ${voteCounts.top1} | 🥈 Top 2: ${voteCounts.top5} | 🥉 Top 3: ${voteCounts.top10} | ⭐ Top 50: ${voteCounts.top50}`)

    // Créer les votes
    const votesToInsert = []
    const usedVoters = new Set()

    for (const [voteType, count] of Object.entries(voteCounts)) {
      for (let i = 0; i < count; i++) {
        // Trouver un voter qui n'a pas encore voté pour ce profil
        let voterId = null
        let attempts = 0

        while (!voterId && attempts < 100) {
          const randomVoter = voterIds[getRandomInt(0, voterIds.length - 1)]
          const voteKey = `${randomVoter}-${profileId}`

          // Vérifier que ce voter n'a pas déjà voté pour ce profil
          if (
            randomVoter !== profileId && // Pas voter pour soi-même
            !existingVotesSet.has(voteKey) && // Pas de vote existant
            !usedVoters.has(randomVoter) // Pas déjà utilisé dans cette session
          ) {
            voterId = randomVoter
            usedVoters.add(randomVoter)
            existingVotesSet.add(voteKey)
          }
          attempts++
        }

        if (voterId) {
          votesToInsert.push({
            voter_id: voterId,
            profile_id: profileId,
            vote_type: voteType,
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    // Insérer les votes par batch
    if (votesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('profile_votes')
        .insert(votesToInsert)

      if (insertError) {
        console.error(`   ❌ Erreur insertion:`, insertError.message)
      } else {
        totalVotesAdded += votesToInsert.length
        votesToInsert.forEach(v => stats[v.vote_type]++)
        console.log(`   ✅ ${votesToInsert.length} votes ajoutés`)
      }
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 RÉSUMÉ')
  console.log('='.repeat(50))
  console.log(`Total votes ajoutés: ${totalVotesAdded}`)
  console.log(`🥇 Top 1: ${stats.top1}`)
  console.log(`🥈 Top 2: ${stats.top5}`)
  console.log(`🥉 Top 3: ${stats.top10}`)
  console.log(`⭐ Top 50: ${stats.top50}`)
  console.log('='.repeat(50))
}

addRandomVotes()
