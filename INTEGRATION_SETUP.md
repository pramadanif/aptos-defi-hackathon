# Aptos DeFi + BullPump FA Indexer Integration

## Setup Environment Variables

Buat file `.env.local` di root directory dengan konfigurasi berikut:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/bullpump_indexer"
DIRECT_URL="postgresql://username:password@localhost:5432/bullpump_indexer"

# Aptos Configuration
APTOS_NODE_URL="https://fullnode.testnet.aptoslabs.com/v1"
BULLPUMP_CONTRACT_ADDRESS="0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257"

# Next.js Configuration
NODE_ENV=development
```

## Database Setup

1. Pastikan PostgreSQL sudah berjalan
2. Buat database `bullpump_indexer`
3. Jalankan migrasi Prisma:

```bash
npm run db:push
```

## Menjalankan Aplikasi

1. **Start Next.js Development Server:**
```bash
npm run dev
```

2. **Start Indexer Service:**
Buka browser dan akses: `http://localhost:3000/api/indexer/start` (POST request)
Atau gunakan curl:
```bash
curl -X POST http://localhost:3000/api/indexer/start
```

## API Endpoints yang Tersedia

### Health Check
- `GET /api/health` - Status aplikasi

### Tokens
- `GET /api/tokens` - List semua tokens
- `GET /api/tokens/trending` - Top 10 tokens berdasarkan volume 24h
- `GET /api/tokens/[address]` - Detail token dan trades terbaru

### Trades
- `GET /api/trades/recent` - 50 trades terbaru
- `GET /api/trades/[faAddress]` - Trades untuk token tertentu

### Indexer
- `POST /api/indexer/start` - Start indexer service
- `GET /api/indexer/start` - Check indexer status

## Fitur Terintegrasi

1. **Frontend Next.js** - UI modern dengan Aptos wallet integration
2. **Backend API** - RESTful API untuk data tokens dan trades
3. **Real-time Indexer** - Monitoring blockchain untuk events BullPump
4. **Database** - PostgreSQL dengan Prisma ORM

## Testing

1. Akses `http://localhost:3000` untuk frontend
2. Test API endpoints di `http://localhost:3000/api/*`
3. Monitor indexer logs di console
