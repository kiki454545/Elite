import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('URL:', supabaseUrl)
  console.error('Key:', supabaseAnonKey ? 'présente' : 'manquante')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addTestMessages() {
  try {
    console.log('🔍 Recherche du compte ekinokz1203...')

    // Trouver l'utilisateur ekinokz1203
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', 'ekinokz1203')
      .single()

    if (userError || !targetUser) {
      console.error('❌ Utilisateur ekinokz1203 non trouvé:', userError)
      return
    }

    console.log(`✅ Utilisateur trouvé: ${targetUser.username} (${targetUser.id})`)

    // Récupérer 10 autres utilisateurs pour créer des conversations
    const { data: otherUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, username')
      .neq('id', targetUser.id)
      .limit(10)

    if (usersError || !otherUsers || otherUsers.length === 0) {
      console.error('❌ Pas assez d\'utilisateurs pour créer des conversations:', usersError)
      return
    }

    console.log(`✅ ${otherUsers.length} utilisateurs trouvés pour créer des conversations`)

    // Messages de test variés
    const testMessages = [
      "Salut, ton annonce m'intéresse beaucoup !",
      "Bonjour, es-tu disponible aujourd'hui ?",
      "Hello, je voudrais plus d'informations",
      "Coucou, c'est possible de discuter ?",
      "Bonsoir, j'aimerais te rencontrer",
      "Hey, tu es dispo ce soir ?",
      "Salut, tu fais quels services ?",
      "Bonjour, quels sont tes tarifs ?",
      "Hello, tu es où exactement ?",
      "Coucou, on peut se voir quand ?"
    ]

    // Créer une conversation avec chaque utilisateur
    for (let i = 0; i < otherUsers.length; i++) {
      const otherUser = otherUsers[i]
      const message = testMessages[i]

      console.log(`\n📝 Création de conversation avec ${otherUser.username}...`)

      // Vérifier si une conversation existe déjà
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${targetUser.id},user2_id.eq.${otherUser.id}),and(user1_id.eq.${otherUser.id},user2_id.eq.${targetUser.id})`)
        .maybeSingle()

      let conversationId

      if (existingConv) {
        console.log(`  ℹ️  Conversation existante trouvée`)
        conversationId = existingConv.id
      } else {
        // Créer une nouvelle conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert([{
            user1_id: otherUser.id,
            user2_id: targetUser.id,
            last_message: message,
            last_message_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (convError) {
          console.error(`  ❌ Erreur création conversation:`, convError)
          continue
        }

        conversationId = newConv.id
        console.log(`  ✅ Conversation créée: ${conversationId}`)
      }

      // Ajouter un message dans la conversation
      const { error: msgError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: otherUser.id,
          content: message,
          read: false
        }])

      if (msgError) {
        console.error(`  ❌ Erreur ajout message:`, msgError)
        continue
      }

      // Mettre à jour last_message de la conversation
      await supabase
        .from('conversations')
        .update({
          last_message: message,
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      console.log(`  ✅ Message ajouté: "${message}"`)
    }

    console.log('\n✅ 10 conversations de test créées avec succès !')

  } catch (err) {
    console.error('❌ Erreur:', err)
  }
}

addTestMessages()
