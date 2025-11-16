import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Données de démonstration réalistes
const DEMO_USER = {
  email: 'sophia.paris@gmail.com',
  password: 'Demo123456!',
  username: 'Sophia',
  age: 25,
  gender: 'female',
  nationality: 'FR'
}

const DEMO_AD = {
  description: `Bonjour, je m'appelle Sophia et je suis une accompagnatrice élégante et raffinée basée à Paris.

🌸 À propos de moi :
Je suis une jeune femme pétillante, cultivée et à l'écoute. J'adore les rencontres authentiques et les moments de complicité.

✨ Services :
- Dîner aux chandelles
- Accompagnement événements
- Moments de détente
- Massage relaxant

⏰ Disponibilités :
Du lundi au vendredi de 14h à 22h
Weekend sur rendez-vous

📍 Localisation :
Paris 8ème arrondissement
Déplacements possibles dans toute l'Île-de-France

💎 Discrétion et respect garantis

Au plaisir de vous rencontrer,
Sophia`,
  location: 'Paris',
  arrondissement: '8ème',
  country: 'FR',
  categories: ['escort'],
  meeting_places: ['Hôtel', 'Domicile'],
  price: 200,
  // URLs de photos de démonstration (Unsplash - photos libres de droits)
  // Ces photos sont génériques et ne représentent pas une personne réelle
  photos: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop'
  ]
}

async function createDemoAd() {
  try {
    console.log('🎭 Création d\'une annonce de démonstration...\n')

    // 1. Créer un compte utilisateur de démo
    console.log('👤 Création du compte utilisateur...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      options: {
        data: {
          username: DEMO_USER.username
        }
      }
    })

    if (authError) {
      // Si l'utilisateur existe déjà, on le récupère
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  Utilisateur déjà existant, récupération...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: DEMO_USER.email,
          password: DEMO_USER.password
        })

        if (signInError) throw signInError

        var userId = signInData.user.id
      } else {
        throw authError
      }
    } else {
      var userId = authData.user.id
    }

    console.log(`✅ Utilisateur créé/récupéré: ${userId}`)

    // 2. Vérifier/Créer le profil
    console.log('📋 Vérification du profil...')
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      console.log('📝 Création du profil...')
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: DEMO_USER.username,
          age: DEMO_USER.age,
          gender: DEMO_USER.gender,
          nationality: DEMO_USER.nationality,
          rank: 'vip', // Profil VIP pour la démo
          verified: true
        })

      if (profileError) throw profileError
      console.log('✅ Profil créé')
    } else {
      console.log('✅ Profil existant trouvé')
    }

    // 3. Obtenir les coordonnées GPS de Paris 8ème
    console.log('📍 Récupération des coordonnées...')
    const { data: cityData } = await supabase
      .from('french_cities')
      .select('latitude, longitude')
      .eq('name', 'Paris')
      .single()

    const latitude = cityData?.latitude || 48.8566
    const longitude = cityData?.longitude || 2.3522

    // 4. Créer l'annonce
    console.log('📢 Création de l\'annonce...')
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .insert({
        user_id: userId,
        title: DEMO_USER.username,
        description: DEMO_AD.description,
        location: DEMO_AD.location,
        arrondissement: DEMO_AD.arrondissement,
        country: DEMO_AD.country,
        categories: DEMO_AD.categories,
        meeting_places: DEMO_AD.meeting_places,
        price: DEMO_AD.price,
        photos: DEMO_AD.photos,
        latitude: latitude,
        longitude: longitude,
        status: 'approved',
        views: Math.floor(Math.random() * 500) + 100, // Vues aléatoires entre 100 et 600
        favorites_count: Math.floor(Math.random() * 50) + 10 // Favoris entre 10 et 60
      })
      .select()
      .single()

    if (adError) throw adError

    console.log('\n✨ SUCCÈS ! Annonce de démonstration créée\n')
    console.log('📊 Détails de l\'annonce :')
    console.log(`   ID: ${ad.id}`)
    console.log(`   Titre: ${DEMO_USER.username}`)
    console.log(`   Localisation: ${DEMO_AD.location} - ${DEMO_AD.arrondissement}`)
    console.log(`   Prix: ${DEMO_AD.price}€`)
    console.log(`   Vues: ${ad.views}`)
    console.log(`   Favoris: ${ad.favorites_count}`)
    console.log('\n🔑 Identifiants de connexion :')
    console.log(`   Email: ${DEMO_USER.email}`)
    console.log(`   Mot de passe: ${DEMO_USER.password}`)
    console.log('\n⚠️  IMPORTANT : Cette annonce utilise des photos de stock photo.')
    console.log('    Elle est uniquement à but de démonstration.\n')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

createDemoAd()
