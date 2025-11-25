import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client admin avec service role key pour bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, operation } = await request.json()

    if (!userId || !amount || !operation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
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
      newCoins = currentCoins + amount
    } else {
      newCoins = Math.max(0, currentCoins - amount)
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
