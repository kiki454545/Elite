import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Plages IP des services cloud (bots)
const BOT_IP_RANGES = [
  { start: '3.0.0.0', end: '3.255.255.255' },
  { start: '13.52.0.0', end: '13.57.255.255' },
  { start: '18.144.0.0', end: '18.144.255.255' },
  { start: '52.0.0.0', end: '52.255.255.255' },
  { start: '54.0.0.0', end: '54.255.255.255' },
  { start: '64.23.0.0', end: '64.23.255.255' },
  { start: '143.110.0.0', end: '143.110.255.255' },
  { start: '143.198.0.0', end: '143.198.255.255' },
  { start: '146.190.0.0', end: '146.190.255.255' },
  { start: '147.182.0.0', end: '147.182.255.255' },
  { start: '164.90.0.0', end: '164.92.255.255' },
  { start: '165.232.0.0', end: '165.232.255.255' },
  { start: '137.184.0.0', end: '137.184.255.255' },
  { start: '24.199.0.0', end: '24.199.255.255' },
  { start: '34.0.0.0', end: '34.255.255.255' },
  { start: '35.0.0.0', end: '35.255.255.255' },
  { start: '40.0.0.0', end: '40.127.255.255' },
  { start: '104.40.0.0', end: '104.47.255.255' },
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
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') return true
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return false
  for (const range of BOT_IP_RANGES) {
    if (isIpInRange(ip, range.start, range.end)) return true
  }
  return false
}

// Parser le user-agent pour extraire appareil et navigateur
function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  const uaLower = ua.toLowerCase()

  // Appareil
  let device = 'Desktop'
  if (uaLower.includes('mobile') || uaLower.includes('android') || uaLower.includes('iphone')) {
    device = 'Mobile'
  } else if (uaLower.includes('tablet') || uaLower.includes('ipad')) {
    device = 'Tablet'
  }

  // Navigateur
  let browser = 'Autre'
  if (uaLower.includes('chrome') && !uaLower.includes('edg')) browser = 'Chrome'
  else if (uaLower.includes('safari') && !uaLower.includes('chrome')) browser = 'Safari'
  else if (uaLower.includes('firefox')) browser = 'Firefox'
  else if (uaLower.includes('edg')) browser = 'Edge'
  else if (uaLower.includes('opera') || uaLower.includes('opr')) browser = 'Opera'

  // OS
  let os = 'Autre'
  if (uaLower.includes('windows')) os = 'Windows'
  else if (uaLower.includes('mac os') || uaLower.includes('macos')) os = 'MacOS'
  else if (uaLower.includes('linux') && !uaLower.includes('android')) os = 'Linux'
  else if (uaLower.includes('android')) os = 'Android'
  else if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ios')) os = 'iOS'

  return { device, browser, os }
}

