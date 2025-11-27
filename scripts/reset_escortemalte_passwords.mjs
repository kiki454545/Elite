import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non défini')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const NEW_PASSWORD = 'aaaaaa'

async function getAllUsers() {
  console.log('📥 Récupération de tous les utilisateurs...')
  const allUsers = []
  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: perPage
    })

    if (error) {
      console.error('Erreur listUsers:', error.message)
      break
    }

    if (!data?.users || data.users.length === 0) {
      break
    }

    allUsers.push(...data.users)
    console.log(`   Page ${page}: ${data.users.length} utilisateurs`)

    if (data.users.length < perPage) {
      break
    }

    page++
  }

  console.log(`📊 Total: ${allUsers.length} utilisateurs\n`)
  return allUsers
}

async function resetPasswords() {
  console.log('🔄 Début de la réinitialisation des mots de passe...\n')

  // Récupérer tous les utilisateurs une seule fois
  const allUsers = await getAllUsers()

  // Créer un map email -> user pour recherche rapide
  const userMap = new Map()
  for (const user of allUsers) {
    if (user.email) {
      userMap.set(user.email.toLowerCase(), user)
    }
  }

  let success = 0
  let failed = 0
  let notFound = 0

  // De escortemalte1 à escortemalte400
  for (let i = 1; i <= 400; i++) {
    const email = `escortemalte${i}@gmail.com`.toLowerCase()

    const user = userMap.get(email)

    if (!user) {
      notFound++
      continue
    }

    try {
      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: NEW_PASSWORD }
      )

      if (updateError) {
        console.log(`❌ ${email}: Erreur - ${updateError.message}`)
        failed++
      } else {
        console.log(`✅ ${email}: OK`)
        success++
      }

    } catch (error) {
      console.log(`❌ ${email}: Exception - ${error.message}`)
      failed++
    }

    // Pause tous les 50 comptes pour éviter rate limiting
    if (success > 0 && success % 50 === 0) {
      console.log(`\n⏳ Progression: ${success} comptes mis à jour...\n`)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 RÉSUMÉ:')
  console.log(`   ✅ Succès: ${success}`)
  console.log(`   ❌ Échecs: ${failed}`)
  console.log(`   ⚪ Non trouvés: ${notFound}`)
  console.log('='.repeat(50))
}

resetPasswords()
