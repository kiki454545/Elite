import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function removeNumbersFromUsernames() {
  try {
    console.log('🔍 Recherche des profils avec des numéros dans le nom d\'utilisateur...\n')

    // Récupérer le nombre total de profils
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 ${count} profils au total dans la base\n`)

    let allProfiles = []
    const pageSize = 1000
    let page = 0

    // Récupérer tous les profils par lots de 1000
    while (true) {
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, username')
        .order('username')
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (fetchError) {
        console.error('❌ Erreur lors de la récupération des profils:', fetchError)
        break
      }

      if (!profiles || profiles.length === 0) {
        break
      }

      allProfiles = allProfiles.concat(profiles)
      console.log(`📥 Chargé ${allProfiles.length} profils...`)
      page++

      if (profiles.length < pageSize) {
        break
      }
    }

    console.log(`\n✅ Total chargé : ${allProfiles.length} profils\n`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const profile of allProfiles) {
      // Vérifier si le username contient des chiffres
      if (!/\d/.test(profile.username)) {
        // Pas de chiffres, on passe
        skippedCount++
        continue
      }

      // Retirer tous les chiffres du username et nettoyer les espaces en trop
      let newUsername = profile.username.replace(/\d+/g, '').trim()

      // Nettoyer les espaces multiples
      newUsername = newUsername.replace(/\s+/g, ' ')

      // Si le nouveau username est vide ou identique, on passe
      if (!newUsername || newUsername === profile.username || newUsername.length < 2) {
        skippedCount++
        continue
      }

      // Mettre à jour le username directement (même si ça existe déjà, c'est voulu)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', profile.id)

      if (updateError) {
        console.error(`❌ ${profile.username} → ${newUsername} : ${updateError.message}`)
        errorCount++
      } else {
        console.log(`✅ ${profile.username} → ${newUsername}`)
        updatedCount++
      }

      // Petit délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Terminé !')
    console.log(`✅ Usernames modifiés: ${updatedCount}`)
    console.log(`⏭️  Ignorés (pas de numéros ou déjà pris): ${skippedCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Erreur globale:', error)
  }
}

removeNumbersFromUsernames()
