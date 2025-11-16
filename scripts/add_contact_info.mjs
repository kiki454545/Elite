import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addContactInfoColumn() {
  try {
    console.log('🔧 Ajout de la colonne contact_info à la table ads...')

    // Note: On ne peut pas exécuter de SQL brut via le client Supabase JS sans privilèges admin
    // Vous devez exécuter cette requête directement dans le SQL Editor de Supabase:
    const sqlQuery = `
-- Ajouter la colonne contact_info si elle n'existe pas
ALTER TABLE ads
ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}'::jsonb;

-- Ajouter un commentaire pour contact_info
COMMENT ON COLUMN ads.contact_info IS 'Informations de contact et disponibilités: {phone, whatsapp, telegram, email, acceptsSMS, availability: {available247, days, hours}}';

-- Ajouter aussi les colonnes pour les nouvelles propriétés
ALTER TABLE ads
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';

ALTER TABLE ads
ADD COLUMN IF NOT EXISTS accepts_couples BOOLEAN DEFAULT false;

ALTER TABLE ads
ADD COLUMN IF NOT EXISTS outcall BOOLEAN DEFAULT false;

ALTER TABLE ads
ADD COLUMN IF NOT EXISTS incall BOOLEAN DEFAULT false;

ALTER TABLE ads
ADD COLUMN IF NOT EXISTS physical_attributes JSONB DEFAULT '{}'::jsonb;

-- Commentaires
COMMENT ON COLUMN ads.languages IS 'Langues parlées';
COMMENT ON COLUMN ads.accepts_couples IS 'Accepte les couples';
COMMENT ON COLUMN ads.outcall IS 'Se déplace';
COMMENT ON COLUMN ads.incall IS 'Reçoit à domicile';
COMMENT ON COLUMN ads.physical_attributes IS 'Attributs physiques: {height, weight, measurements, cupSize, hairColor, eyeColor, ethnicity, bodyType, tattoos, piercings}';
`

    console.log('\n📋 Veuillez exécuter la requête SQL suivante dans le SQL Editor de Supabase:')
    console.log('='.repeat(80))
    console.log(sqlQuery)
    console.log('='.repeat(80))

    console.log('\n✅ Une fois la requête exécutée, la colonne contact_info sera disponible!')

  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

addContactInfoColumn()
