import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adId, userId, updateData } = body

    if (!adId || !userId || !updateData) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Créer un client Supabase côté serveur avec la clé service
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Mettre à jour l'annonce
    const { data, error } = await supabase
      .from('ads')
      .update(updateData)
      .eq('id', adId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour annonce:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })

  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
