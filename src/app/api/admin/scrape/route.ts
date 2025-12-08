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

    const { url } = await request.json()

    if (!url || !url.includes('sexemodel.com')) {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
    }

    // Extraire le nom depuis l'URL
    // Format: /escort/NOM-ID/ ou /escort/NOM%20PRENOM-ID/
    const urlMatch = url.match(/\/escort\/(.+)-(\d+)\/?/i)
    let username = 'Inconnu'
    if (urlMatch) {
      username = decodeURIComponent(urlMatch[1])
        .replace(/_/g, ' ')
        .replace(/%20/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      // Capitaliser chaque mot
      username = username.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }

    // Scraper la page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9'
      }
    })

    if (!response.ok) {
      return NextResponse.json({
        error: `Impossible de charger la page (${response.status})`,
        data: { username, needsManualInput: true }
      }, { status: 200 })
    }

    const html = await response.text()

    // Extraire l'âge
    let age = 25
    const agePatterns = [/(\d{2})\s*ans/i, /"age"[:\s]*(\d{2})/i, /age["\s:]+(\d{2})/i]
    for (const pattern of agePatterns) {
      const match = html.match(pattern)
      if (match && parseInt(match[1]) >= 18 && parseInt(match[1]) <= 60) {
        age = parseInt(match[1])
        break
      }
    }

    // Extraire la ville depuis "Ville de base:"
    // Format: <span class="label">Ville de base:</span><span class="content"><a href="/escorts/cannes/">Cannes</a></span>
    let location = 'France'

    // Chercher le pattern "Ville de base" suivi du lien (avec spans entre)
    const villeBaseMatch = html.match(/Ville de base[:\s]*<\/span>\s*<span[^>]*>\s*<a[^>]*>([^<]+)<\/a>/i)
    if (villeBaseMatch && villeBaseMatch[1]) {
      const rawCity = villeBaseMatch[1].trim()

      // Capitaliser correctement (gérer les tirets comme Aix-en-Provence)
      if (rawCity.includes('-')) {
        location = rawCity
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('-')
      } else {
        location = rawCity
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      }
    }

    // Extraire le téléphone - patterns plus complets
    let phone = ''
    const phonePatterns = [
      /tel:(\d{10})/i,
      /tel:\+33(\d{9})/i,
      /href="tel:([^"]+)"/i,
      /0[67][\s.-]*\d{2}[\s.-]*\d{2}[\s.-]*\d{2}[\s.-]*\d{2}/g,
      /\+33[\s.-]*[67][\s.-]*\d{2}[\s.-]*\d{2}[\s.-]*\d{2}[\s.-]*\d{2}/g,
      /0[67]\d{8}/g,
      /\+33[67]\d{8}/g
    ]
    for (const pattern of phonePatterns) {
      const match = html.match(pattern)
      if (match) {
        let rawPhone = Array.isArray(match) ? match[0] : match[1] || match[0]
        // Nettoyer le numéro
        rawPhone = rawPhone
          .replace(/href="tel:/i, '')
          .replace(/"/g, '')
          .replace(/tel:/i, '')
          .replace(/[\s.\-()]/g, '')
          .replace(/^\+33/, '0')

        // S'assurer que c'est un numéro français valide
        if (rawPhone.length === 9 && !rawPhone.startsWith('0')) {
          rawPhone = '0' + rawPhone
        }
        if (rawPhone.length === 10 && /^0[67]/.test(rawPhone)) {
          phone = rawPhone
          break
        }
      }
    }

    // WhatsApp
    const hasWhatsapp = /whatsapp/i.test(html)

    // Taille
    let height = 165
    const heightMatch = html.match(/(\d{3})\s*cm/i)
    if (heightMatch && parseInt(heightMatch[1]) >= 140 && parseInt(heightMatch[1]) <= 200) {
      height = parseInt(heightMatch[1])
    }

    // Poids
    let weight = 55
    const weightMatch = html.match(/(\d{2,3})\s*kg/i)
    if (weightMatch && parseInt(weightMatch[1]) >= 40 && parseInt(weightMatch[1]) <= 120) {
      weight = parseInt(weightMatch[1])
    }

    // Mensurations
    let measurements = '90-60-90'
    const measurementsMatch = html.match(/(\d{2,3})[- ](\d{2,3})[- ](\d{2,3})/)
    if (measurementsMatch) {
      measurements = `${measurementsMatch[1]}-${measurementsMatch[2]}-${measurementsMatch[3]}`
    }

    // Disponibilité 24/7
    const available247 = /24\s*[\/h]\s*7|24h|24\/24/i.test(html)

    // Incall/Outcall
    const incall = /(?:reçois|incall|chez moi|appartement|studio)/i.test(html)
    const outcall = /(?:déplace|outcall|déplacement|hôtel|domicile)/i.test(html)

    // Ethnie
    let ethnicity = 'caucasienne'
    if (/métisse|metisse/i.test(html)) ethnicity = 'metisse'
    else if (/africaine|black|ébène/i.test(html)) ethnicity = 'africaine'
    else if (/asiatique|asian|chinoise|japonaise/i.test(html)) ethnicity = 'asiatique'
    else if (/latine|latina|brésilienne/i.test(html)) ethnicity = 'latine'
    else if (/arabe|maghrébine|orientale/i.test(html)) ethnicity = 'arabe'

    // Couleur cheveux
    let hairColor = 'brune'
    if (/blonde/i.test(html)) hairColor = 'blonde'
    else if (/rousse/i.test(html)) hairColor = 'rousse'
    else if (/châtain|chatain/i.test(html)) hairColor = 'chatain'
    else if (/noire|noir/i.test(html) && !/peau noire/i.test(html)) hairColor = 'noire'

    // Couleur yeux
    let eyeColor = 'marrons'
    if (/yeux\s*(bleus|bleu)/i.test(html)) eyeColor = 'bleus'
    else if (/yeux\s*(verts|vert)/i.test(html)) eyeColor = 'verts'
    else if (/yeux\s*(noirs|noir)/i.test(html)) eyeColor = 'noirs'
    else if (/yeux\s*(gris)/i.test(html)) eyeColor = 'gris'
    else if (/yeux\s*(noisette)/i.test(html)) eyeColor = 'noisette'

    // Vérifier si le numéro de téléphone existe déjà
    let phoneExists = false
    let existingAdUrl = null
    if (phone) {
      // Chercher avec le format 0XXXXXXXXX
      const { data: existingAd } = await supabaseAdmin
        .from('ads')
        .select('id, title')
        .eq('phone_number', phone)
        .single()

      if (existingAd) {
        phoneExists = true
        existingAdUrl = `https://www.sexelite.eu/ads/${existingAd.id}`
      } else {
        // Chercher aussi avec le format +33XXXXXXXXX
        const phoneWithPrefix = '+33' + phone.substring(1)
        const { data: existingAdWithPrefix } = await supabaseAdmin
          .from('ads')
          .select('id, title')
          .eq('phone_number', phoneWithPrefix)
          .single()

        if (existingAdWithPrefix) {
          phoneExists = true
          existingAdUrl = `https://www.sexelite.eu/ads/${existingAdWithPrefix.id}`
        }
      }

      console.log('📞 Phone check:', phone, '-> exists:', phoneExists)
    }

    return NextResponse.json({
      success: true,
      data: {
        username,
        age,
        location,
        country: 'FR',
        phone,
        hasWhatsapp,
        acceptsCalls: true,
        acceptsSMS: true,
        gender: 'female',
        ethnicity,
        height,
        weight,
        hairColor,
        eyeColor,
        measurements,
        nationality: 'FR',
        languages: ['french'],
        available247: available247 || true,
        incall: incall || true,
        outcall: outcall || false
      },
      phoneExists,
      existingAdUrl
    })

  } catch (error: any) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
