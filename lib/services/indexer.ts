import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// Type for Aptos transaction - loosely typed to avoid strict checks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AptosTransaction = any;

interface CreateFAEvent {
  creator_addr: string;
  fa_obj: { inner: string } | string; // Object<Metadata>
  max_supply: string; // u128 - fixed supply now
  name: string;
  symbol: string;
  decimals: number; // u8 - always 8 now
  icon_uri: string;
  project_uri: string;
  mint_fee_per_smallest_unit_of_fa: string; // u64
}

interface MintFAEvent {
  fa_obj: string;
  amount: string;
  recipient_addr: string;
  total_mint_fee: string;
}

interface BurnFAEvent {
  fa_obj: string;
  amount: string;
  burner_addr: string;
}

interface TokenPurchaseEvent {
  buyer: string;
  fa_object: string;
  apt_in: string;
  tokens_out: string;
}

interface TokenSaleEvent {
  seller: string;
  fa_object: string;
  tokens_in: string;
  apt_out: string;
}

export class IndexerService {
  private aptos: Aptos;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private lastProcessedVersion = 0;

  // BullPump contract address from environment
  private readonly BULLPUMP_CONTRACT = process.env.BULLPUMP_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_MODULE_ADDR || "";
  private readonly POLLING_INTERVAL = 2000; // 2 seconds - ULTRA FAST real-time tracking
  
  // BullPump module names
  private readonly TOKEN_FACTORY_MODULE = `${this.BULLPUMP_CONTRACT}::token_factory`;
  private readonly BONDING_CURVE_MODULE = `${this.BULLPUMP_CONTRACT}::bonding_curve_pool`;

