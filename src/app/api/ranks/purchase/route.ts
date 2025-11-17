import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, rank, days, coinPrice } = body

    console.log('📥 Achat de grade:', { userId, rank, days, coinPrice })

    // Vérifier que tous les paramètres sont présents
    if (!userId || !rank || !days || !coinPrice) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Récupérer le profil actuel
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('elite_coins, rank, rank_expiry')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError)
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur a assez d'EliteCoins
    if (profile.elite_coins < coinPrice) {
      return NextResponse.json(
        {
          error: 'Solde insuffisant',
          required: coinPrice,
          current: profile.elite_coins
        },
        { status: 400 }
      )
    }

    // Calculer la nouvelle date d'expiration
    const now = new Date()
    let expiryDate: Date

    if (profile.rank === rank && profile.rank_expiry) {
      // Si l'utilisateur a déjà ce grade, prolonger depuis la date d'expiration existante
      const currentExpiry = new Date(profile.rank_expiry)
      expiryDate = currentExpiry > now ? currentExpiry : now
    } else {
      // Nouveau grade ou grade expiré, commencer depuis maintenant
      expiryDate = now
    }

    // Ajouter les jours
    expiryDate.setDate(expiryDate.getDate() + days)

    // Débiter les EliteCoins et attribuer le grade
    const newBalance = profile.elite_coins - coinPrice

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        elite_coins: newBalance,
        rank: rank,
        rank_expiry: expiryDate.toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    console.log(`✅ Grade ${rank} attribué à ${userId} pour ${days} jours. Nouveau solde: ${newBalance} EC`)

    // TODO: Enregistrer la transaction dans une table "transactions" pour historique

    return NextResponse.json({
      success: true,
      newBalance,
      rank,
      expiryDate: expiryDate.toISOString(),
      coinsSpent: coinPrice,
      daysAdded: days
    })

  } catch (error) {
    console.error('❌ Rank purchase error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Accepter aussi les requêtes GET pour les tests
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Rank purchase endpoint',
    method: 'Use POST with userId, rank, days, and coinPrice'
  })
}
