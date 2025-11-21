import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
})

// Packages de coins avec leurs prix
const COIN_PACKAGES = {
  pack_5: { coins: 75, price: 5, name: '75 EliteCoins' },
  pack_10: { coins: 150, price: 10, name: '150 EliteCoins' },
  pack_20: { coins: 300, price: 20, name: '300 EliteCoins' },
  pack_30: { coins: 500, price: 30, name: '500 EliteCoins (450 + 50 bonus)' },
  pack_40: { coins: 700, price: 40, name: '700 EliteCoins (600 + 100 bonus)' },
  pack_50: { coins: 950, price: 50, name: '950 EliteCoins (750 + 200 bonus)' },
  pack_80: { coins: 1600, price: 80, name: '1600 EliteCoins (1200 + 400 bonus)' },
  pack_100: { coins: 2100, price: 100, name: '2100 EliteCoins (1500 + 600 bonus)' },
}

export async function POST(request: NextRequest) {
  try {
    const { packageId, userId } = await request.json()

    if (!packageId || !userId) {
      return NextResponse.json(
        { error: 'Package ID and User ID are required' },
        { status: 400 }
      )
    }

    const packageData = COIN_PACKAGES[packageId as keyof typeof COIN_PACKAGES]

    if (!packageData) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      )
    }

    // Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: packageData.name,
              description: `Pack de ${packageData.coins} EliteCoins pour SexElite MinecraftBoost`,
              images: ['https://sexelite.eu/favicon.svg'],
            },
            unit_amount: packageData.price * 100, // Prix en centimes
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
        coins: packageData.coins.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
