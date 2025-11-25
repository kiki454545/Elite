import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nzrptauexzttqhmnhhgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cnB0YXVleHp0dHFobW5oaGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzQ4NTUsImV4cCI6MjA1ODQxMDg1NX0.lW0EVJUjTCPfkTIWQ6wMiJn4l3JDvXGmBTZJ2QjGXrk'
)

async function checkMeetingPlacesColumns() {
  try {
    console.log('🔍 Vérification des colonnes meeting places dans la table ads...\n')

    // Récupérer une annonce pour voir la structure
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erreur:', error)
      return
    }

    if (data && data.length > 0) {
      const ad = data[0]
      console.log('📊 Structure d\'une annonce:')
      console.log('Colonnes disponibles:', Object.keys(ad))
      console.log('\n🏠 Colonnes meeting places:')
      console.log('  meeting_at_home:', ad.meeting_at_home)
      console.log('  meeting_at_hotel:', ad.meeting_at_hotel)
      console.log('  meeting_in_car:', ad.meeting_in_car)
      console.log('  meeting_at_escort:', ad.meeting_at_escort)
    }

    // Compter les annonces avec au moins un meeting place à true
    const { data: withMeetingPlaces, error: countError } = await supabase
      .from('ads')
      .select('id')
      .or('meeting_at_home.eq.true,meeting_at_hotel.eq.true,meeting_in_car.eq.true,meeting_at_escort.eq.true')

    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError)
      return
    }

    console.log(`\n📈 Nombre d'annonces avec au moins un lieu de rendez-vous à true: ${withMeetingPlaces?.length || 0}`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkMeetingPlacesColumns()
