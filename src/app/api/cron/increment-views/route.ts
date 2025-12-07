import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  // Vérifier que l'appel vient de Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    // Récupérer toutes les annonces approuvées avec pagination
    const batchSize = 1000
    let from = 0
    let hasMore = true
    let totalUpdated = 0

    while (hasMore) {
      const { data: ads, error } = await supabaseAdmin
        .from('ads')
        .select('id, views')
        .eq('status', 'approved')
        .range(from, from + batchSize - 1)

      if (error) {
        console.error('Error fetching ads:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!ads || ads.length === 0) {
        hasMore = false
        break
      }

      // Mettre à jour chaque annonce avec un nombre aléatoire de vues (20-100)
      for (const ad of ads) {
        const randomViews = Math.floor(Math.random() * (100 - 20 + 1)) + 20
        const newViews = (ad.views || 0) + randomViews

        await supabaseAdmin
          .from('ads')
          .update({ views: newViews })
          .eq('id', ad.id)

        totalUpdated++
      }

      hasMore = ads.length === batchSize
      from += batchSize
    }

    console.log(`Increment views cron: Updated ${totalUpdated} ads`)

    return NextResponse.json({
      success: true,
      message: `Updated ${totalUpdated} ads with random views (20-100)`
    })

  } catch (error: any) {
    console.error('Increment views cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
