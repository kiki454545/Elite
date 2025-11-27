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

// Fonction pour obtenir l'IP réelle du client
function getClientIp(request: NextRequest): string {
  // Essayer différents headers pour obtenir l'IP réelle
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs, prendre la première
    return forwardedFor.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback (ne devrait pas arriver en production)
  return '0.0.0.0'
}

// Regex pour valider les UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin()
  try {
    const { adId, userId } = await request.json()

    if (!adId) {
      return NextResponse.json({ error: 'adId requis' }, { status: 400 })
    }

    // Validation UUID pour adId (sécurité)
    if (!UUID_REGEX.test(adId)) {
      return NextResponse.json({ error: 'Format adId invalide' }, { status: 400 })
    }

    // Validation UUID pour userId si fourni (optionnel mais sécurisé)
    if (userId && !UUID_REGEX.test(userId)) {
      // Ignorer silencieusement un userId invalide plutôt que bloquer
      // La vue sera quand même comptée, juste sans mise à jour du profil
    }

    // Obtenir l'IP du client
    const ipAddress = getClientIp(request)
    const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD

    // 1. Vérifier si cette IP a déjà vu cette annonce aujourd'hui
    const { data: existingView, error: fetchError } = await supabase
      .from('ad_views')
      .select('*')
      .eq('ad_id', adId)
      .eq('ip_address', ipAddress)
      .eq('last_view_date', today)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = pas de résultat
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // 2. Si la vue existe, vérifier le compteur
    if (existingView) {
      if (existingView.view_count >= 5) {
        return NextResponse.json({
          success: false,
          message: 'Limite de vues quotidienne atteinte',
          viewCount: existingView.view_count
        }, { status: 200 })
      }

      // Incrémenter le compteur
      const { error: updateError } = await supabase
        .from('ad_views')
        .update({
          view_count: existingView.view_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingView.id)

      if (updateError) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
      }

      // Incrémenter aussi le compteur global de l'annonce
      await incrementAdViewCount(adId)

      return NextResponse.json({
        success: true,
        viewCount: existingView.view_count + 1
      })
    }

    // 3. Sinon, créer une nouvelle entrée
    const { error: insertError } = await supabase
      .from('ad_views')
      .insert([{
        ad_id: adId,
        ip_address: ipAddress,
        view_count: 1,
        last_view_date: today
      }])

    if (insertError) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Incrémenter le compteur global de l'annonce
    await incrementAdViewCount(adId)

    // 4. Si un userId valide est fourni, mettre à jour la dernière IP dans le profil
    if (userId && UUID_REGEX.test(userId)) {
      await updateUserLastIp(userId, ipAddress)
    }

    return NextResponse.json({
      success: true,
      viewCount: 1
    })

  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Fonction helper pour incrémenter le compteur global de vues
async function incrementAdViewCount(adId: string) {
  const supabase = getSupabaseAdmin()
  const { data: ad } = await supabase
    .from('ads')
    .select('views, weekly_views')
    .eq('id', adId)
    .single()

  if (ad) {
    await supabase
      .from('ads')
      .update({
        views: (ad.views || 0) + 1,
        weekly_views: (ad.weekly_views || 0) + 1
      })
      .eq('id', adId)
  }
}

// Fonction helper pour mettre à jour la dernière IP de l'utilisateur
async function updateUserLastIp(userId: string, ipAddress: string) {
  const supabase = getSupabaseAdmin()
  await supabase
    .from('profiles')
    .update({ last_ip: ipAddress })
    .eq('id', userId)
}
