import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Grille de prix SERVEUR (source de vérité!)
const COIN_PACKAGES: Record<string, { coins: number; price: number }> = {
  'pack_100': { coins: 100, price: 9.99 },
  'pack_500': { coins: 500, price: 39.99 },
  'pack_1000': { coins: 1000, price: 69.99 },
  'pack_2500': { coins: 2500, price: 149.99 },
  'pack_5000': { coins: 5000, price: 249.99 }
}

export async function POST(request: NextRequest) {
  try {
    // 1. VÉRIFICATION AUTHENTIFICATION via header Authorization
    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // 2. RÉCUPÉRER L'UTILISATEUR DEPUIS LE TOKEN
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

    const { packageId } = await request.json()

    // 3. UTILISER LE USER.ID DU TOKEN (PAS DU BODY!)
    const userId = user.id

    // 4. VALIDATION DU PACKAGE
    if (!packageId || !COIN_PACKAGES[packageId]) {
      return NextResponse.json(
        { error: 'Package invalide' },
        { status: 400 }
      )
    }

    // 5. RÉCUPÉRER PRIX ET COINS DEPUIS LE SERVEUR (NE JAMAIS FAIRE CONFIANCE AU CLIENT!)
    const { coins, price } = COIN_PACKAGES[packageId]

    // 6. Créer une session de paiement Stripe avec les VRAIS prix
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${coins} EliteCoins`,
              description: `Pack de ${coins} EliteCoins pour SexElite`,
            },
            unit_amount: Math.round(price * 100), // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop`,
      metadata: {
        userId,
        packageId,
        coins: coins.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Erreur Stripe:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}
