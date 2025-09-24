import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tokens/trending - Top 10 by volume 24h
export async function GET() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const trending = await prisma.$queryRaw`
      SELECT 
        fa.address,
        fa.name,
        fa.symbol,
        fa.creator,
        COALESCE(SUM(t.apt_amount), 0) as volume_24h,
        COUNT(t.id) as trade_count_24h,
        ps.apt_reserves,
        ps.total_volume,
        ps.is_graduated
      FROM "FA" fa
      LEFT JOIN "Trade" t ON fa.address = t.fa_address 
        AND t.created_at > ${twentyFourHoursAgo}
      LEFT JOIN "PoolStats" ps ON fa.address = ps.fa_address
      GROUP BY fa.address, fa.name, fa.symbol, fa.creator, ps.apt_reserves, ps.total_volume, ps.is_graduated
      ORDER BY volume_24h DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      data: trending
    });
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch trending tokens'
    }, { status: 500 });
  }
}
