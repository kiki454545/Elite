import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Grille de prix SERVEUR (source de vérité!)
const RANK_PRICES: Record<string, Record<number, number>> = {
  'premium': { 30: 500, 90: 1350, 180: 2520 },
  'diamond': { 30: 1500, 90: 4050, 180: 7560 },
  'legend': { 30: 3000, 90: 8100, 180: 15120 }
}

export async function POST(request: NextRequest) {
  try {
    // 1. VÉRIFICATION AUTHENTIFICATION
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

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

    const body = await request.json()
    const { rank, days } = body

    // 3. UTILISER LE USER.ID DU TOKEN (PAS DU BODY!)
    const userId = user.id

    console.log('📥 Achat de grade:', { userId, rank, days })

    // 4. VALIDATION STRICTE
    if (!rank || !days) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Validation du rang
    if (!['premium', 'diamond', 'legend'].includes(rank)) {
      return NextResponse.json(
        { error: 'Rang invalide' },
        { status: 400 }
      )
    }

    // Validation de la durée
    const parsedDays = parseInt(days)
    if (![30, 90, 180].includes(parsedDays)) {
      return NextResponse.json(
        { error: 'Durée invalide' },
        { status: 400 }
      )
    }

    // 5. CALCULER LE PRIX CÔTÉ SERVEUR (NE JAMAIS FAIRE CONFIANCE AU CLIENT!)
    const coinPrice = RANK_PRICES[rank][parsedDays]

    if (!coinPrice) {
      return NextResponse.json(
        { error: 'Combinaison rang/durée invalide' },
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
    expiryDate.setDate(expiryDate.getDate() + parsedDays)

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

    console.log(`✅ Grade ${rank} attribué à ${userId} pour ${parsedDays} jours. Nouveau solde: ${newBalance} EC`)

    // Enregistrer la transaction dans l'historique des achats
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        purchase_type: 'rank',
        item_name: `${rank} (${parsedDays} jours)`,
        amount: coinPrice,
        currency: 'coins',
        payment_method: 'elite_coins',
        metadata: {
          rank,
          days: parsedDays,
          expiry_date: expiryDate.toISOString()
        }
      })

    if (purchaseError) {
      console.error('⚠️ Error saving purchase history:', purchaseError)
      // Ne pas bloquer l'achat si l'enregistrement échoue
    }

    return NextResponse.json({
      success: true,
      newBalance,
      rank,
      expiryDate: expiryDate.toISOString(),
      coinsSpent: coinPrice,
      daysAdded: parsedDays
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
