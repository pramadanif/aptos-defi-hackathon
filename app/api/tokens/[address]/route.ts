import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tokens/:address - Token detail + recent trades
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    const token = await prisma.fA.findUnique({
      where: { address },
      include: {
        pool_stats: true,
        trades: {
          orderBy: { created_at: 'desc' },
          take: 50,
          select: {
            id: true,
            transaction_hash: true,
            user_address: true,
            apt_amount: true,
            token_amount: true,
            price_per_token: true,
            created_at: true
          }
        }
      }
    });

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token not found'
      }, { status: 404 });
    }

    // Calculate 24h volume for this token
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const volume24h = await prisma.trade.aggregate({
      where: {
        fa_address: address,
        created_at: {
          gte: twentyFourHoursAgo
        }
      },
      _sum: {
        apt_amount: true
      },
      _count: true
    });

    return NextResponse.json({
      success: true,
      data: {
        ...token,
        volume_24h: volume24h._sum.apt_amount || 0,
        trade_count_24h: volume24h._count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching token details:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch token details'
    }, { status: 500 });
  }
}
