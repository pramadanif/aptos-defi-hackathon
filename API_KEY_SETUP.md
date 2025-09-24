# API Key Setup untuk Menghindari Rate Limit

## Ringkasan Perubahan

✅ **API Key Integration**: Indexer dan frontend sekarang mendukung Aptos API key untuk menghindari rate limit
✅ **Branding Update**: Header dan footer diubah dari "Aptos DeFi" ke "BullPump"  
✅ **Button Styling**: Gradient button diubah menjadi solid elegant color
✅ **Dual Mode**: Support dengan dan tanpa API key
✅ **Environment-Only Contract**: Semua hardcoded contract address dihapus, hanya menggunakan env variables
✅ **Smart Contract Update**: Updated untuk smart contract BullPump versi terbaru dengan initial buy feature

## Environment Variables

⚠️ **PENTING**: Semua hardcoded contract address telah dihapus. Sekarang WAJIB menggunakan environment variables.

Tambahkan ke file `.env.local`:

```bash
# Frontend Configuration (WAJIB)
NEXT_PUBLIC_MODULE_ADDR=0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257
NEXT_PUBLIC_APTOS_NODE_URL=https://api.testnet.aptoslabs.com
NEXT_PUBLIC_APTOS_FAUCET_URL=https://faucet.testnet.aptoslabs.com
NEXT_PUBLIC_APTOS_API_KEY=aptoslabs_3At2ZwV4tUq_2vAV5LrjG1tBeqyMD

# Backend Configuration (WAJIB)
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_API_KEY=aptoslabs_3At2ZwV4tUq_2vAV5LrjG1tBeqyMD
BULLPUMP_CONTRACT_ADDRESS=0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257

# Database Configuration (Supabase)
DATABASE_URL="postgresql://postgres.pwgtzottrxyrsstetyps:Akucintahussein1516@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.pwgtzottrxyrsstetyps:Akucintahussein1516@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Contract Address Management

### ✅ Sekarang (Environment-Only)
Semua komponen menggunakan environment variables:

```typescript
// Frontend Components
const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR;

// Backend Indexer  
const BULLPUMP_CONTRACT = process.env.BULLPUMP_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_MODULE_ADDR;
```

### ❌ Sebelumnya (Hardcoded)
```typescript
// Hardcoded - SUDAH DIHAPUS
const MODULE_ADDR = "0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257";
```

### Keuntungan Environment-Only:
1. **Easy Contract Switching**: Ganti contract hanya di `.env.local`
2. **Multi-Environment**: Dev, staging, production bisa pakai contract berbeda
3. **Security**: Tidak ada sensitive data di source code
4. **Flexibility**: Deploy ke network berbeda tanpa code changes

### Error Handling:
- Jika `NEXT_PUBLIC_MODULE_ADDR` tidak set, aplikasi akan throw error
- Portfolio page akan skip BullPump tokens jika env tidak ada
- Indexer akan throw error jika contract address tidak dikonfigurasi

## Smart Contract Updates

### 🆕 **New Features in BullPump Contract**

#### Token Factory Updates:
- **Initial Buy Feature**: Creator bisa langsung buy tokens saat create
- **Function Signature**: `create_fa(name, symbol, icon_uri, project_uri, amount_creator_buy)`
- **Fixed Supply**: Selalu 1 billion tokens dengan 8 decimals
- **Auto Pool**: Otomatis membuat bonding curve pool

#### Bonding Curve Pool Updates:
- **New Events**: `TokenPurchaseEvent` dan `TokenSaleEvent`
- **Enhanced Math**: XYK formula dengan virtual reserves 28.24 APT
- **Graduation**: Otomatis burn remaining tokens saat graduation
- **Fee Structure**: 0.1% fee ke treasury

### 📝 **Frontend Integration Updates**

#### LaunchTokenForm:
- ✅ Added "Initial Buy Amount" field
- ✅ Support optional creator purchase
- ✅ Updated function arguments untuk contract baru

#### BondingCurveTrading:
- ✅ Compatible dengan existing buy/sell functions
- ✅ Real-time event tracking
- ✅ Enhanced graduation detection

#### Indexer Service:
- ✅ Support untuk TokenPurchaseEvent/TokenSaleEvent
- ✅ Backward compatibility dengan old events
- ✅ Enhanced trade tracking

## Commands untuk Development

### 1. Dengan API Key (Recommended)
```bash
npm run dev
```
- Menggunakan API key dari environment variables
- Rate limit protection aktif
- Performa optimal untuk indexing

### 2. Tanpa API Key
```bash
npm run dev:no-api
```
- Menjalankan tanpa API key
- Mungkin mengalami rate limit pada traffic tinggi
- Cocok untuk testing basic functionality

## Cara Kerja API Key Integration

### Backend (Indexer Service)
```typescript
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
```

### Frontend (Components)
```typescript
const config = useMemo(() => {
  const nodeUrl = process.env.NEXT_PUBLIC_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
  const apiKey = process.env.NEXT_PUBLIC_APTOS_API_KEY;
  
  return new AptosConfig({ 
    network: Network.TESTNET,
    fullnode: nodeUrl,
    ...(apiKey && {
      clientConfig: {
        HEADERS: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    })
  });
}, []);
```

## Rate Limit Protection

### Dengan API Key:
- **Limit**: Hingga 2,000,000 Compute Units per 5 menit
- **Indexer**: Polling setiap 3 detik tanpa masalah
- **Frontend**: Request unlimited untuk user interactions

### Tanpa API Key:
- **Limit**: ~100 requests per menit (public endpoint)
- **Indexer**: Mungkin hit rate limit pada traffic tinggi
- **Frontend**: Terbatas untuk operasi heavy

## Monitoring API Usage

### 1. Check Console Logs
```bash
# Indexer akan menampilkan status API key
🌐 REAL-TIME Indexer Configuration:
   Network: testnet
   Node URL: https://fullnode.testnet.aptoslabs.com/v1
   API Key: ✅ Configured (Rate limit protection)
   Contract: 0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257
```

### 2. Error Handling
- Rate limit errors akan ditangkap dan di-log
- Automatic retry dengan exponential backoff
- Graceful degradation jika API key invalid

## Branding Changes

### Header
- Logo: BullPump (sebelumnya: Aptos DeFi)
- Navigation tetap sama

### Footer  
- Brand name: BullPump
- Copyright: © 2024 BullPump. All rights reserved.

### Button Styling
- **Sebelum**: Gradient biru-pink
- **Sesudah**: Solid electric pink (#ff006e)
- Lebih elegant dan consistent

## Troubleshooting

### API Key Tidak Berfungsi
1. Pastikan API key valid dan aktif
2. Check environment variables sudah benar
3. Restart development server

### Rate Limit Masih Terjadi
1. Gunakan `npm run dev` (dengan API key)
2. Check API key quota di Aptos Labs dashboard
3. Kurangi polling frequency jika perlu

### Database Connection Issues
1. Check Supabase connection string
2. Pastikan database accessible
3. Run `npm run db:push` untuk sync schema

## Production Deployment

Untuk production di Vercel, pastikan:
1. Set semua environment variables di Vercel Dashboard
2. API key tersimpan sebagai environment secret
3. Database URL menggunakan connection pooling

## Security Notes

⚠️ **PENTING**: 
- API key adalah credential sensitif
- Jangan commit ke Git
- Gunakan environment variables
- Rotate API key secara berkala
