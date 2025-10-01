import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: "Query must be at least 2 characters" 
      }, { status: 400 });
    }

    // Search tokens in database using Prisma
    const searchResults = await prisma.fA.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            symbol: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        pool_stats: true,
        _count: {
          select: { trades: true }
        }
      },
      orderBy: [
        // Exact symbol match first
        {
          symbol: query.toLowerCase() === query ? 'asc' : 'desc'
        },
        // Then by trade count (popularity)
        {
          trades: {
            _count: 'desc'
          }
        },
        // Finally by creation date
        {
          created_at: 'desc'
        }
      ],
      take: 10 // Limit to 10 results for performance
    });

    // Transform results to match expected format
    const transformedResults = searchResults.map(token => {
      // Calculate current price from pool stats
      let currentPrice = 0;
      if (token.pool_stats?.apt_reserves) {
        // Simple price calculation - you may want to use the actual bonding curve formula
        const aptReserves = Number(token.pool_stats.apt_reserves) / 1e8; // Convert from octas
        const virtualTokenReserves = 1000000000; // 1B tokens virtual reserves
        currentPrice = aptReserves / virtualTokenReserves;
      }

      // Calculate relevance score
      const queryLower = query.toLowerCase();
      const nameMatch = token.name.toLowerCase().includes(queryLower);
      const symbolMatch = token.symbol.toLowerCase().includes(queryLower);
      const exactSymbolMatch = token.symbol.toLowerCase() === queryLower;
      const exactNameMatch = token.name.toLowerCase() === queryLower;
      
      let relevance = 1;
      if (exactSymbolMatch || exactNameMatch) relevance = 4;
      else if (nameMatch && symbolMatch) relevance = 3;
      else if (symbolMatch) relevance = 2;
      else if (nameMatch) relevance = 1;

      return {
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        iconUri: token.icon_uri || "",
        projectUri: token.project_uri || "",
        creator: token.creator,
        currentPrice,
        tradeCount: token._count.trades,
        isGraduated: token.pool_stats?.is_graduated || false,
        totalVolume: token.pool_stats?.total_volume ? Number(token.pool_stats.total_volume) : 0,
        relevance,
        createdAt: token.created_at
      };
    });

    // Sort by relevance score
    transformedResults.sort((a, b) => b.relevance - a.relevance);

    return NextResponse.json({
      success: true,
      data: transformedResults,
      total: transformedResults.length
    });

  } catch (error: unknown) {
    console.error("Search error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Search failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
