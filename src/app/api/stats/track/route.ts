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

// User-Agents de bots connus
const BOT_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python',
  'java', 'apache', 'http', 'node-fetch', 'axios', 'request',
  'googlebot', 'bingbot', 'yandex', 'baidu', 'duckduck', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'slackbot', 'telegrambot', 'whatsapp',
  'pingdom', 'uptimerobot', 'statuscake', 'gtmetrix', 'pagespeed',
  'lighthouse', 'headless', 'phantom', 'selenium', 'puppeteer', 'playwright'
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

function isBotUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  return BOT_USER_AGENTS.some(bot => ua.includes(bot))
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer l'IP depuis les headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

    const userAgent = request.headers.get('user-agent') || ''

    const body = await request.json().catch(() => ({}))
    const pagePath = body.path || '/'
    // Utiliser le referrer envoyé par le client (plus fiable que le header HTTP)
    const referer = body.referrer || request.headers.get('referer') || ''
    const fullUrl = body.fullUrl || ''

    // Filtrer les bots - ne pas enregistrer leur visite
    if (isBotIp(ip) || isBotUserAgent(userAgent)) {
      return NextResponse.json({ success: true, filtered: true })
    }

    // Enregistrer la visite (uniquement les vrais visiteurs)
    // Note: full_url est optionnel, si la colonne n'existe pas dans la table, on l'ignore
    const insertData: Record<string, any> = {
      ip_address: ip,
      user_agent: userAgent,
      page_path: pagePath,
      referrer: referer,
      visited_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('visitor_stats')
      .insert(insertData)

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
