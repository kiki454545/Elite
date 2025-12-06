import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Plages IP des services cloud (bots, crawlers, monitoring)
const BOT_IP_RANGES = [
  // Amazon AWS
  { start: '3.0.0.0', end: '3.255.255.255' },
  { start: '13.52.0.0', end: '13.57.255.255' },
  { start: '18.144.0.0', end: '18.144.255.255' },
  { start: '52.0.0.0', end: '52.255.255.255' },
  { start: '54.0.0.0', end: '54.255.255.255' },
  // DigitalOcean
  { start: '64.23.0.0', end: '64.23.255.255' },
  { start: '143.110.0.0', end: '143.110.255.255' },
  { start: '143.198.0.0', end: '143.198.255.255' },
  { start: '146.190.0.0', end: '146.190.255.255' },
  { start: '147.182.0.0', end: '147.182.255.255' },
  { start: '164.90.0.0', end: '164.92.255.255' },
  { start: '165.232.0.0', end: '165.232.255.255' },
  { start: '137.184.0.0', end: '137.184.255.255' },
  { start: '24.199.0.0', end: '24.199.255.255' },
  // Google Cloud
  { start: '34.0.0.0', end: '34.255.255.255' },
  { start: '35.0.0.0', end: '35.255.255.255' },
  // Microsoft Azure
  { start: '40.0.0.0', end: '40.127.255.255' },
  { start: '104.40.0.0', end: '104.47.255.255' },
  // OVH (certains serveurs)
  { start: '51.75.0.0', end: '51.75.255.255' },
  { start: '54.38.0.0', end: '54.38.255.255' },
]

function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number)
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
}

function isIpInRange(ip: string, start: string, end: string): boolean {
  const ipNum = ipToNumber(ip)
  const startNum = ipToNumber(start)
  const endNum = ipToNumber(end)
  return ipNum >= startNum && ipNum <= endNum
}

function isBotIp(ip: string): boolean {
  // Ignorer localhost
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    return true
  }

  // Vérifier si IPv4 valide
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    return false
  }

  // Vérifier les plages IP de bots
  for (const range of BOT_IP_RANGES) {
    if (isIpInRange(ip, range.start, range.end)) {
      return true
    }
  }

  return false
}

// Filtrer les IPs de bots d'une liste
function filterBotIps(data: { ip_address: string }[] | null): { ip_address: string }[] {
  if (!data) return []
  return data.filter(v => !isBotIp(v.ip_address))
}

// Fonction pour récupérer toutes les données avec pagination (Supabase limite à 1000 par défaut)
async function fetchAllRows(
  supabase: any,
  table: string,
  selectColumns: string,
  filters?: { column: string; op: 'gte' | 'lt'; value: string }[]
) {
  const batchSize = 1000
  let allData: any[] = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    let query = supabase.from(table).select(selectColumns).range(from, from + batchSize - 1)

    if (filters) {
      for (const filter of filters) {
        if (filter.op === 'gte') {
          query = query.gte(filter.column, filter.value)
        } else if (filter.op === 'lt') {
          query = query.lt(filter.column, filter.value)
        }
      }
    }

    const { data, error } = await query
    if (error) throw error

    if (data && data.length > 0) {
      allData = [...allData, ...data]
      from += batchSize
      hasMore = data.length === batchSize
    } else {
      hasMore = false
    }
  }

  return allData
}

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

    // Récupérer toutes les stats avec pagination
    const [
      totalUniqueData,
      todayUniqueData,
      yesterdayUniqueData,
      last7DaysData
    ] = await Promise.all([
      // Total visiteurs uniques (toutes périodes)
      fetchAllRows(supabase, 'visitor_stats', 'ip_address'),

      // Visiteurs uniques aujourd'hui
      fetchAllRows(supabase, 'visitor_stats', 'ip_address', [
        { column: 'visited_at', op: 'gte', value: todayStr },
        { column: 'visited_at', op: 'lt', value: tomorrowStr }
      ]),

      // Visiteurs uniques hier
      fetchAllRows(supabase, 'visitor_stats', 'ip_address', [
        { column: 'visited_at', op: 'gte', value: yesterdayStr },
        { column: 'visited_at', op: 'lt', value: todayStr }
      ]),

      // Données des 7 derniers jours pour le graphique
      fetchAllRows(supabase, 'visitor_stats', 'ip_address, visited_at', [
        { column: 'visited_at', op: 'gte', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
      ])
    ])

    // Filtrer les bots et calculer les visiteurs uniques (dédupliquer par IP)
    const filteredTotal = filterBotIps(totalUniqueData)
    const filteredToday = filterBotIps(todayUniqueData)
    const filteredYesterday = filterBotIps(yesterdayUniqueData)
    const filteredLast7Days = filterBotIps(last7DaysData)

    const totalUniqueIps = new Set(filteredTotal.map(v => v.ip_address))
    const todayUniqueIps = new Set(filteredToday.map(v => v.ip_address))
    const yesterdayUniqueIps = new Set(filteredYesterday.map(v => v.ip_address))

    // Préparer les données des 7 derniers jours (sans les bots)
    const dailyStats: { date: string; unique: number; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toISOString().split('T')[0]

      const dayVisits = last7DaysData.filter((v: any) => {
        if (isBotIp(v.ip_address)) return false
        const visitDate = new Date(v.visited_at).toISOString().split('T')[0]
        return visitDate === dateStr
      })

      const uniqueIps = new Set(dayVisits.map(v => v.ip_address))

      dailyStats.push({
        date: dateStr,
        unique: uniqueIps.size,
        total: dayVisits.length
      })
    }

    return NextResponse.json({
      totalUniqueVisitors: totalUniqueIps.size,
      totalVisits: filteredTotal.length,
      todayUniqueVisitors: todayUniqueIps.size,
      todayTotalVisits: filteredToday.length,
      yesterdayUniqueVisitors: yesterdayUniqueIps.size,
      yesterdayTotalVisits: filteredYesterday.length,
      dailyStats
    })

  } catch (error) {
    console.error('Erreur récupération stats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
