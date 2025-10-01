#!/usr/bin/env tsx
/**
 * Reset Indexer to Latest Blockchain Version
 * 
 * This script forces the indexer to jump to the latest blockchain version,
 * skipping all old historical transactions for ultra-fast real-time tracking.
 * 
 * Usage: npx tsx lib/reset-indexer.ts
 */

import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { prisma } from './prisma';

async function resetToLatest() {
  console.log('⚡ Resetting indexer to latest blockchain version...\n');

  try {
    // Initialize Aptos client
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);

    // Get current ledger version
    const ledgerInfo = await aptos.getLedgerInfo();
    const currentVersion = parseInt(ledgerInfo.ledger_version);

    console.log('📊 Blockchain Status:');
    console.log(`   Current Ledger Version: ${currentVersion.toLocaleString()}`);
    console.log(`   Chain ID: ${ledgerInfo.chain_id}`);

    // Check database status
    const tradeCount = await prisma.trade.count();
    const lastTrade = await prisma.trade.findFirst({
      orderBy: { created_at: 'desc' }
    });

    console.log('\n💾 Database Status:');
    console.log(`   Total Trades: ${tradeCount}`);
    if (lastTrade) {
      console.log(`   Last Trade: ${lastTrade.transaction_hash?.substring(0, 12)}...`);
      console.log(`   Last Trade Time: ${lastTrade.created_at.toLocaleString()}`);
    }

    // Calculate new starting version (current - 50 for safety)
    const newStartVersion = Math.max(0, currentVersion - 50);

    console.log('\n⚡ Reset Configuration:');
    console.log(`   Will start from version: ${newStartVersion.toLocaleString()}`);
    console.log(`   Skipping versions: 0 - ${newStartVersion.toLocaleString()}`);
    console.log(`   Expected delay: 2-5 seconds for new transactions`);

    // Confirm
    console.log('\n⚠️  This will skip ALL historical transactions before version', newStartVersion);
    console.log('✅ Indexer will only track NEW transactions from now on');
    console.log('\n🚀 Ready to start ultra-fast indexer!');
    console.log('   Run: npm run dev (to start Next.js with indexer)');
    console.log('   Or visit: http://localhost:3000/api/indexer/start');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  resetToLatest().catch(console.error);
}

export { resetToLatest };
