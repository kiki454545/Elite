import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkBanUpdate() {
  console.log('🔍 Vérification du système de ban...\n')

  const testUserId = '217af6f9-ab44-4e1a-adc4-fbb00882e699'
  const adminId = 'c598f70d-7d5f-4c8a-a3c5-741f97b91d4a'

  try {
    // 1. Vérifier que l'utilisateur existe
    console.log('1️⃣ Vérification de l\'existence de l\'utilisateur...')
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, username, banned_until, ban_reason, banned_at, banned_by')
      .eq('id', testUserId)
      .single()

    if (userError) {
      console.error('❌ Erreur lors de la recherche de l\'utilisateur:', userError)
      return
    }

    if (!user) {
      console.error('❌ Utilisateur non trouvé!')
      return
    }

    console.log('✅ Utilisateur trouvé:', {
      id: user.id,
      username: user.username,
      banned_until: user.banned_until,
      ban_reason: user.ban_reason,
      banned_at: user.banned_at,
      banned_by: user.banned_by
    })

    // 2. Essayer de mettre à jour avec le service role key
    console.log('\n2️⃣ Tentative de mise à jour avec service role key...')
    const bannedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        banned_until: bannedUntil,
        ban_reason: 'Test ban system',
        banned_at: new Date().toISOString(),
        banned_by: adminId
      })
      .eq('id', testUserId)
      .select()

    console.log('📊 Résultat de la mise à jour:', {
      data: updateData,
      error: updateError
    })

    if (updateError) {
      console.error('❌ Erreur:', updateError.message)
      console.error('Code:', updateError.code)
      console.error('Détails:', updateError.details)
    } else if (!updateData || updateData.length === 0) {
      console.warn('⚠️  Aucune ligne mise à jour (RLS policy bloque probablement)')

      // Vérifier les policies RLS
      console.log('\n3️⃣ Vérification des policies RLS...')
      const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies
          WHERE tablename = 'profiles'
          ORDER BY policyname;
        `
      })

      if (policiesError) {
        console.log('ℹ️  Impossible de récupérer les policies RLS (fonction RPC non disponible)')
      } else {
        console.log('📋 Policies RLS sur la table profiles:')
        console.table(policies)
      }
    } else {
      console.log('✅ Mise à jour réussie!')
      console.log('Données mises à jour:', updateData[0])
    }

    // 4. Re-vérifier l'état de l'utilisateur
    console.log('\n4️⃣ Vérification de l\'état final...')
    const { data: finalUser } = await supabase
      .from('profiles')
      .select('banned_until, ban_reason, banned_at, banned_by')
      .eq('id', testUserId)
      .single()

    console.log('État final:', finalUser)

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkBanUpdate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
