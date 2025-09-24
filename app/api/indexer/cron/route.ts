import { NextResponse } from 'next/server';
import { IndexerService } from '@/lib/services/indexer';

// This endpoint will be called by Vercel Cron Jobs every 5 minutes
export async function GET() {
  try {
    console.log('🔄 Starting periodic indexer run...');
    
    // Create a new indexer instance for this run
    const indexer = new IndexerService();
    
    // Run indexer for a limited time (4 minutes max to stay within Vercel limits)
    const maxDuration = 4 * 60 * 1000; // 4 minutes
    await indexer.start(undefined, maxDuration);
    
    console.log('✅ Periodic indexer run completed');
    
    return NextResponse.json({
      success: true,
      message: 'Indexer cron job completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in indexer cron job:', error);
    return NextResponse.json({
      success: false,
      error: 'Indexer cron job failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Also allow POST for manual triggering
export async function POST() {
  return GET();
}
