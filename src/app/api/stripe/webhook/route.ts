import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Grille de prix SERVEUR (source de vérité!) - doit correspondre à checkout/route.ts
const COIN_PACKAGES: Record<string, { coins: number; price: number }> = {
  'pack_100': { coins: 100, price: 9.99 },
  'pack_500': { coins: 500, price: 39.99 },
  'pack_1000': { coins: 1000, price: 69.99 },
  'pack_2500': { coins: 2500, price: 149.99 },
  'pack_5000': { coins: 5000, price: 249.99 }
}

// Regex pour valider les UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Erreur de signature webhook:', error.message)
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }

  // Gérer l'événement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    const packageId = session.metadata?.packageId

    // Validation stricte du userId (UUID)
    if (!userId || !UUID_REGEX.test(userId)) {
      console.error('userId manquant ou invalide dans les métadonnées')
      return NextResponse.json(
        { error: 'Métadonnées invalides' },
        { status: 400 }
      )
    }

    // Validation stricte du packageId contre la table serveur
    if (!packageId || !COIN_PACKAGES[packageId]) {
      console.error('packageId manquant ou invalide:', packageId)
      return NextResponse.json(
        { error: 'Package invalide' },
        { status: 400 }
      )
    }

    // SÉCURITÉ: Utiliser les coins de la table serveur, PAS des métadonnées
    const coins = COIN_PACKAGES[packageId].coins

    if (!coins) {
      console.error('Coins invalides pour le package:', packageId)
      return NextResponse.json(
        { error: 'Configuration invalide' },
        { status: 400 }
      )
    }

    try {
      // Récupérer le profil actuel
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('elite_coins')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('Erreur lors de la récupération du profil:', fetchError)
        return NextResponse.json(
          { error: 'Erreur lors de la récupération du profil' },
          { status: 500 }
        )
      }

      // Calculer le nouveau solde
      const currentCoins = profile?.elite_coins || 0
      const newBalance = currentCoins + coins

      // Mettre à jour le solde
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ elite_coins: newBalance })
        .eq('id', userId)

      if (updateError) {
        console.error('Erreur lors de la mise à jour du solde:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour du solde' },
          { status: 500 }
        )
      }

      // Enregistrer la transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'purchase',
          amount: coins,
          package_id: packageId,
          payment_method: 'stripe',
          payment_id: session.id,
          status: 'completed',
        })

      if (transactionError) {
        console.error('Erreur lors de l\'enregistrement de la transaction:', transactionError)
        // Ne pas retourner d'erreur car les coins ont déjà été crédités
      }

      console.log(`✅ ${coins} EliteCoins crédités pour l'utilisateur ${userId}`)
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error)
      return NextResponse.json(
        { error: 'Erreur lors du traitement du paiement' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
