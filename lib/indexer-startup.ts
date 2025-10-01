import { IndexerService } from './services/indexer';

// Use global state to persist across hot reloads
const globalForIndexer = globalThis as unknown as {
  indexerService: IndexerService | undefined;
};

let indexerService: IndexerService | null = globalForIndexer.indexerService ?? null;

export async function startIndexer() {
  if (indexerService) {
    console.log('⚠️  Indexer is already running');
    return indexerService;
  }

  try {
    indexerService = new IndexerService();
    globalForIndexer.indexerService = indexerService;
    await indexerService.start();
    console.log('✅ Indexer service started successfully');
    
    // Handle graceful shutdown
    const cleanup = async () => {
      if (indexerService) {
        console.log('🛑 Shutting down indexer...');
        await indexerService.stop();
        indexerService = null;
        globalForIndexer.indexerService = undefined;
      }
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('beforeExit', cleanup);

    return indexerService;
  } catch (error) {
    console.error('❌ Failed to start indexer service:', error);
    throw error;
  }
}

export function getIndexerService() {
  return indexerService;
}
