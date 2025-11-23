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

async function setupWeeklyViews() {
  try {
    console.log('🚀 Setting up weekly views system...\n')

    // 1. Add weekly_views column
    console.log('📊 Adding weekly_views column to ads table...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE ads ADD COLUMN IF NOT EXISTS weekly_views INTEGER DEFAULT 0'
    })

    if (alterError) {
      // Try direct SQL execution
      const { error: directError } = await supabase
        .from('ads')
        .select('weekly_views')
        .limit(1)

      if (directError && directError.message.includes('column "weekly_views" does not exist')) {
        console.log('⚠️  Need to add weekly_views column manually in Supabase SQL Editor')
        console.log('Run this SQL:')
        console.log('ALTER TABLE ads ADD COLUMN IF NOT EXISTS weekly_views INTEGER DEFAULT 0;')
      } else {
        console.log('✅ weekly_views column already exists or added successfully')
      }
    } else {
      console.log('✅ weekly_views column added')
    }

    // 2. Create weekly_reset_log table
    console.log('\n📝 Creating weekly_reset_log table...')
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS weekly_reset_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ads_count INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 3. Create index
    console.log('📈 Creating index on weekly_views...')
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_ads_weekly_views ON ads(weekly_views DESC);
    `

    // 4. Create reset function
    console.log('⚙️  Creating reset_weekly_views function...')
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION reset_weekly_views()
      RETURNS void AS $$
      DECLARE
        ads_updated INTEGER;
      BEGIN
        SELECT COUNT(*) INTO ads_updated FROM ads WHERE status = 'approved';
        UPDATE ads SET weekly_views = 0;
        INSERT INTO weekly_reset_log (reset_date, ads_count)
        VALUES (NOW(), ads_updated);
        RAISE NOTICE 'Weekly views reset completed for % ads', ads_updated;
      END;
      $$ LANGUAGE plpgsql;
    `

    console.log('\n📋 Please run the following SQL in Supabase SQL Editor:\n')
    console.log('-- Add weekly_views column')
    console.log('ALTER TABLE ads ADD COLUMN IF NOT EXISTS weekly_views INTEGER DEFAULT 0;\n')
    console.log('-- Create log table')
    console.log(createTableSQL)
    console.log('-- Create index')
    console.log(createIndexSQL)
    console.log('-- Create reset function')
    console.log(createFunctionSQL)

    // Initialize weekly_views to 0 for all existing ads
    console.log('\n🔄 Initializing weekly_views for existing ads...')
    const { error: updateError } = await supabase
      .from('ads')
      .update({ weekly_views: 0 })
      .is('weekly_views', null)

    if (updateError) {
      console.log('⚠️  Could not initialize weekly_views automatically')
      console.log('Error:', updateError.message)
    } else {
      console.log('✅ weekly_views initialized for all ads')
    }

    console.log('\n✅ Setup complete!')
    console.log('\nNext steps:')
    console.log('1. Run the SQL statements above in Supabase SQL Editor')
    console.log('2. Deploy the cron job API route')
    console.log('3. Set up Vercel Cron to call /api/cron/reset-weekly-views every Monday')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

setupWeeklyViews()
