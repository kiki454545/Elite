import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Gérer l'événement de paiement réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const { userId, packageId, coins } = session.metadata!

    try {
      // Récupérer le solde actuel de l'utilisateur
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('elite_coins')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError)
        return NextResponse.json(
          { error: 'Failed to fetch user profile' },
          { status: 500 }
        )
      }

      const currentCoins = profile?.elite_coins || 0
      const newBalance = currentCoins + parseInt(coins)

      // Mettre à jour le solde de coins
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ elite_coins: newBalance })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating coins:', updateError)
        return NextResponse.json(
          { error: 'Failed to update coins' },
          { status: 500 }
        )
      }

      // Logger la transaction
      console.log(`✅ Stripe payment success:`, {
        userId,
        packageId,
        coinsAdded: coins,
        newBalance,
        sessionId: session.id,
        amountPaid: session.amount_total ? session.amount_total / 100 : 0,
      })

      // Optionnel: Créer une entrée dans une table de transactions
      // await supabase.from('transactions').insert({
      //   user_id: userId,
      //   type: 'coin_purchase',
      //   amount: parseInt(coins),
      //   payment_method: 'stripe',
      //   payment_id: session.id,
      //   status: 'completed'
      // })

    } catch (error: any) {
      console.error('Error processing payment:', error)
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
