import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addArrondissement() {
  try {
    console.log('🏙️ Ajout du support des arrondissements parisiens...\n')

    console.log('📝 Exécutez cette requête SQL dans Supabase Dashboard > SQL Editor:\n')
    console.log(`
-- Ajouter la colonne arrondissement à la table ads
ALTER TABLE ads
ADD COLUMN IF NOT EXISTS arrondissement TEXT;

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_ads_arrondissement ON ads(arrondissement);

-- Ajouter également à la table profiles (optionnel)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS arrondissement TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_arrondissement ON profiles(arrondissement);
`)

    console.log('✅ Instructions affichées!')
    console.log('\n📋 Résumé:')
    console.log('   - Colonne arrondissement ajoutée pour les annonces à Paris')
    console.log('   - Index créés pour optimiser les recherches')
    console.log('   - Format attendu: "1er", "2ème", "3ème", ..., "20ème"')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

addArrondissement()
