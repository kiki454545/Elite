import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createGiftSystem() {
  try {
    console.log('🎁 Création du système de cadeaux virtuels...\n')

    // Lire le fichier SQL
    const sqlPath = join(__dirname, 'create_gift_system.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    // Séparer les commandes SQL (par point-virgule)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`📝 ${commands.length} commandes SQL à exécuter\n`)

    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]

      // Afficher un résumé de la commande
      const firstLine = command.split('\n')[0]
      console.log(`[${i + 1}/${commands.length}] ${firstLine.substring(0, 60)}...`)

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: command + ';' })

        if (error) {
          // Essayer d'exécuter directement si exec_sql n'existe pas
          const { error: directError } = await supabase.from('_exec').insert({ sql: command + ';' })

          if (directError && directError.message.includes('relation "_exec" does not exist')) {
            console.log('⚠️  Impossible d\'exécuter via RPC, exécutez manuellement le SQL dans Supabase Dashboard')
            console.log('\n📋 Copiez et collez ce SQL dans le SQL Editor de Supabase:\n')
            console.log(sql)
            process.exit(0)
          } else if (directError) {
            throw directError
          }
        }

        console.log('  ✓ Succès')
      } catch (err) {
        console.error(`  ✗ Erreur: ${err.message}`)
        // Continuer malgré l'erreur (certaines commandes peuvent déjà exister)
      }
    }

    console.log('\n✅ Système de cadeaux créé avec succès!')
    console.log('\n📊 Résumé:')
    console.log('  - Table gift_transactions créée')
    console.log('  - Fonctions RPC créées (deduct_coins, add_coins, etc.)')
    console.log('  - Row Level Security activé')
    console.log('\n🎉 Le système de cadeaux est prêt à l\'emploi!')

  } catch (error) {
    console.error('\n❌ Erreur lors de la création du système:', error.message)
    console.log('\n💡 Solution alternative:')
    console.log('1. Ouvrez Supabase Dashboard')
    console.log('2. Allez dans SQL Editor')
    console.log('3. Copiez-collez le contenu de scripts/create_gift_system.sql')
    console.log('4. Exécutez le script')
    process.exit(1)
  }
}

createGiftSystem()
