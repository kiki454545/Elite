import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()

  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const botToken = process.env.DISCORD_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ error: 'Discord non configuré' }, { status: 500 })
    }

    // Récupérer les données du formulaire (multipart/form-data)
    const formData = await request.formData()
    const channelId = formData.get('channelId') as string
    const message = formData.get('message') as string
    const files = formData.getAll('files') as File[]

    if (!channelId) {
      return NextResponse.json({ error: 'Canal non sélectionné' }, { status: 400 })
    }

    if (!message && files.length === 0) {
      return NextResponse.json({ error: 'Message ou fichier requis' }, { status: 400 })
    }

    // Créer le FormData pour Discord
    const discordFormData = new FormData()

    // Ajouter le message si présent
    if (message) {
      discordFormData.append('payload_json', JSON.stringify({ content: message }))
    }

    // Ajouter les fichiers
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      discordFormData.append(`files[${i}]`, file, file.name)
    }

    // Envoyer à Discord
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`
      },
      body: discordFormData
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Discord send error:', error)
      return NextResponse.json({ error: 'Erreur envoi Discord: ' + error }, { status: response.status })
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      messageId: result.id,
      channelId: result.channel_id
    })

  } catch (error: any) {
    console.error('Discord send error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
