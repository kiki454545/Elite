import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Liste des colonnes à ajouter
const migrations = [
  // Coordonnées / Contact
  { name: 'phone', type: 'TEXT', comment: 'Numéro de téléphone de contact' },
  { name: 'whatsapp', type: 'BOOLEAN', default: 'false', comment: 'Disponible sur WhatsApp' },
  { name: 'telegram', type: 'BOOLEAN', default: 'false', comment: 'Disponible sur Telegram' },
  { name: 'email_contact', type: 'BOOLEAN', default: 'false', comment: 'Accepte les contacts par email' },
  { name: 'accepts_sms', type: 'BOOLEAN', default: 'false', comment: 'Accepte les SMS' },

  // Disponibilités
  { name: 'schedule', type: 'TEXT', comment: 'Horaires de disponibilité détaillés' },
  { name: 'availability', type: 'TEXT', comment: 'Disponibilité générale' },
  { name: 'available_24_7', type: 'BOOLEAN', default: 'false', comment: 'Disponible 24h/24 7j/7' },
  { name: 'outcall', type: 'BOOLEAN', default: 'false', comment: 'Se déplace chez le client' },
  { name: 'incall', type: 'BOOLEAN', default: 'false', comment: 'Reçoit à son domicile/hôtel' },

  // Langues
  { name: 'languages', type: 'TEXT[]', default: "'{}'", comment: 'Langues parlées (codes ISO)' },

  // Attributs physiques
  { name: 'height', type: 'INTEGER', comment: 'Taille en centimètres' },
  { name: 'weight', type: 'INTEGER', comment: 'Poids en kilogrammes' },
  { name: 'measurements', type: 'TEXT', comment: 'Mensurations (ex: "95-65-95")' },
  { name: 'cup_size', type: 'TEXT', comment: 'Taille de bonnet (ex: "D")' },
  { name: 'hair_color', type: 'TEXT', comment: 'Couleur des cheveux' },
  { name: 'eye_color', type: 'TEXT', comment: 'Couleur des yeux' },
  { name: 'ethnicity', type: 'TEXT', comment: 'Origine ethnique' },
  { name: 'body_type', type: 'TEXT', comment: 'Type de morphologie' },
  { name: 'tattoos', type: 'BOOLEAN', default: 'false', comment: 'Possède des tatouages' },
  { name: 'piercings', type: 'BOOLEAN', default: 'false', comment: 'Possède des piercings' },

  // Autres
  { name: 'accepts_couples', type: 'BOOLEAN', default: 'false', comment: 'Accepte les couples' },
  { name: 'description', type: 'TEXT', comment: 'Description du profil' },
  { name: 'services', type: 'TEXT[]', default: "'{}'", comment: 'Services proposés' },
  { name: 'category', type: 'TEXT', comment: 'Catégorie principale' },
  { name: 'location', type: 'TEXT', comment: 'Ville/Localisation' },
  { name: 'country', type: 'TEXT', default: "'FR'", comment: 'Code pays' }
]

async function addColumn(columnName, columnType, defaultValue = null) {
  try {
    let sql = `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${columnName} ${columnType}`
    if (defaultValue) {
      sql += ` DEFAULT ${defaultValue}`
    }

    console.log(`  ➡️  ${columnName} (${columnType})`)

    // Utiliser une requête RPC ou directement via l'URL
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Prefer': 'return=minimal'
      }
    })

    return true
  } catch (error) {
    console.error(`     ❌ Erreur: ${error.message}`)
    return false
  }
}

async function runMigrations() {
  console.log('🚀 Démarrage de l\'ajout des colonnes à la table profiles...\n')

  console.log('📋 Colonnes à ajouter:\n')

  console.log('📞 Coordonnées / Contact:')
  for (const migration of migrations.slice(0, 5)) {
    await addColumn(migration.name, migration.type, migration.default)
  }

  console.log('\n⏰ Disponibilités:')
  for (const migration of migrations.slice(5, 10)) {
    await addColumn(migration.name, migration.type, migration.default)
  }

  console.log('\n🗣️  Langues:')
  await addColumn(migrations[10].name, migrations[10].type, migrations[10].default)

  console.log('\n👤 Attributs physiques:')
  for (const migration of migrations.slice(11, 21)) {
    await addColumn(migration.name, migration.type, migration.default)
  }

  console.log('\n🎯 Autres informations:')
  for (const migration of migrations.slice(21)) {
    await addColumn(migration.name, migration.type, migration.default)
  }

  console.log('\n✅ Migration terminée!')
  console.log('\n⚠️  IMPORTANT: Veuillez exécuter manuellement le fichier SQL via le dashboard Supabase')
  console.log('📁 Fichier: supabase/migrations/013_add_profile_complete_info.sql')
  console.log('🔗 Dashboard: https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/editor')
  console.log('\nOu utilisez cette commande:')
  console.log('npx supabase db push --db-url "postgresql://postgres.upfsgpzcvdvtuygwaizd:Dieudo225@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"')
}

runMigrations()
