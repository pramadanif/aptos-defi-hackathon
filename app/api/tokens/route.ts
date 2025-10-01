import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tokens - List all tokens
export async function GET() {
  try {
    const tokens = await prisma.fA.findMany({
      include: {
        pool_stats: true,
        _count: {
          select: { trades: true }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tokens'
    }, { status: 500 });
  }
}