  constructor() {
    if (!this.BULLPUMP_CONTRACT) {
      throw new Error("BULLPUMP_CONTRACT_ADDRESS or NEXT_PUBLIC_MODULE_ADDR environment variable is required");
    }
    
    const network = Network.TESTNET; // Change to MAINNET when ready
    const nodeUrl = process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
    const apiKey = process.env.APTOS_API_KEY;
    
    console.log('⚡ ULTRA-FAST Indexer Configuration:');
    console.log('   Network:', network);
    console.log('   Node URL:', nodeUrl);
    console.log('   API Key:', apiKey ? '✅ Configured (Rate limit protection)' : '❌ Not configured (May hit rate limits)');
    console.log('   Contract:', this.BULLPUMP_CONTRACT);
    console.log('   Polling Interval:', this.POLLING_INTERVAL + 'ms (⚡ ULTRA-FAST)');
    console.log('   Batch Size: 300 transactions per check');
    console.log('   Expected Delay: ~2-5 seconds after transaction');
    console.log('   Strategy: Skip old history, track latest only');
    
    const config = new AptosConfig({ 
      network,
      fullnode: nodeUrl,
      ...(apiKey && {
        clientConfig: {
          HEADERS: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      })
    });
    this.aptos = new Aptos(config);
  }

  async start(fromVersion?: number, maxDuration?: number) {
    if (this.isRunning) {
      console.log('⚠️  Indexer is already running');
      return;
    }

    console.log('🚀 Starting BullPump indexer...');
    this.isRunning = true;

    // Get the last processed version from database or use provided version
    if (fromVersion !== undefined) {
      this.lastProcessedVersion = fromVersion;
      console.log(`📍 Starting from specified version: ${fromVersion}`);
    } else {
      await this.initializeLastProcessedVersion();
    }

    // For serverless environments (like Vercel), run for limited time
    if (maxDuration) {
      console.log(`⏰ Running in serverless mode for ${maxDuration}ms`);
      setTimeout(() => {
        console.log('⏰ Serverless timeout reached, stopping indexer...');
        this.stop();
      }, maxDuration);
      
      // Run batch processing instead of continuous polling
      await this.runBatchProcessing(maxDuration);
    } else {
      // Traditional continuous polling for local development
      this.intervalId = setInterval(() => {
        this.indexNewTransactions().catch(error => {
          console.error('❌ Error in indexing cycle:', error);
        });
      }, this.POLLING_INTERVAL);

      // Run initial indexing
      await this.indexNewTransactions();
    }
  }

  async searchHistoricalTransactions(startVersion: number, endVersion: number) {
    console.log(`🔍 Searching historical transactions from ${startVersion} to ${endVersion}...`);
    
    let currentVersion = startVersion;
    let totalBullPumpTx = 0;
    const batchSize = 100;

    while (currentVersion < endVersion) {
      try {
        const transactions = await this.aptos.getTransactions({
          options: {
            offset: currentVersion,
            limit: Math.min(batchSize, endVersion - currentVersion)
          }
        });

        let bullPumpTxInBatch = 0;
        for (const transaction of transactions) {
          if ('version' in transaction) {
            const isBullPumpTx = await this.processTransaction(transaction);
            if (isBullPumpTx) {
              bullPumpTxInBatch++;
              totalBullPumpTx++;
            }
            currentVersion = parseInt(transaction.version);
          }
        }

        if (bullPumpTxInBatch > 0) {
          console.log(`🎯 Found ${bullPumpTxInBatch} BullPump transactions in batch (version ${currentVersion})`);
        }

        currentVersion++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error searching version ${currentVersion}:`, error);
        currentVersion += batchSize;
      }
    }

    console.log(`📊 Historical search complete. Found ${totalBullPumpTx} BullPump transactions total.`);
    return totalBullPumpTx;
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping indexer...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async runBatchProcessing(maxDuration: number) {
    const startTime = Date.now();
    const batchInterval = 5000; // 5 seconds between batches
    
    console.log('🔄 Starting batch processing for serverless environment...');
    
    while (this.isRunning && (Date.now() - startTime) < maxDuration - 5000) {
      try {
        await this.indexNewTransactions();
        
        // Wait between batches to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, batchInterval));
      } catch (error) {
        console.error('❌ Error in batch processing:', error);
        // Continue processing even if one batch fails
        await new Promise(resolve => setTimeout(resolve, batchInterval));
      }
    }
    
    console.log('✅ Batch processing completed');
  }

  private async initializeLastProcessedVersion() {
    try {
      // ULTRA-FAST MODE: Always start from CURRENT ledger, skip old history
      const ledgerInfo = await this.aptos.getLedgerInfo();
      const currentVersion = parseInt(ledgerInfo.ledger_version);
      
      // Check if we have recent trades (within last hour)
      const recentTrade = await prisma.trade.findFirst({
        where: {
          created_at: {
            gte: new Date(Date.now() - 3600000) // Last 1 hour
          }
        },
        orderBy: { created_at: 'desc' }
      });

      if (recentTrade) {
        // Continue from last recent trade
        try {
          const txn = await this.aptos.getTransactionByHash({
            transactionHash: recentTrade.transaction_hash
          });
          
          if ('version' in txn) {
            this.lastProcessedVersion = parseInt(txn.version);
            console.log(`📍 Continuing from recent trade: ${this.lastProcessedVersion}`);
            return;
          }
        } catch {
          console.log('⚠️  Could not get recent trade version, jumping to latest');
        }
      }
      
      // No recent trades OR error getting trade: Jump to latest - 100 txs for safety
      this.lastProcessedVersion = Math.max(0, currentVersion - 100);
      console.log(`⚡ ULTRA-FAST MODE: Jumping to latest blockchain version`);
      console.log(`📍 Current ledger: ${currentVersion}`);
      console.log(`📍 Starting from: ${this.lastProcessedVersion} (latest - 100 for safety)`);
      console.log(`⚠️  Note: Old transactions (v6878M-${this.lastProcessedVersion}) are SKIPPED for speed`);
    } catch (error) {
      console.error('⚠️  Could not initialize last processed version:', error);
      this.lastProcessedVersion = 0;
    }
  }

  private async indexNewTransactions() {
    try {
      // Get recent transactions - ULTRA-FAST processing
      const transactions = await this.aptos.getTransactions({
        options: {
          offset: this.lastProcessedVersion + 1,
          limit: 300 // Larger batch for speed
        }
      });

      if (transactions.length === 0) {
        // No new transactions, wait for next poll
        return;
      }

      let processedCount = 0;
      let bullPumpTxCount = 0;

      for (const transaction of transactions) {
        if ('version' in transaction) {
          const isBullPumpTx = await this.processTransaction(transaction);
          if (isBullPumpTx) {
            bullPumpTxCount++;
          }
          this.lastProcessedVersion = parseInt(transaction.version);
          processedCount++;
        }
      }

      if (processedCount > 0) {
        const currentTime = new Date().toLocaleTimeString();
        if (bullPumpTxCount > 0) {
          console.log(`🎯 [${currentTime}] Found ${bullPumpTxCount} BullPump tx in ${processedCount} txs (v${this.lastProcessedVersion})`);
        } else {
          // Only log every 10 checks to reduce noise
          if (Math.random() < 0.1) {
            console.log(`⚡ [${currentTime}] Scanned ${processedCount} tx - Ultra-fast monitoring (v${this.lastProcessedVersion})`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error indexing transactions:', error);
    }
  }

  private async processTransaction(transaction: AptosTransaction): Promise<boolean> {
    try {
      // Debug: Log transaction details for debugging
      const isBullPump = this.isBullPumpTransaction(transaction);
      
      if (isBullPump) {
        console.log('🎯 Found BullPump transaction:', transaction.hash);
        console.log('📋 Function:', transaction.payload?.function);
        console.log('📋 Events:', transaction.events?.length || 0);
      }

      if (!isBullPump) {
        return false;
      }

      // Process different types of BullPump events
      await this.processCreateFAEvents(transaction);
      await this.processMintFAEvents(transaction);
      await this.processBurnFAEvents(transaction);
      await this.processTokenPurchaseEvents(transaction);
      await this.processTokenSaleEvents(transaction);
      await this.processBuyTokensEvents(transaction); // Keep for backward compatibility

      return true;
    } catch (error) {
      console.error('❌ Error processing transaction:', transaction.hash, error);
      return false;
    }
  }

  private isBullPumpTransaction(transaction: AptosTransaction): boolean {
    // Ultra-minimal logging for MAXIMUM speed
    
    // Fast check: entry function first (most common case)
    if (transaction.payload && transaction.payload.type === 'entry_function_payload') {
      const functionName = transaction.payload.function;
      const isBullPumpFunction = functionName?.startsWith(this.TOKEN_FACTORY_MODULE) ||
                                functionName?.startsWith(this.BONDING_CURVE_MODULE);
      
      if (isBullPumpFunction) {
        console.log('🎯 BullPump tx found:', transaction.hash?.substring(0, 12) + '...', functionName?.split('::').pop());
        return true;
      }
    }

    // Fast check: events (less common)
    if (transaction.events && transaction.events.length > 0) {
      const hasBullPumpEvent = transaction.events.some((event: AptosTransaction) => 
        event.type?.includes(this.BULLPUMP_CONTRACT)
      );
      
      if (hasBullPumpEvent) {
        console.log('🎯 BullPump event found:', transaction.hash?.substring(0, 12) + '...');
        return true;
      }
    }

    return false;
  }

  private async processCreateFAEvents(transaction: AptosTransaction) {
    if (!transaction.events) return;

    for (const event of transaction.events) {
      if (event.type?.includes('CreateFAEvent')) {
        try {
          const eventData = event.data as CreateFAEvent;
          await this.processCreateFAEvent(transaction, eventData);
        } catch (error) {
          console.error('❌ Error processing CreateFAEvent:', error);
        }
      }
    }
  }

  private async processMintFAEvents(transaction: AptosTransaction) {
    if (!transaction.events) return;

    for (const event of transaction.events) {
      if (event.type?.includes('MintFAEvent')) {
        try {
          const eventData = event.data as MintFAEvent;
          await this.processMintFAEvent(transaction, eventData);
        } catch (error) {
          console.error('❌ Error processing MintFAEvent:', error);
        }
      }
    }
  }

  private async processBurnFAEvents(transaction: AptosTransaction) {
    if (!transaction.events) return;

    for (const event of transaction.events) {
      if (event.type?.includes('BurnFAEvent')) {
        try {
          const eventData = event.data as BurnFAEvent;
          await this.processBurnFAEvent(transaction, eventData);
        } catch (error) {
          console.error('❌ Error processing BurnFAEvent:', error);
        }
      }
    }
  }

  private async processBuyTokensEvents(transaction: AptosTransaction) {
    // Check for buy_tokens function calls
    if (transaction.payload?.type === 'entry_function_payload' && 
        transaction.payload.function === `${this.BONDING_CURVE_MODULE}::buy_tokens`) {
      try {
        await this.processBuyTokensTransaction(transaction);
      } catch (error) {
        console.error('❌ Error processing buy_tokens transaction:', error);
      }
    }
  }

  private async processCreateFAEvent(transaction: AptosTransaction, eventData: CreateFAEvent) {
    try {
      // Extract FA address using helper function
      const faAddress = this.extractFAAddress(eventData.fa_obj);
      const maxSupply = this.extractMaxSupply(eventData.max_supply);
      
      // Check if FA already exists
      const existingFA = await prisma.fA.findUnique({
        where: { address: faAddress }
      });

      if (existingFA) {
        console.log(`⚠️  FA already exists: ${eventData.name} (${eventData.symbol})`);
        return; // Already processed
      }

      // Create FA record with ALL fields
      await prisma.fA.create({
        data: {
          address: faAddress,
          name: eventData.name,
          symbol: eventData.symbol,
          creator: eventData.creator_addr,
          decimals: eventData.decimals,
          max_supply: new Decimal(maxSupply),
          icon_uri: eventData.icon_uri,
          project_uri: eventData.project_uri,
          mint_fee_per_unit: new Decimal(eventData.mint_fee_per_smallest_unit_of_fa),
          created_at: new Date(parseInt(transaction.timestamp) / 1000)
        }
      });

      // Create initial pool stats
      await prisma.poolStats.create({
        data: {
          fa_address: faAddress,
          apt_reserves: new Decimal(0),
          total_volume: new Decimal(0),
          trade_count: 0,
          is_graduated: false
        }
      });

      console.log(`📝 Would create CreateFA event for: ${eventData.name} (${eventData.symbol})`);
      // Event creation temporarily disabled due to schema issues

      console.log(`🪙 Created new FA: ${eventData.name} (${eventData.symbol}) at ${faAddress}`);
      console.log(`   Max Supply: ${maxSupply || 'unlimited'}`);
      console.log(`   Decimals: ${eventData.decimals}`);
    } catch (error) {
      console.error('❌ Error processing CreateFAEvent:', error);
    }
  }

  private async processMintFAEvent(transaction: AptosTransaction, eventData: MintFAEvent) {
    try {
      // Create trade record for mint
      await prisma.trade.create({
        data: {
          transaction_hash: transaction.hash,
          fa_address: eventData.fa_obj,
          user_address: eventData.recipient_addr,
          apt_amount: new Decimal(eventData.total_mint_fee),
          token_amount: new Decimal(eventData.amount),
          price_per_token: this.calculatePricePerToken(eventData.total_mint_fee, eventData.amount),
          created_at: new Date(transaction.timestamp)
        }
      });

      console.log(`📝 Would create MintFA event for: ${eventData.amount} tokens`);
      // Event creation temporarily disabled due to schema issues

      console.log(`🔨 Processed mint: ${eventData.amount} tokens to ${eventData.recipient_addr}`);
    } catch (error) {
      console.error('❌ Error processing MintFAEvent:', error);
    }
  }

  private async processBurnFAEvent(transaction: AptosTransaction, eventData: BurnFAEvent) {
    try {
      // Create trade record for burn
      await prisma.trade.create({
        data: {
          transaction_hash: transaction.hash,
          fa_address: eventData.fa_obj,
          user_address: eventData.burner_addr,
          apt_amount: new Decimal(0), // No APT involved in burn
          token_amount: new Decimal(eventData.amount),
          price_per_token: new Decimal(0),
          created_at: new Date(transaction.timestamp)
        }
      });

      console.log(`📝 Would create BurnFA event for: ${eventData.amount} tokens`);
      // Event creation temporarily disabled due to schema issues

      console.log(`🔥 Processed burn: ${eventData.amount} tokens from ${eventData.burner_addr}`);
    } catch (error) {
      console.error('❌ Error processing BurnFAEvent:', error);
    }
  }

  private async processBuyTokensTransaction(transaction: AptosTransaction) {
    try {
      // Check if already processed
      const existingTrade = await prisma.trade.findUnique({
        where: { transaction_hash: transaction.hash }
      });

      if (existingTrade) {
        return; // Already processed
      }

      // Extract function arguments
      const args = transaction.payload.arguments;
      if (!args || args.length < 2) {
        console.warn('⚠️  buy_tokens transaction missing arguments');
        return;
      }

      const faObjAddr = args[0]; // fa_obj_addr
      const aptAmount = args[1]; // amount in octas
      const buyer = transaction.sender;

      // Calculate fee (1% = 100 basis points)
      const feeAmount = Math.floor(parseInt(aptAmount) * 100 / 10000);
      const aptForCurve = parseInt(aptAmount) - feeAmount;

      // Try to get token amount from events or calculate it
      let tokenAmount = "0";
      
      // Look for transfer events to determine token amount
      if (transaction.events) {
        for (const event of transaction.events) {
          if (event.type?.includes('Transfer') || event.type?.includes('Deposit')) {
            try {
              const amount = event.data?.amount;
              if (amount && parseInt(amount) > 0) {
                tokenAmount = amount;
                break;
              }
            } catch {
              // Continue looking
            }
          }
        }
      }

      // Create trade record
      await prisma.trade.create({
        data: {
          transaction_hash: transaction.hash,
          fa_address: faObjAddr,
          user_address: buyer,
          apt_amount: new Decimal(aptAmount),
          token_amount: new Decimal(tokenAmount),
          price_per_token: this.calculatePricePerToken(aptAmount, tokenAmount),
          created_at: new Date(transaction.timestamp)
        }
      });

      // Update pool stats
      await this.updatePoolStats(faObjAddr, aptForCurve.toString());

      console.log(`📝 Would create BuyTokens event for: ${tokenAmount} tokens, ${aptAmount} octas`);
      // Event creation temporarily disabled due to schema issues

      console.log(`💰 Processed buy: ${tokenAmount} tokens for ${aptAmount} octas (${buyer})`);
    } catch (error) {
      console.error('❌ Error processing buy_tokens transaction:', error);
    }
  }

  private calculatePricePerToken(aptAmount: string, tokenAmount: string): Decimal {
    try {
      const apt = parseFloat(aptAmount);
      const tokens = parseFloat(tokenAmount);
      
      if (tokens === 0) return new Decimal(0);
      
      return new Decimal(apt / tokens);
    } catch {
      return new Decimal(0);
    }
  }

  // Helper functions to handle different data formats from Aptos events
  private extractFAAddress(fa_obj: { inner: string } | string): string {
    if (typeof fa_obj === 'string') {
      return fa_obj;
    }
    return fa_obj.inner;
  }

  private extractMaxSupply(max_supply: string): string {
    // In the new contract, max_supply is always a string (u128)
    return max_supply;
  }

  // Remove old processBuyEvent method as it's replaced by processBuyTokensTransaction

  // Remove old ensureFAExists method as FA creation is now handled by processCreateFAEvent

  private async processTokenPurchaseEvents(transaction: AptosTransaction) {
    if (!transaction.events) return;

    for (const event of transaction.events) {
      if (event.type?.includes('TokenPurchaseEvent')) {
        try {
          const eventData = event.data as TokenPurchaseEvent;
          await this.processTokenPurchaseEvent(transaction, eventData);
        } catch (error) {
          console.error('❌ Error processing TokenPurchaseEvent:', error);
        }
      }
    }
  }

  private async processTokenSaleEvents(transaction: AptosTransaction) {
    if (!transaction.events) return;

    for (const event of transaction.events) {
      if (event.type?.includes('TokenSaleEvent')) {
        try {
          const eventData = event.data as TokenSaleEvent;
          await this.processTokenSaleEvent(transaction, eventData);
        } catch (error) {
          console.error('❌ Error processing TokenSaleEvent:', error);
        }
      }
    }
  }

  private async processTokenPurchaseEvent(transaction: AptosTransaction, eventData: TokenPurchaseEvent) {
    try {
      // Check if already processed
      const existingTrade = await prisma.trade.findUnique({
        where: { transaction_hash: transaction.hash }
      });

      if (existingTrade) {
        return; // Already processed
      }

      // Create trade record for purchase
      await prisma.trade.create({
        data: {
          transaction_hash: transaction.hash,
          fa_address: eventData.fa_object,
          user_address: eventData.buyer,
          apt_amount: new Decimal(eventData.apt_in),
          token_amount: new Decimal(eventData.tokens_out),
          price_per_token: this.calculatePricePerToken(eventData.apt_in, eventData.tokens_out),
          created_at: new Date(parseInt(transaction.timestamp) / 1000)
        }
      });

      // Update pool stats
      await this.updatePoolStats(eventData.fa_object, eventData.apt_in);

      console.log(`💰 Processed purchase: ${eventData.tokens_out} tokens for ${eventData.apt_in} octas (${eventData.buyer})`);
    } catch (error) {
      console.error('❌ Error processing TokenPurchaseEvent:', error);
    }
  }

  private async processTokenSaleEvent(transaction: AptosTransaction, eventData: TokenSaleEvent) {
    try {
      // Check if already processed
      const existingTrade = await prisma.trade.findUnique({
        where: { transaction_hash: transaction.hash }
      });

      if (existingTrade) {
        return; // Already processed
      }

      // Create trade record for sale (negative APT amount to indicate sale)
      await prisma.trade.create({
        data: {
          transaction_hash: transaction.hash,
          fa_address: eventData.fa_object,
          user_address: eventData.seller,
          apt_amount: new Decimal(eventData.apt_out).negated(), // Negative to indicate sale
          token_amount: new Decimal(eventData.tokens_in).negated(), // Negative to indicate tokens sold
          price_per_token: this.calculatePricePerToken(eventData.apt_out, eventData.tokens_in),
          created_at: new Date(parseInt(transaction.timestamp) / 1000)
        }
      });

      console.log(`💸 Processed sale: ${eventData.tokens_in} tokens for ${eventData.apt_out} octas (${eventData.seller})`);
    } catch (error) {
      console.error('❌ Error processing TokenSaleEvent:', error);
    }
  }

  private async updatePoolStats(faAddress: string, aptAmount: string) {
    try {
      // Get current pool stats to check for graduation
      const currentStats = await prisma.poolStats.findUnique({
        where: { fa_address: faAddress }
      });

      if (!currentStats) {
        console.warn(`⚠️  Pool stats not found for FA: ${faAddress}`);
        return;
      }

      const newAptReserves = currentStats.apt_reserves.plus(new Decimal(aptAmount));
      const graduationThreshold = new Decimal("2150000000000"); // 21500 APT in octas
      const isGraduated = newAptReserves.gte(graduationThreshold);

      await prisma.poolStats.update({
        where: { fa_address: faAddress },
        data: {
          apt_reserves: newAptReserves,
          total_volume: {
            increment: new Decimal(aptAmount)
          },
          trade_count: {
            increment: 1
          },
          is_graduated: isGraduated,
          updated_at: new Date()
        }
      });

      if (isGraduated && !currentStats.is_graduated) {
        console.log(`🎓 Pool graduated! FA: ${faAddress}`);
        
        console.log(`📝 Would create PoolGraduated event for FA: ${faAddress}`);
        // Event creation temporarily disabled due to schema issues
      }
    } catch (error) {
      console.error('❌ Error updating pool stats:', error);
    }
  }
}
