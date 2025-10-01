import { NextResponse } from 'next/server';
import { startIndexer, getIndexerService } from '@/lib/indexer-startup';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const existingService = getIndexerService();
    if (existingService) {
      return NextResponse.json({
        success: true,
        message: 'Indexer is already running'
      });
    }

    await startIndexer();
    
    return NextResponse.json({
      success: true,
      message: 'Indexer started successfully'
    });
  } catch (error) {
    console.error('Error starting indexer:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to start indexer'
    }, { status: 500 });
  }
}

export async function GET() {
  const service = getIndexerService();
  
  // Also check if there are recent database updates as indicator
  let hasRecentActivity = false;
  try {
    const recentTrades = await prisma.trade.count({
      where: {
        created_at: {
          gte: new Date(Date.now() - 60000) // Last minute
        }
      }
    });
    hasRecentActivity = recentTrades > 0;
  } catch {
    // Database might not be connected
  }
  
  return NextResponse.json({
    success: true,
    isRunning: !!service,
    hasRecentActivity,
    message: service ? 'Indexer service is running' : 'Indexer service is not running'
  });
}
