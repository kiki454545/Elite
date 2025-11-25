import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client admin avec service role key pour bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification via les cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      )
    }

    // 2. Vérifier le token et récupérer l'utilisateur
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // 3. Vérifier que l'utilisateur est admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // 4. Valider les paramètres de la requête
    const { userId, amount, operation } = await request.json()

    if (!userId || !amount || !operation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validation UUID pour userId (protection contre injection)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid userId format' },
        { status: 400 }
      )
    }

    // Validation du montant
    const parsedAmount = parseInt(amount)
    if (isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 1000000) {
      return NextResponse.json(
        { error: 'Amount must be a positive number between 1 and 1,000,000' },
        { status: 400 }
      )
    }

    if (!['add', 'remove'].includes(operation)) {
      return NextResponse.json(
        { error: 'Invalid operation' },
        { status: 400 }
      )
    }

    // Récupérer le profil avec admin client
    const { data: profileData, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('elite_coins, username')
      .eq('id', userId)
      .single()

    if (fetchError || !profileData) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const currentCoins = profileData.elite_coins || 0
    let newCoins = currentCoins

    if (operation === 'add') {
      newCoins = currentCoins + parsedAmount
    } else {
      newCoins = Math.max(0, currentCoins - parsedAmount)
    }

    // Mettre à jour avec admin client
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ elite_coins: newCoins })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      previousBalance: currentCoins,
      newBalance: newCoins,
      username: profileData.username
    })

  } catch (error: any) {
    console.error('Error managing coins:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
