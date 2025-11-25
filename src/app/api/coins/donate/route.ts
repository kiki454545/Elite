import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    const { toUserId, amount } = body

    // 3. UTILISER LE USER.ID DU TOKEN (PAS DU BODY!)
    const fromUserId = user.id

    console.log('💰 Don d\'EliteCoins:', { fromUserId, toUserId, amount })

    // 4. VALIDATION STRICTE
    if (!toUserId || !amount) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Validation UUID pour toUserId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(toUserId)) {
      return NextResponse.json(
        { error: 'ID destinataire invalide' },
        { status: 400 }
      )
    }

    // Validation montant
    const parsedAmount = parseInt(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 100000) {
      return NextResponse.json(
        { error: 'Le montant doit être entre 1 et 100,000' },
        { status: 400 }
      )
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous faire un don à vous-même' },
        { status: 400 }
      )
    }

    // Récupérer le profil du donateur
    const { data: fromProfile, error: fromError } = await supabase
      .from('profiles')
      .select('elite_coins, username')
      .eq('id', fromUserId)
      .single()

    if (fromError || !fromProfile) {
      console.error('❌ Donateur non trouvé:', fromError)
      return NextResponse.json(
        { error: 'Profil du donateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier le solde
    if (fromProfile.elite_coins < amount) {
      return NextResponse.json(
        {
          error: 'Solde insuffisant',
          required: amount,
          current: fromProfile.elite_coins
        },
        { status: 400 }
      )
    }

    // Récupérer le profil du destinataire
    const { data: toProfile, error: toError } = await supabase
      .from('profiles')
      .select('elite_coins, username')
      .eq('id', toUserId)
      .single()

    if (toError || !toProfile) {
      console.error('❌ Destinataire non trouvé:', toError)
      return NextResponse.json(
        { error: 'Profil du destinataire non trouvé' },
        { status: 404 }
      )
    }

    // Débiter le donateur
    const newFromBalance = fromProfile.elite_coins - parsedAmount
    const { error: debitError } = await supabase
      .from('profiles')
      .update({ elite_coins: newFromBalance })
      .eq('id', fromUserId)

    if (debitError) {
      console.error('❌ Erreur lors du débit:', debitError)
      return NextResponse.json(
        { error: 'Erreur lors du débit' },
        { status: 500 }
      )
    }

    // Créditer le destinataire
    const newToBalance = toProfile.elite_coins + parsedAmount
    const { error: creditError } = await supabase
      .from('profiles')
      .update({ elite_coins: newToBalance })
      .eq('id', toUserId)

    if (creditError) {
      console.error('❌ Erreur lors du crédit:', creditError)
      // Rollback: recréditer le donateur
      await supabase
        .from('profiles')
        .update({ elite_coins: fromProfile.elite_coins })
        .eq('id', fromUserId)

      return NextResponse.json(
        { error: 'Erreur lors du crédit' },
        { status: 500 }
      )
    }

    console.log(`✅ Don de ${parsedAmount} EC de ${fromProfile.username} à ${toProfile.username}`)

    // Créer ou récupérer la conversation entre les deux utilisateurs (SÉCURISÉ)
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id')
      .or(`user1_id.eq.${fromUserId},user2_id.eq.${fromUserId}`)

    // Filtrer côté JS pour éviter SQL injection
    const existingConversation = conversations?.find((conv: any) =>
      (conv.user1_id === fromUserId && conv.user2_id === toUserId) ||
      (conv.user1_id === toUserId && conv.user2_id === fromUserId)
    )

    let conversationId = existingConversation?.id

    // Si pas de conversation existante, en créer une
    if (!conversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert([{
          user1_id: fromUserId,
          user2_id: toUserId,
          last_message: `🎁 Don de ${parsedAmount} EliteCoins reçu !`,
          last_message_at: new Date().toISOString()
        }])
        .select('id')
        .single()

      if (convError) {
        console.error('❌ Erreur création conversation:', convError)
      } else {
        conversationId = newConversation.id
      }
    }

    // Envoyer le message automatique
    if (conversationId) {
      const donMessage = `🎁 Vous avez reçu un don de ${parsedAmount} EliteCoins de la part de ${fromProfile.username} ! Merci pour votre soutien. 💝`

      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: fromUserId,
          content: donMessage,
          read: false
        }])

      if (messageError) {
        console.error('❌ Erreur envoi message don:', messageError)
      } else {
        // Mettre à jour last_message de la conversation
        await supabase
          .from('conversations')
          .update({
            last_message: donMessage,
            last_message_at: new Date().toISOString()
          })
          .eq('id', conversationId)

        console.log('✅ Message de don envoyé')
      }
    }

    // TODO: Enregistrer dans une table transactions pour l'historique

    return NextResponse.json({
      success: true,
      amount: parsedAmount,
      fromBalance: newFromBalance,
      toBalance: newToBalance,
      from: fromProfile.username,
      to: toProfile.username
    })

  } catch (error) {
    console.error('❌ Donation error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Donation endpoint',
    method: 'Use POST with fromUserId, toUserId, and amount'
  })
}
