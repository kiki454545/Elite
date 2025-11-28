import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalider toutes les heures

export async function GET() {
  const baseUrl = 'https://www.sexelite.eu'

  // Pages statiques
  const staticPages = [
    { url: baseUrl, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/search`, priority: '0.9', changefreq: 'hourly' },
    { url: `${baseUrl}/top-week`, priority: '0.9', changefreq: 'daily' },
    { url: `${baseUrl}/premium`, priority: '0.8', changefreq: 'weekly' },
    { url: `${baseUrl}/auth`, priority: '0.7', changefreq: 'monthly' },
    { url: `${baseUrl}/shop`, priority: '0.6', changefreq: 'monthly' },
    { url: `${baseUrl}/terms`, priority: '0.4', changefreq: 'monthly' },
    { url: `${baseUrl}/privacy`, priority: '0.4', changefreq: 'monthly' },
    { url: `${baseUrl}/cookies`, priority: '0.3', changefreq: 'monthly' },
  ]

  let adPages: { url: string; lastmod: string; priority: string; changefreq: string }[] = []

  // Récupérer les annonces depuis Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: ads } = await supabase
        .from('ads')
        .select('id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1000)

      if (ads) {
        adPages = ads.map((ad) => ({
          url: `${baseUrl}/ads/${ad.id}`,
          lastmod: new Date(ad.updated_at).toISOString().split('T')[0],
          priority: '0.8',
          changefreq: 'daily'
        }))
      }
    }
  } catch (error) {
    console.error('Erreur récupération annonces pour sitemap:', error)
  }

  const today = new Date().toISOString().split('T')[0]

  // Générer le XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${adPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
