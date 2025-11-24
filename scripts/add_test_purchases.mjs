import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addTestPurchases() {
  try {
    console.log('🔍 Recherche du profil avec l\'email ekinokz1203@gmail.com...')

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email')
      .eq('email', 'ekinokz1203@gmail.com')
      .single()

    if (profileError || !profile) {
      console.error('❌ Profil non trouvé:', profileError)
      return
    }

    console.log(`✅ Profil trouvé: ${profile.username} (${profile.id})`)

    // Créer 3 achats de test
    const testPurchases = [
      {
        user_id: profile.id,
        purchase_type: 'rank',
        item_name: 'VIP (30 jours)',
        amount: 500,
        currency: 'coins',
        payment_method: 'elite_coins',
        metadata: {
          rank: 'VIP',
          days: 30,
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // Il y a 5 jours
      },
      {
        user_id: profile.id,
        purchase_type: 'coins',
        item_name: '1000 Elite Coins',
        amount: 999,
        currency: 'eur',
        payment_method: 'stripe',
        metadata: {
          coins_amount: 1000,
          transaction_id: 'test_stripe_' + Math.random().toString(36).substr(2, 9)
        },
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // Il y a 10 jours
      },
      {
        user_id: profile.id,
        purchase_type: 'rank',
        item_name: 'Premium (7 jours)',
        amount: 200,
        currency: 'coins',
        payment_method: 'elite_coins',
        metadata: {
          rank: 'Premium',
          days: 7,
          expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // Il y a 2 heures
      }
    ]

    console.log('\n💳 Insertion de 3 achats de test...')

    for (const purchase of testPurchases) {
      const { data, error } = await supabase
        .from('purchases')
        .insert(purchase)
        .select()

      if (error) {
        console.error(`❌ Erreur lors de l'insertion:`, error)
      } else {
        console.log(`✅ Achat ajouté: ${purchase.item_name} (${purchase.amount} ${purchase.currency})`)
      }
    }

    console.log('\n🎉 Terminé ! 3 achats de test ont été ajoutés.')
    console.log(`📊 Vous pouvez maintenant voir l'historique dans le panel admin pour le profil: ${profile.username}`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

addTestPurchases()
