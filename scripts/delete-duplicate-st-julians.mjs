import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteDuplicates() {
  try {
    console.log('🗑️  Suppression des 14 annonces en double de St. Julian\'s...\n')

    // Les emails en double sont escortemalte278 à escortemalte291
    const duplicateEmails = []
    for (let i = 278; i <= 291; i++) {
      duplicateEmails.push(`escortemalte${i}@gmail.com`)
    }

    console.log(`📧 Emails à supprimer:`)
    duplicateEmails.forEach(email => console.log(`   - ${email}`))
    console.log('')

    // Récupérer les user IDs correspondants
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Erreur listage users:', listError.message)
      process.exit(1)
    }

    const userIdsToDelete = users
      .filter(u => duplicateEmails.includes(u.email))
      .map(u => u.id)

    console.log(`👤 ${userIdsToDelete.length} utilisateurs trouvés\n`)

    let deletedAds = 0
    let deletedProfiles = 0
    let deletedUsers = 0

    for (const userId of userIdsToDelete) {
      const user = users.find(u => u.id === userId)
      console.log(`🔄 Suppression de ${user.email}...`)

      // 1. Supprimer les annonces
      const { data: ads, error: adsError } = await supabase
        .from('ads')
        .delete()
        .eq('user_id', userId)
        .select()

      if (adsError) {
        console.log(`   ⚠️  Erreur suppression annonces: ${adsError.message}`)
      } else {
        deletedAds += ads?.length || 0
        console.log(`   ✅ ${ads?.length || 0} annonce(s) supprimée(s)`)
      }

      // 2. Supprimer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        console.log(`   ⚠️  Erreur suppression profil: ${profileError.message}`)
      } else {
        deletedProfiles++
        console.log(`   ✅ Profil supprimé`)
      }

      // 3. Supprimer l'utilisateur auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        console.log(`   ⚠️  Erreur suppression auth: ${authError.message}`)
      } else {
        deletedUsers++
        console.log(`   ✅ Utilisateur auth supprimé`)
      }

      console.log('')
    }

    console.log('\n📋 RÉSUMÉ DE LA SUPPRESSION')
    console.log('═══════════════════════════════════')
    console.log(`🗑️  ${deletedAds} annonces supprimées`)
    console.log(`👤 ${deletedProfiles} profils supprimés`)
    console.log(`🔐 ${deletedUsers} utilisateurs auth supprimés`)

    // Vérifier le nouveau total
    const { count } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })

    console.log(`\n📊 Nouveau total: ${count} annonces\n`)

  } catch (error) {
    console.error('❌ Erreur globale:', error.message)
    process.exit(1)
  }
}

console.log('🚀 Démarrage de la suppression des doublons...\n')
deleteDuplicates()
