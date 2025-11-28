const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://upfsgpzcvdvtuygwaizd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU'
)

const START_NUMBER = 67 // Commence après escorte66
const TOTAL_PROFILES = 2749
const PASSWORD = 'aaaaaa'
const BATCH_SIZE = 50 // Créer par lots pour éviter les timeouts

// Prénoms latinos féminins
const LATINA_NAMES = [
  'Sofia', 'Valentina', 'Isabella', 'Camila', 'Valeria', 'Mariana', 'Gabriela', 'Daniela',
  'Luciana', 'Victoria', 'Antonella', 'Fernanda', 'Paula', 'Natalia', 'Andrea', 'Carolina',
  'Maria', 'Ana', 'Lucia', 'Elena', 'Carmen', 'Rosa', 'Alejandra', 'Patricia', 'Monica',
  'Adriana', 'Diana', 'Laura', 'Sandra', 'Claudia', 'Veronica', 'Silvia', 'Teresa',
  'Beatriz', 'Rocio', 'Paola', 'Esmeralda', 'Xiomara', 'Yamileth', 'Kiara', 'Marisol',
  'Paloma', 'Esperanza', 'Dulce', 'Alondra', 'Estrella', 'Cielo', 'Luna', 'Sol',
  'Catalina', 'Renata', 'Regina', 'Jimena', 'Ximena', 'Abril', 'Emilia', 'Martina',
  'Julieta', 'Florencia', 'Agustina', 'Milagros', 'Celeste', 'Luz', 'Pilar', 'Consuelo',
  'Mercedes', 'Dolores', 'Guadalupe', 'Lorena', 'Susana', 'Gloria', 'Blanca', 'Alma',
  'Jade', 'Coral', 'Perla', 'Ruby', 'Estefania', 'Stephanie', 'Jessica', 'Jennifer',
  'Melissa', 'Vanessa', 'Karen', 'Karina', 'Marina', 'Selena', 'Shakira', 'Salma',
  'Penelope', 'Eva', 'Bianca', 'Giselle', 'Nicole', 'Michelle', 'Tiffany', 'Ashley',
  'Brenda', 'Wendy', 'Nancy', 'Cindy', 'Daisy', 'Jasmin', 'Lina', 'Nina', 'Mia',
  'Zoe', 'Chloe', 'Emma', 'Olivia', 'Ava', 'Sophia', 'Amelia', 'Mila', 'Aria',
  'Scarlett', 'Aurora', 'Violet', 'Ivy', 'Hazel', 'Lily', 'Nora', 'Zoey', 'Leila',
  'Ariana', 'Eliana', 'Tatiana', 'Juliana', 'Viviana', 'Adriana', 'Liliana', 'Mariam',
  'Yara', 'Lara', 'Sara', 'Mara', 'Clara', 'Dara', 'Zara', 'Amara', 'Samara',
  'Xiomara', 'Barbara', 'Tamara', 'Sahara', 'Kiara', 'Tiara', 'Ciara', 'Sierra',
  'Tierra', 'Brianna', 'Arianna', 'Gianna', 'Sienna', 'Vienna', 'Jenna', 'Kenna',
  'Alicia', 'Felicia', 'Patricia', 'Leticia', 'Tricia', 'Priscilla', 'Camilla', 'Cecilia'
]

// Suffixes pour rendre les noms uniques
const SUFFIXES = ['', 'a', 'ita', 'ela', 'ina', 'ana', 'isa', 'esa', 'osa', 'ura']

function getRandomName(index) {
  const baseName = LATINA_NAMES[index % LATINA_NAMES.length]
  const suffixIndex = Math.floor(index / LATINA_NAMES.length) % SUFFIXES.length
  const suffix = SUFFIXES[suffixIndex]
  const number = Math.floor(index / (LATINA_NAMES.length * SUFFIXES.length))

  if (number === 0 && suffix === '') {
    return baseName
  } else if (number === 0) {
    return baseName + suffix
  } else {
    return baseName + (suffix || '') + number
  }
}

async function createProfiles() {
  console.log(`🚀 Création de ${TOTAL_PROFILES} profils vides avec prénoms latins...`)
  console.log(`📧 Format: escorte${START_NUMBER}@gmail.com à escorte${START_NUMBER + TOTAL_PROFILES - 1}@gmail.com`)
  console.log(`🔑 Mot de passe: ${PASSWORD}\n`)

  let created = 0
  let errors = 0

  for (let batch = 0; batch < Math.ceil(TOTAL_PROFILES / BATCH_SIZE); batch++) {
    const batchStart = batch * BATCH_SIZE
    const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_PROFILES)

    console.log(`📦 Lot ${batch + 1}/${Math.ceil(TOTAL_PROFILES / BATCH_SIZE)} (profils ${batchStart + 1} à ${batchEnd})...`)

    const promises = []

    for (let i = batchStart; i < batchEnd; i++) {
      const profileNumber = START_NUMBER + i
      const email = `escorte${profileNumber}@gmail.com`
      const username = getRandomName(i)

      promises.push(
        (async () => {
          try {
            // 1. Créer l'utilisateur auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: email,
              password: PASSWORD,
              email_confirm: true,
              user_metadata: { imported: true, empty_profile: true }
            })

            if (authError) {
              if (authError.message.includes('already been registered')) {
                return { success: false, skipped: true }
              }
              throw authError
            }

            const userId = authData.user.id

            // 2. Créer le profil avec username
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                username: username,
                email: email,
                gender: 'female',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (profileError) {
              throw profileError
            }

            return { success: true, email, username }
          } catch (err) {
            return { success: false, error: err.message, email }
          }
        })()
      )
    }

    const results = await Promise.all(promises)

    for (const result of results) {
      if (result.success) {
        created++
      } else if (result.skipped) {
        // Ignoré
      } else if (result.error) {
        errors++
        if (errors <= 5) {
          console.log(`   ❌ ${result.email}: ${result.error}`)
        }
      }
    }

    console.log(`   ✅ ${created} créés, ${errors} erreurs`)

    // Petite pause entre les lots
    if (batch < Math.ceil(TOTAL_PROFILES / BATCH_SIZE) - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log(`\n✨ Terminé!`)
  console.log(`📊 Résultat: ${created} profils créés, ${errors} erreurs`)
  console.log(`\n📋 Plage de comptes:`)
  console.log(`   Premier: escorte${START_NUMBER}@gmail.com`)
  console.log(`   Dernier: escorte${START_NUMBER + TOTAL_PROFILES - 1}@gmail.com`)
  console.log(`   Mot de passe: ${PASSWORD}`)
}

createProfiles()
