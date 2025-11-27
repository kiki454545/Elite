import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

    // Créer un client Supabase côté serveur avec la clé service
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. RÉCUPÉRER L'UTILISATEUR DEPUIS LE TOKEN
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.error('Erreur auth:', authError)
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { adId, updateData } = body

    // 3. UTILISER LE USER.ID DU TOKEN (PAS DU BODY!)
    const userId = user.id

    // 4. VALIDATION
    if (!adId || !updateData) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Validation UUID pour adId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(adId)) {
      return NextResponse.json(
        { error: 'ID annonce invalide' },
        { status: 400 }
      )
    }

    // Validation du prix si présent dans updateData (sécurité)
    if (updateData.price !== undefined) {
      const price = parseFloat(updateData.price)
      if (isNaN(price) || price < 0 || price > 100000) {
        return NextResponse.json(
          { error: 'Prix invalide (0-100000)' },
          { status: 400 }
        )
      }
      updateData.price = price // Assurer le type number
    }

    // 5. Mettre à jour l'annonce (SEULEMENT si elle appartient à l'utilisateur)
    console.log('📝 Update annonce:', { adId, userId, description: updateData.description?.substring(0, 50) })

    const { data, error } = await supabase
      .from('ads')
      .update(updateData)
      .eq('id', adId)
      .eq('user_id', userId) // ← userId vient du token maintenant!
      .select()
      .single()

    if (error) {
      console.error('❌ Erreur mise à jour annonce:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    if (!data) {
      console.error('❌ Aucune donnée retournée - annonce non trouvée ou pas à cet utilisateur')
      return NextResponse.json(
        { error: 'Annonce non trouvée ou accès refusé' },
        { status: 404 }
      )
    }

    console.log('✅ Annonce mise à jour:', { id: data.id, description: data.description?.substring(0, 50) })
    return NextResponse.json({ data }, { status: 200 })

  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
