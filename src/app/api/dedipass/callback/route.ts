import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const dedipassPublicKey = process.env.NEXT_PUBLIC_DEDIPASS_PUBLIC_KEY!
const dedipassPrivateKey = process.env.DEDIPASS_PRIVATE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, userId, packageId } = body

    console.log('📥 Validation de code Dédipass:', { code, userId, packageId })

    // Valider le code avec l'API Dédipass
    const dedipassResponse = await fetch(
      `http://api.dedipass.com/v1/pay/?public_key=${dedipassPublicKey}&private_key=${dedipassPrivateKey}&code=${code}`
    )

    const dedipassData = await dedipassResponse.json()

    console.log('📨 Réponse Dédipass:', dedipassData)

    // Vérifier que le paiement est validé
    if (dedipassData.status !== 'success') {
      return NextResponse.json(
        { error: 'Code invalide ou déjà utilisé', status: 'invalid' },
        { status: 400 }
      )
    }

    // Récupérer le nombre d'EliteCoins depuis la réponse Dédipass
    const coinsToAdd = parseInt(dedipassData.virtual_currency) || 0

    if (coinsToAdd === 0) {
      return NextResponse.json(
        { error: 'Nombre de coins invalide' },
        { status: 400 }
      )
    }

    // Récupérer le profil actuel
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('elite_coins')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError)
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    // Ajouter les EliteCoins
    const newBalance = (profile.elite_coins || 0) + coinsToAdd

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ elite_coins: newBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating coins:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    console.log(`✅ Added ${coinsToAdd} EliteCoins to user ${userId}. New balance: ${newBalance}`)

    // TODO: Enregistrer la transaction dans une table "transactions" pour historique

    return NextResponse.json({
      success: true,
      status: 'success',
      coinsAdded: coinsToAdd,
      newBalance,
      rate: dedipassData.rate,
      payout: dedipassData.payout
    })

  } catch (error) {
    console.error('❌ Dédipass validation error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', status: 'error' },
      { status: 500 }
    )
  }
}

// Accepter aussi les requêtes GET pour les tests
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Dédipass validation endpoint',
    method: 'Use POST with code, userId, and packageId'
  })
}
