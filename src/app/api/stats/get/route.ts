import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Vérifier que l'utilisateur est admin (via token)
    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier si admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Date d'aujourd'hui et hier
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString()

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString()

    // Récupérer toutes les stats en parallèle
    const [
      totalUniqueResult,
      totalVisitsResult,
      todayUniqueResult,
      todayTotalResult,
      yesterdayUniqueResult,
      yesterdayTotalResult,
      last7DaysResult
    ] = await Promise.all([
      // Total visiteurs uniques (toutes périodes)
      supabase.from('visitor_stats').select('ip_address'),

      // Total de visites
      supabase.from('visitor_stats').select('id', { count: 'exact', head: true }),

      // Visiteurs uniques aujourd'hui
      supabase.from('visitor_stats')
        .select('ip_address')
        .gte('visited_at', todayStr)
        .lt('visited_at', tomorrowStr),

      // Total visites aujourd'hui
      supabase.from('visitor_stats')
        .select('id', { count: 'exact', head: true })
        .gte('visited_at', todayStr)
        .lt('visited_at', tomorrowStr),

      // Visiteurs uniques hier
      supabase.from('visitor_stats')
        .select('ip_address')
        .gte('visited_at', yesterdayStr)
        .lt('visited_at', todayStr),

      // Total visites hier
      supabase.from('visitor_stats')
        .select('id', { count: 'exact', head: true })
        .gte('visited_at', yesterdayStr)
        .lt('visited_at', todayStr),

      // Données des 7 derniers jours pour le graphique
      supabase.from('visitor_stats')
        .select('ip_address, visited_at')
        .gte('visited_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ])

    // Calculer les visiteurs uniques (dédupliquer par IP)
    const totalUniqueIps = new Set(totalUniqueResult.data?.map(v => v.ip_address) || [])
    const todayUniqueIps = new Set(todayUniqueResult.data?.map(v => v.ip_address) || [])
    const yesterdayUniqueIps = new Set(yesterdayUniqueResult.data?.map(v => v.ip_address) || [])

    // Préparer les données des 7 derniers jours
    const dailyStats: { date: string; unique: number; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toISOString().split('T')[0]

      const dayVisits = last7DaysResult.data?.filter(v => {
        const visitDate = new Date(v.visited_at).toISOString().split('T')[0]
        return visitDate === dateStr
      }) || []

      const uniqueIps = new Set(dayVisits.map(v => v.ip_address))

      dailyStats.push({
        date: dateStr,
        unique: uniqueIps.size,
        total: dayVisits.length
      })
    }

    return NextResponse.json({
      totalUniqueVisitors: totalUniqueIps.size,
      totalVisits: totalVisitsResult.count || 0,
      todayUniqueVisitors: todayUniqueIps.size,
      todayTotalVisits: todayTotalResult.count || 0,
      yesterdayUniqueVisitors: yesterdayUniqueIps.size,
      yesterdayTotalVisits: yesterdayTotalResult.count || 0,
      dailyStats
    })

  } catch (error) {
    console.error('Erreur récupération stats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
