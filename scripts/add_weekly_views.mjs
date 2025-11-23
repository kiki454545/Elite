import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addWeeklyViewsColumn() {
  try {
    console.log('🚀 Adding weekly_views column and initializing data...\n')

    // Étape 1: Récupérer toutes les annonces
    console.log('📊 Fetching all ads...')
    const { data: ads, error: fetchError } = await supabase
      .from('ads')
      .select('id, views')

    if (fetchError) {
      console.error('❌ Error fetching ads:', fetchError)
      process.exit(1)
    }

    console.log(`✅ Found ${ads.length} ads\n`)

    // Étape 2: Ajouter weekly_views = 0 à toutes les annonces
    console.log('🔄 Initializing weekly_views to 0 for all ads...')

    let successCount = 0
    let errorCount = 0

    for (const ad of ads) {
      const { error: updateError } = await supabase
        .from('ads')
        .update({ weekly_views: 0 })
        .eq('id', ad.id)

      if (updateError) {
        if (updateError.message.includes('column "weekly_views" does not exist')) {
          console.error('\n❌ Column weekly_views does not exist!')
          console.error('\nPlease run this SQL in Supabase SQL Editor first:\n')
          console.error('ALTER TABLE ads ADD COLUMN weekly_views INTEGER DEFAULT 0;')
          console.error('CREATE INDEX idx_ads_weekly_views ON ads(weekly_views DESC);\n')
          process.exit(1)
        }
        errorCount++
        console.error(`❌ Error updating ad ${ad.id}:`, updateError.message)
      } else {
        successCount++
        if (successCount % 50 === 0) {
          console.log(`   ✓ Updated ${successCount}/${ads.length} ads...`)
        }
      }
    }

    console.log(`\n✅ Successfully updated ${successCount} ads`)
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} errors occurred`)
    }

    // Vérifier que ça a fonctionné
    console.log('\n🔍 Verifying...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('ads')
      .select('id, views, weekly_views')
      .limit(5)

    if (verifyError) {
      console.error('❌ Verification error:', verifyError)
    } else {
      console.log('\n📋 Sample data:')
      verifyData.forEach(ad => {
        console.log(`   Ad ${ad.id}: views=${ad.views}, weekly_views=${ad.weekly_views}`)
      })
    }

    console.log('\n✅ All done!\n')
    console.log('Next steps:')
    console.log('1. ✓ weekly_views column is ready')
    console.log('2. Run this SQL in Supabase to create the reset function:')
    console.log('')
    console.log('CREATE TABLE IF NOT EXISTS weekly_reset_log (')
    console.log('  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),')
    console.log('  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
    console.log('  ads_count INTEGER,')
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()')
    console.log(');')
    console.log('')
    console.log('CREATE OR REPLACE FUNCTION reset_weekly_views()')
    console.log('RETURNS void AS $$')
    console.log('DECLARE')
    console.log('  ads_updated INTEGER;')
    console.log('BEGIN')
    console.log('  SELECT COUNT(*) INTO ads_updated FROM ads WHERE status = \\'approved\\';')
    console.log('  UPDATE ads SET weekly_views = 0;')
    console.log('  INSERT INTO weekly_reset_log (reset_date, ads_count)')
    console.log('  VALUES (NOW(), ads_updated);')
    console.log('  RAISE NOTICE \\'Weekly views reset completed for % ads\\', ads_updated;')
    console.log('END;')
    console.log('$$ LANGUAGE plpgsql;')
    console.log('')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

addWeeklyViewsColumn()
