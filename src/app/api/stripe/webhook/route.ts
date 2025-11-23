import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    const coins = parseInt(session.metadata?.coins || '0')
    const packageId = session.metadata?.packageId

    if (!userId || !coins) {
      console.error('Métadonnées manquantes dans la session')
      return NextResponse.json(
        { error: 'Métadonnées manquantes' },
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
