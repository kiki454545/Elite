import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMeetingAtEscort() {
  try {
    console.log('🔍 Vérification des annonces avec meeting_at_escort...\n')

    // Compter toutes les annonces
    const { count: totalCount } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('country', 'MT')

    console.log(`📊 Total d'annonces approuvées à Malte: ${totalCount}`)

    // Compter les annonces avec meeting_at_escort = true
    const { count: escortTrueCount } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('country', 'MT')
      .eq('meeting_at_escort', true)

    console.log(`✅ Annonces avec meeting_at_escort = true: ${escortTrueCount}`)

    // Compter les annonces avec meeting_at_escort = false
    const { count: escortFalseCount } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('country', 'MT')
      .eq('meeting_at_escort', false)

    console.log(`❌ Annonces avec meeting_at_escort = false: ${escortFalseCount}`)

    // Compter les annonces avec meeting_at_escort = null
    const { count: escortNullCount } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('country', 'MT')
      .is('meeting_at_escort', null)

    console.log(`⚠️  Annonces avec meeting_at_escort = null: ${escortNullCount}`)

    // Récupérer quelques exemples
    console.log('\n📋 Exemples d\'annonces (5 premières):')
    const { data: examples } = await supabase
      .from('ads')
      .select('id, title, meeting_at_home, meeting_at_hotel, meeting_in_car, meeting_at_escort')
      .eq('status', 'approved')
      .eq('country', 'MT')
      .limit(5)

    examples?.forEach((ad, i) => {
      console.log(`\n${i + 1}. ${ad.title || ad.id}`)
      console.log(`   - meeting_at_home: ${ad.meeting_at_home}`)
      console.log(`   - meeting_at_hotel: ${ad.meeting_at_hotel}`)
      console.log(`   - meeting_in_car: ${ad.meeting_in_car}`)
      console.log(`   - meeting_at_escort: ${ad.meeting_at_escort}`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkMeetingAtEscort()
