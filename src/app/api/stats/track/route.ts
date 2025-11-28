import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer l'IP depuis les headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    const body = await request.json().catch(() => ({}))
    const pagePath = body.path || '/'

    // Enregistrer la visite
    const { error } = await supabase
      .from('visitor_stats')
      .insert({
        ip_address: ip,
        user_agent: userAgent,
        page_path: pagePath,
        referrer: referer,
        visited_at: new Date().toISOString()
      })

    if (error) {
      console.error('Erreur tracking visite:', error)
      return NextResponse.json({ error: 'Erreur tracking' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur serveur tracking:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
