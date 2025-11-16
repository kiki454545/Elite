import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration Supabase
const supabaseUrl = 'https://upfsgpzcvdvtuygwaizd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjUxMDksImV4cCI6MjA3ODU0MTEwOX0.4mnnD7pEG0mXmxCMdnnJMV0RocP8d7UIfxWFQu9Jwy0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runMigrations() {
  try {
    console.log('🚀 Exécution des migrations SQL...\n')

    // Migration 1: Languages
    console.log('📝 Migration 1: Ajout de la colonne languages')
    const languagesSql = readFileSync(resolve(__dirname, 'add_languages_column.sql'), 'utf-8')

    // Migration 2: Availability
    console.log('📝 Migration 2: Ajout de la colonne availability')
    const availabilitySql = readFileSync(resolve(__dirname, 'add_availability_column.sql'), 'utf-8')

    // Migration 3: Available 24/7
    console.log('📝 Migration 3: Ajout de la colonne available24_7')
    const available24_7Sql = readFileSync(resolve(__dirname, 'add_available24_7_column.sql'), 'utf-8')

    // Migration 4: Contact columns
    console.log('📝 Migration 4: Ajout des colonnes de contact')
    const contactSql = readFileSync(resolve(__dirname, 'add_contact_columns.sql'), 'utf-8')

    console.log('\n⚠️  ATTENTION: Ces migrations doivent être exécutées depuis le tableau de bord Supabase')
    console.log('   Car la clé anon ne permet pas d\'exécuter des commandes DDL (ALTER TABLE)\n')

    console.log('📋 Étapes à suivre:')
    console.log('   1. Allez sur https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/editor/sql')
    console.log('   2. Créez une nouvelle requête SQL')
    console.log('   3. Copiez-collez le contenu de scripts/add_languages_column.sql')
    console.log('   4. Exécutez la requête')
    console.log('   5. Répétez pour scripts/add_availability_column.sql')
    console.log('   6. Répétez pour scripts/add_available24_7_column.sql')
    console.log('   7. Répétez pour scripts/add_contact_columns.sql\n')

    console.log('📄 Contenu du fichier add_languages_column.sql:')
    console.log('═══════════════════════════════════════════════════════')
    console.log(languagesSql)
    console.log('═══════════════════════════════════════════════════════\n')

    console.log('📄 Contenu du fichier add_availability_column.sql:')
    console.log('═══════════════════════════════════════════════════════')
    console.log(availabilitySql)
    console.log('═══════════════════════════════════════════════════════\n')

    console.log('📄 Contenu du fichier add_available24_7_column.sql:')
    console.log('═══════════════════════════════════════════════════════')
    console.log(available24_7Sql)
    console.log('═══════════════════════════════════════════════════════\n')

    console.log('📄 Contenu du fichier add_contact_columns.sql:')
    console.log('═══════════════════════════════════════════════════════')
    console.log(contactSql)
    console.log('═══════════════════════════════════════════════════════\n')

  } catch (err) {
    console.error('❌ Erreur:', err)
    process.exit(1)
  }
}

runMigrations()
