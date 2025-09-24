# Deploy Aptos DeFi ke Vercel

## Ringkasan Jawaban

**✅ Ya, Anda bisa menjalankan semuanya dengan `npm run dev` saja untuk development!**

**✅ Ya, frontend dan backend indexer bisa berjalan di Vercel dengan setup yang tepat!**

## Development (Local)

### 1. Setup Environment
```bash
# Copy environment variables
cp .env.example .env.local

# Setup database
npm run db:push

# Start development server
npm run dev
```

### 2. Start Indexer (Sekali saja)
```bash
# Via curl
curl -X POST http://localhost:3000/api/indexer/start

# Atau buka di browser
http://localhost:3000/api/indexer/start
```

Setelah indexer di-start, dia akan terus berjalan selama dev server aktif.

## Production (Vercel)

### 1. Environment Variables di Vercel
Set environment variables berikut di Vercel Dashboard:

```bash
DATABASE_URL="postgresql://username:password@host:5432/database"
DIRECT_URL="postgresql://username:password@host:5432/database"
APTOS_NODE_URL="https://fullnode.testnet.aptoslabs.com/v1"
BULLPUMP_CONTRACT_ADDRESS="0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257"
NODE_ENV="production"
```

### 2. Database Setup
Gunakan database PostgreSQL yang hosted seperti:
- **Neon** (Recommended - Free tier tersedia)
- **Supabase** 
- **PlanetScale**
- **Railway**

### 3. Deploy ke Vercel

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Via GitHub Integration
1. Push code ke GitHub
2. Connect repository di Vercel Dashboard
3. Deploy otomatis

### 4. Indexer di Production

Indexer akan berjalan dengan **Vercel Cron Jobs**:
- **Frequency**: Setiap 5 menit
- **Duration**: Maksimal 4 menit per run
- **Endpoint**: `/api/indexer/cron`
- **Method**: Batch processing (bukan continuous polling)

## Arsitektur Hybrid

### Development Mode
```
npm run dev → Next.js Server → Continuous Indexer
```

### Production Mode (Vercel)
```
Vercel Cron → /api/indexer/cron → Batch Indexer (4 min)
Frontend → Vercel Serverless Functions → Database
```

## Fitur yang Didukung

### ✅ Yang Berfungsi di Vercel:
- Frontend React/Next.js
- API Routes untuk tokens, trades, health check
- Database operations via Prisma
- Wallet integration
- Periodic indexing via cron jobs

### ⚠️ Perbedaan dengan Local:
- **Local**: Real-time indexing (3 detik interval)
- **Vercel**: Batch indexing (5 menit interval)
- **Local**: Continuous process
- **Vercel**: Serverless functions dengan timeout

## Monitoring & Debugging

### 1. Check Indexer Status
```bash
# Local
curl http://localhost:3000/api/indexer/start

# Production
curl https://your-app.vercel.app/api/indexer/start
```

### 2. Manual Trigger Cron
```bash
# Trigger manual indexing
curl https://your-app.vercel.app/api/indexer/cron
```

### 3. View Logs
- **Local**: Terminal console
- **Vercel**: Functions tab di Vercel Dashboard

## Optimasi untuk Vercel

1. **Database Connection Pooling**: Menggunakan Prisma connection pooling
2. **Serverless Functions**: Optimized untuk cold starts
3. **Batch Processing**: Mengurangi function invocations
4. **Error Handling**: Graceful degradation jika indexer gagal

## Kesimpulan

**Untuk Development**: `npm run dev` sudah cukup, indexer terintegrasi.

**Untuk Production**: Deploy ke Vercel dengan cron jobs untuk indexing otomatis.

Aplikasi ini **fully compatible** dengan Vercel dan akan berfungsi dengan baik sebagai full-stack dApp!
