import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetPasswords() {
  try {
    console.log('🔄 Début de la réinitialisation des mots de passe...\n')

    let successCount = 0
    let errorCount = 0

    // Boucle de escortemalte1@gmail.com à escortemalte415@gmail.com
    for (let i = 1; i <= 415; i++) {
      const email = `escortemalte${i}@gmail.com`

      try {
        // Vérifier si l'utilisateur existe
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

        if (userError) {
          console.error(`❌ Erreur lors de la récupération des utilisateurs:`, userError.message)
          continue
        }

        const user = userData.users.find(u => u.email === email)

        if (!user) {
          // Utilisateur n'existe pas, on passe
          continue
        }

        // Mettre à jour le mot de passe à "111111" (6 caractères minimum requis)
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: '111111' }
        )

        if (updateError) {
          console.error(`❌ ${email}: ${updateError.message}`)
          errorCount++
        } else {
          console.log(`✅ ${email}: Mot de passe changé à "111111"`)
          successCount++
        }

        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (err) {
        console.error(`❌ ${email}: Erreur inattendue`, err.message)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`🎉 Terminé !`)
    console.log(`✅ Succès: ${successCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Erreur globale:', error)
  }
}

resetPasswords()
