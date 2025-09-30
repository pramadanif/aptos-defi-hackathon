# ⚡ Ultra-Fast Indexer Mode

BullPump indexer sekarang menggunakan **ULTRA-FAST MODE** dengan delay maksimal **2-5 detik** setelah transaksi on-chain.

## 🚀 Fitur Ultra-Fast

### 1. **Smart Version Tracking**
- **Skip Old History**: Indexer langsung jump ke blockchain version terbaru
- **No Historical Scan**: Tidak memproses transaksi lama untuk maximum speed
- **Recent Continuation**: Jika ada trade dalam 1 jam terakhir, lanjut dari situ
- **Fresh Start**: Jika tidak ada trade recent, start dari (current - 100 transactions)

### 2. **Optimized Performance**
- ⚡ **Polling Interval**: 2 detik (dari 3 detik)
- 📦 **Batch Size**: 300 transaksi per check (dari 200)
- 🎯 **Expected Delay**: 2-5 detik setelah transaksi on-chain
- 🔇 **Reduced Noise**: Hanya log BullPump transactions, skip logging normal scans

### 3. **Automatic Skip Logic**
Indexer akan otomatis skip historical transactions:
```
Current Ledger: 6,888,851,583
Starting From:  6,888,851,483 (latest - 100)
Skipped Range:  0 - 6,888,851,482  ✅ SKIPPED for speed
```

## 📋 Cara Menggunakan

### Restart Dev Server
Setiap kali ganti `.env.local`, **WAJIB restart dev server**:

```bash
# Kill existing dev server
lsof -ti:3000 | xargs kill -9

# Start new dev server
npm run dev
```

### Monitor Indexer
Server akan otomatis start indexer saat `/api/indexer/start` dipanggil.

Output yang akan Anda lihat:
```bash
⚡ ULTRA-FAST Indexer Configuration:
   Network: testnet
   Node URL: https://fullnode.testnet.aptoslabs.com/v1
   API Key: ✅ Configured (Rate limit protection)
   Contract: 0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257
   Polling Interval: 2000ms (⚡ ULTRA-FAST)
   Batch Size: 300 transactions per check
   Expected Delay: ~2-5 seconds after transaction
   Strategy: Skip old history, track latest only

🚀 Starting BullPump indexer...
⚡ ULTRA-FAST MODE: Jumping to latest blockchain version
📍 Current ledger: 6888851583
📍 Starting from: 6888851483 (latest - 100 for safety)
⚠️  Note: Old transactions (v6878M-6888851483) are SKIPPED for speed
```

### Check Indexer Status
```bash
curl http://localhost:3000/api/indexer/start
```

Response:
```json
{
  "success": true,
  "isRunning": true,
  "message": "Indexer service is running"
}
```

## 🎯 Test Real-Time Tracking

### 1. Deploy Token Baru
```bash
# Di frontend: Launch new token
# Contoh: Create token "MyTest" dengan symbol "TEST"
```

### 2. Monitor Console
Dalam **2-5 detik**, Anda akan lihat:
```bash
🎯 [11:17:45 PM] BullPump tx found: 0x7a8b9c... create_fa
🪙 Created new FA: MyTest (TEST) at 0x...
```

### 3. Buy Tokens
```bash
# Di frontend: Buy some tokens
# Contoh: Buy 100 APT worth of tokens
```

Dalam **2-5 detik**:
```bash
🎯 [11:18:02 PM] BullPump tx found: 0x4f5e6d... buy_tokens
💰 Processed buy: 10000000000 tokens for 10000000000 octas
```

## 📊 Performance Comparison

| Mode | Delay | History | Polling | Batch Size |
|------|-------|---------|---------|------------|
| **Old** | 1-2s | ✅ Full scan | 3000ms | 200 tx |
| **Ultra-Fast** | 2-5s | ❌ Skip old | 2000ms | 300 tx |

## ⚠️ Important Notes

### 1. **Historical Data**
- ❌ Old transactions (sebelum indexer start) **TIDAK** akan diproses
- ✅ Hanya NEW transactions (setelah indexer start) yang ditrack
- 💡 Untuk historical data, gunakan script `searchHistoricalTransactions()`

### 2. **First Time Setup**
Jika database kosong, indexer akan start dari (current - 100):
```bash
⚡ ULTRA-FAST MODE: Jumping to latest blockchain version
📍 Starting from: 6888851483 (latest - 100 for safety)
```

### 3. **Continuing Mode**
Jika ada trade dalam 1 jam terakhir, indexer akan continue:
```bash
📍 Continuing from recent trade: 6888850123
```

### 4. **Contract Address**
Pastikan `.env.local` menggunakan contract yang benar:
```env
BULLPUMP_CONTRACT_ADDRESS=0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257
```

## 🔧 Troubleshooting

### Indexer Masih Track Old Version?
```bash
# 1. Kill dev server
lsof -ti:3000 | xargs kill -9

# 2. Verify .env.local
cat .env.local | grep BULLPUMP

# 3. Start fresh
npm run dev
```

### Want to Force Reset?
```bash
# Run reset script
npx tsx lib/reset-indexer.ts
```

### Check Current Blockchain Version
```bash
curl https://fullnode.testnet.aptoslabs.com/v1 | jq '.ledger_version'
```

### Monitor Database
```bash
# Check recent trades
npx prisma studio
# Navigate to: Trade table > Sort by created_at DESC
```

## 🎉 Success Indicators

Indexer berhasil jika Anda lihat:
1. ✅ "ULTRA-FAST MODE: Jumping to latest blockchain version"
2. ✅ Contract address yang benar di console
3. ✅ "Starting from: [high version number]"
4. ✅ BullPump transactions terdeteksi dalam 2-5 detik

## 📝 Logs Explanation

### Normal Scan (Silent)
```bash
# Hanya log setiap 10 checks (random 10%)
⚡ [11:15:30 PM] Scanned 300 tx - Ultra-fast monitoring (v6888851783)
```

### BullPump Transaction Found
```bash
# SELALU log BullPump transactions
🎯 [11:15:45 PM] Found 2 BullPump tx in 300 txs (v6888851983)
🎯 BullPump tx found: 0x7a8b9c... create_fa
🪙 Created new FA: MyTest (TEST) at 0x...
```

## 🚀 Next Steps

1. **Restart dev server** untuk load contract address baru
2. **Deploy test token** untuk verify real-time tracking
3. **Monitor console** untuk melihat transaction detection
4. **Verify database** di Prisma Studio

Indexer sekarang **ultra-fast** dengan delay maksimal **2-5 detik**! 🎉
