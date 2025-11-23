import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// This endpoint will be called by Vercel Cron every Monday at 00:00 UTC
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting weekly views reset...')

    // Call the reset function
    const { data, error } = await supabase.rpc('reset_weekly_views')

    if (error) {
      console.error('❌ Error resetting weekly views:', error)
      return NextResponse.json(
        { error: 'Failed to reset weekly views', details: error.message },
        { status: 500 }
      )
    }

    // Get the latest reset log entry
    const { data: logData, error: logError } = await supabase
      .from('weekly_reset_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (logError) {
      console.error('⚠️  Could not fetch reset log:', logError)
    }

    console.log('✅ Weekly views reset completed')
    console.log('📊 Reset log:', logData)

    return NextResponse.json({
      success: true,
      message: 'Weekly views reset completed',
      resetLog: logData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

// Also support POST requests
export async function POST(request: Request) {
  return GET(request)
}
