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

const PASSWORD = 'aaaaaa'
const EMAIL_PREFIX = 'escorte'
const EMAIL_DOMAIN = '@gmail.com'

async function getNextEmailNumber(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

  let maxNumber = 0
  const emailRegex = new RegExp(`^${EMAIL_PREFIX}(\\d+)${EMAIL_DOMAIN.replace('.', '\\.')}$`, 'i')

  for (const user of users?.users || []) {
    const match = user.email?.match(emailRegex)
    if (match) {
      const num = parseInt(match[1])
      if (num > maxNumber) maxNumber = num
    }
  }

  return maxNumber + 1
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

    const { data, description, photos, sourceUrl } = await request.json()

    if (!data || !data.username) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // 1. Trouver le prochain numéro d'email
    const nextNumber = await getNextEmailNumber(supabaseAdmin)
    const email = `${EMAIL_PREFIX}${nextNumber}${EMAIL_DOMAIN}`

    // 2. Créer le compte
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: PASSWORD,
      email_confirm: true
    })

    if (createError) {
      return NextResponse.json({ error: `Erreur création compte: ${createError.message}` }, { status: 500 })
    }

    const userId = newUser.user.id

    // 3. Créer le profil
    const profileData = {
      id: userId,
      email: email,
      username: data.username,
      age: data.age || 25,
      gender: data.gender || 'female',
      nationality: data.nationality || 'FR',
      height: data.height || 165,
      weight: data.weight || 55,
      measurements: data.measurements || '90-60-90',
      languages: data.languages || ['french'],
      interested_in: ['men'],
      verified: false,
      rank: 'standard',
      elite_coins: 0
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData)

    if (profileError) {
      // Supprimer le compte créé si erreur
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: `Erreur profil: ${profileError.message}` }, { status: 500 })
    }

    // 4. Créer l'annonce
    const adRecord = {
      user_id: userId,
      title: data.username,
      description: description || '',
      location: data.location || 'France',
      country: data.country || 'FR',
      categories: ['escort'],
      services: [],
      photos: photos && photos.length > 0 ? photos : ['https://upfsgpzcvdvtuygwaizd.supabase.co/storage/v1/object/public/ad-photos/placeholder.jpg'],
      video_url: null,
      phone_number: data.phone || '',
      has_whatsapp: data.hasWhatsapp || false,
      has_telegram: false,
      accepts_calls: data.acceptsCalls !== false,
      accepts_sms: data.acceptsSMS !== false,
      available24_7: data.available247 !== false,
      availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      availability_hours: '00:00 - 23:59',
      incall: data.incall !== false,
      outcall: data.outcall || false,
      views: 0,
      weekly_views: 0,
      favorites_count: 0,
      status: 'approved',
      source_url: sourceUrl || null
    }

    const { data: ad, error: adError } = await supabaseAdmin
      .from('ads')
      .insert(adRecord)
      .select()
      .single()

    if (adError) {
      // Cleanup
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: `Erreur annonce: ${adError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      email,
      password: PASSWORD,
      userId,
      adId: ad.id,
      adUrl: `https://www.sexelite.eu/ads/${ad.id}`
    })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
