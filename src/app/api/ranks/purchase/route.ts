import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Prix de base pour 30 jours (source de vérité!)
const BASE_PRICES: Record<string, number> = {
  'plus': 300,
  'vip': 950,
  'elite': 2100
}

// Multiplicateurs de durée (mêmes que le client)
const DURATION_MULTIPLIERS: Record<number, number> = {
  1: 0.055,
  2: 0.105,
  3: 0.15,
  5: 0.24,
  7: 0.32,
  10: 0.43,
  15: 0.6,
  20: 0.75,
  30: 1
}

// Calcule le prix en coins pour un rang et une durée
function calculateCoinPrice(rank: string, days: number): number | null {
  const basePrice = BASE_PRICES[rank]
  const multiplier = DURATION_MULTIPLIERS[days]
  if (!basePrice || !multiplier) return null
  return Math.ceil(basePrice * multiplier)
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
    if (!['plus', 'vip', 'elite'].includes(rank)) {
      return NextResponse.json(
        { error: 'Rang invalide' },
        { status: 400 }
      )
    }

    // Validation de la durée
    const parsedDays = parseInt(days)
    const validDurations = [1, 2, 3, 5, 7, 10, 15, 20, 30]
    if (!validDurations.includes(parsedDays)) {
      return NextResponse.json(
        { error: 'Durée invalide' },
        { status: 400 }
      )
    }

    // 5. CALCULER LE PRIX CÔTÉ SERVEUR (NE JAMAIS FAIRE CONFIANCE AU CLIENT!)
    const coinPrice = calculateCoinPrice(rank, parsedDays)

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