// Anonymiser partiellement l'IP (pour la vie privée)
function anonymizeIp(ip: string): string {
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.***`
  }
  return ip.substring(0, ip.length - 3) + '***'
}

// Extraire la source du referrer
function parseReferrer(referrer: string): string {
  if (!referrer || referrer === '') return 'Direct'

  try {
    const url = new URL(referrer)
    const hostname = url.hostname.toLowerCase()

    if (hostname.includes('google')) return 'Google'
    if (hostname.includes('bing')) return 'Bing'
    if (hostname.includes('yahoo')) return 'Yahoo'
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'Facebook'
    if (hostname.includes('instagram')) return 'Instagram'
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'X/Twitter'
    if (hostname.includes('tiktok')) return 'TikTok'
    if (hostname.includes('reddit')) return 'Reddit'
    if (hostname.includes('youtube')) return 'YouTube'
    if (hostname.includes('linkedin')) return 'LinkedIn'

    return hostname
  } catch {
    return referrer.substring(0, 30)
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Vérifier l'authentification admin
    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer le paramètre date
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json({ error: 'Date requise' }, { status: 400 })
    }

    // Calculer les bornes de la journée
    const startDate = new Date(dateParam)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)

    // Récupérer toutes les visites de ce jour
    const { data: visits, error: visitsError } = await supabase
      .from('visitor_stats')
      .select('*')
      .gte('visited_at', startDate.toISOString())
      .lt('visited_at', endDate.toISOString())
      .order('visited_at', { ascending: true })

    if (visitsError) {
      throw visitsError
    }

    // Filtrer les bots
    const realVisits = (visits || []).filter(v => !isBotIp(v.ip_address))

    // Grouper par IP pour créer des "sessions"
    const visitorMap = new Map<string, {
      ip: string
      ipAnonymized: string
      firstVisit: string
      lastVisit: string
      pages: { path: string; time: string }[]
      userAgent: string
      device: string
      browser: string
      os: string
      referrer: string
      source: string
      totalPageViews: number
    }>()

    for (const visit of realVisits) {
      const ip = visit.ip_address

      if (!visitorMap.has(ip)) {
        const parsed = parseUserAgent(visit.user_agent || '')
        visitorMap.set(ip, {
          ip: ip,
          ipAnonymized: anonymizeIp(ip),
          firstVisit: visit.visited_at,
          lastVisit: visit.visited_at,
          pages: [],
          userAgent: visit.user_agent || '',
          device: parsed.device,
          browser: parsed.browser,
          os: parsed.os,
          referrer: visit.referrer || '',
          source: parseReferrer(visit.referrer || ''),
          totalPageViews: 0
        })
      }

      const visitor = visitorMap.get(ip)!
      visitor.pages.push({
        path: visit.page_path || '/',
        time: visit.visited_at
      })
      visitor.lastVisit = visit.visited_at
      visitor.totalPageViews++
    }

    // Chercher l'historique complet de chaque IP (toutes les visites passées)
    const ips = Array.from(visitorMap.keys())

    // Récupérer TOUTES les visites de ces IPs (historique complet)
    const { data: allVisitsForIps, error: historyError } = await supabase
      .from('visitor_stats')
      .select('*')
      .in('ip_address', ips)
      .order('visited_at', { ascending: false })

    if (historyError) {
      console.error('Erreur historique:', historyError)
    }

    // Grouper l'historique par IP
    const ipHistoryMap = new Map<string, {
      date: string
      visits: number
      pages: string[]
    }[]>()

    for (const visit of (allVisitsForIps || [])) {
      const ip = visit.ip_address
      const visitDate = new Date(visit.visited_at).toISOString().split('T')[0]

      if (!ipHistoryMap.has(ip)) {
        ipHistoryMap.set(ip, [])
      }

      const history = ipHistoryMap.get(ip)!
      const existingDay = history.find(h => h.date === visitDate)

      if (existingDay) {
        existingDay.visits++
        if (!existingDay.pages.includes(visit.page_path || '/')) {
          existingDay.pages.push(visit.page_path || '/')
        }
      } else {
        history.push({
          date: visitDate,
          visits: 1,
          pages: [visit.page_path || '/']
        })
      }
    }

    const visitors = Array.from(visitorMap.values()).map(v => ({
      ...v,
      ip: v.ip,
      hasAccount: false,
      username: null,
      // Ajouter l'historique complet de cette IP
      visitHistory: ipHistoryMap.get(v.ip) || [],
      totalVisitsAllTime: (ipHistoryMap.get(v.ip) || []).reduce((sum, day) => sum + day.visits, 0),
      firstEverVisit: (allVisitsForIps || [])
        .filter(visit => visit.ip_address === v.ip)
        .sort((a, b) => new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime())[0]?.visited_at || v.firstVisit
    }))

    // Trier par première visite (plus récent en premier)
    visitors.sort((a, b) => new Date(b.firstVisit).getTime() - new Date(a.firstVisit).getTime())

    return NextResponse.json({
      date: dateParam,
      totalUniqueVisitors: visitors.length,
      totalPageViews: realVisits.length,
      visitors
    })

  } catch (error) {
    console.error('Erreur récupération visiteurs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
