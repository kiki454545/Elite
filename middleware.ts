import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialiser Supabase avec la clé anon (pour is_ip_banned qui est public)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function middleware(request: NextRequest) {
  // Récupérer l'adresse IP du client
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             request.ip ||
             '127.0.0.1'

  // Ne pas vérifier les IPs pour les routes statiques et API internes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  try {
    // Créer un client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Vérifier si l'IP est bannie
    const { data, error } = await supabase.rpc('is_ip_banned', {
      check_ip: ip
    })

    if (error) {
      console.error('Erreur lors de la vérification de l\'IP:', error)
      return NextResponse.next()
    }

    // Si l'IP est bannie, rediriger vers une page de blocage
    if (data && data.is_banned) {
      // Créer une page de blocage personnalisée
      const blockedUrl = new URL('/blocked', request.url)
      blockedUrl.searchParams.set('reason', data.reason || 'Accès refusé')

      if (data.banned_until) {
        const bannedUntil = new Date(data.banned_until)
        blockedUrl.searchParams.set('until', bannedUntil.toISOString())
      }

      return NextResponse.redirect(blockedUrl)
    }
  } catch (error) {
    console.error('Erreur middleware IP ban:', error)
  }

  return NextResponse.next()
}

// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - api (API routes)
     * - _next/static (fichiers statiques)
     * - _next/image (fichiers d'images optimisés)
     * - favicon.ico (favicon)
     * - blocked (page de blocage elle-même)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|blocked).*)',
  ],
}
