import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addRankExpiryColumn() {
  console.log('🔄 Adding rank_expiry column to profiles table...')

  try {
    // Vérifier si la colonne existe déjà
    const { data: testData, error: checkError } = await supabase
      .from('profiles')
      .select('rank_expiry')
      .limit(1)

    if (!checkError && testData !== null) {
      console.log('✅ Column rank_expiry already exists!')
      return
    }

    console.log('⚠️  Column does not exist, please run this SQL manually in Supabase SQL Editor:')
    console.log('')
    console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank_expiry TIMESTAMP WITH TIME ZONE;')
    console.log('')
    console.log('Go to: https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/sql/new')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

addRankExpiryColumn()
