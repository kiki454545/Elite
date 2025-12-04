import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const today = new Date().toISOString().split('T')[0]

  // Pages statiques
  const staticPages = [
    { loc: 'https://www.sexelite.eu', changefreq: 'daily', priority: '1.0' },
    { loc: 'https://www.sexelite.eu/search', changefreq: 'hourly', priority: '0.9' },
    { loc: 'https://www.sexelite.eu/top-week', changefreq: 'daily', priority: '0.9' },
    { loc: 'https://www.sexelite.eu/premium', changefreq: 'weekly', priority: '0.8' },
    { loc: 'https://www.sexelite.eu/auth', changefreq: 'monthly', priority: '0.7' },
    { loc: 'https://www.sexelite.eu/shop', changefreq: 'monthly', priority: '0.6' },
    { loc: 'https://www.sexelite.eu/terms', changefreq: 'monthly', priority: '0.4' },
    { loc: 'https://www.sexelite.eu/privacy', changefreq: 'monthly', priority: '0.4' },
  ]

  // Récupérer toutes les annonces approuvées
  const { data: ads } = await supabase
    .from('ads')
    .select('id, updated_at')
    .eq('status', 'approved')
    .order('updated_at', { ascending: false })

  // Générer le XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  // Ajouter les pages statiques
  for (const page of staticPages) {
    xml += '  <url>\n'
    xml += `    <loc>${page.loc}</loc>\n`
    xml += `    <lastmod>${today}</lastmod>\n`
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += '  </url>\n'
  }

  // Ajouter les annonces
  if (ads) {
    for (const ad of ads) {
      const lastmod = ad.updated_at ? ad.updated_at.split('T')[0] : today
      xml += '  <url>\n'
      xml += `    <loc>https://www.sexelite.eu/ads/${ad.id}</loc>\n`
      xml += `    <lastmod>${lastmod}</lastmod>\n`
      xml += '    <changefreq>weekly</changefreq>\n'
      xml += '    <priority>0.8</priority>\n'
      xml += '  </url>\n'
    }
  }

  xml += '</urlset>'

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
