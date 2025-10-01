# 🔧 Balance Decimals Fix - Using getCoinInfo

## ❌ Problem

**Your Balance** masih menampilkan **0.00** karena menggunakan **hardcoded 8 decimals** untuk semua token.

### Issue:
```typescript
// ❌ WRONG - Hardcoded decimals
const balanceNum = Number(balanceRaw) / 100000000; // Always 8 decimals
```

**Problem:** Tidak semua token menggunakan 8 decimals. Beberapa token mungkin menggunakan 6, 9, atau decimals lainnya.

---

## ✅ Solution Applied

### Use `getCoinInfo()` to Get Correct Decimals

```typescript
// ✅ CORRECT - Dynamic decimals from getCoinInfo
const getUserTokenBalance = async (faObjectAddr: string): Promise<number> => {
  if (!account?.address) return 0;

  try {
    // Get balance from API
    const balanceRaw = await getBalanceFromAPI(account.address, faObjectAddr);
    
    if (balanceRaw === "0") {
      console.log(`💰 No balance for ${faObjectAddr}`);
      return 0;
    }

    // Get coin info to determine correct decimals ⭐
    const coinInfo = await getCoinInfo(faObjectAddr);
    const divisor = Math.pow(10, coinInfo.decimals);
    const balanceNum = Number(balanceRaw) / divisor;
    
    console.log(`💰 User balance for ${faObjectAddr}:`, {
      raw: balanceRaw,
      decimals: coinInfo.decimals,
      formatted: balanceNum.toFixed(4),
      symbol: coinInfo.symbol
    });
    
    return balanceNum;
  } catch (error) {
    console.warn(`Could not get user balance for ${faObjectAddr}:`, error);
    return 0;
  }
};
```

---

## 🎯 How It Works Now

### 1. Get Raw Balance
```typescript
const balanceRaw = await getBalanceFromAPI(account.address, faObjectAddr);
// Example: "1250000000"
```

### 2. Get Token Info
```typescript
const coinInfo = await getCoinInfo(faObjectAddr);
// Example: { name: "ADM", symbol: "ADM", decimals: 8 }
```

### 3. Calculate Correct Balance
```typescript
const divisor = Math.pow(10, coinInfo.decimals); // 10^8 = 100000000
const balanceNum = Number(balanceRaw) / divisor;  // 1250000000 / 100000000 = 12.5
```

### 4. Enhanced Console Logging
```typescript
console.log(`💰 User balance for ${faObjectAddr}:`, {
  raw: "1250000000",
  decimals: 8,
  formatted: "12.5000",
  symbol: "ADM"
});
```

---

## 🧪 Expected Console Output

### For ADM Token:
```bash
💰 User balance for 0xADM_ADDRESS: {
  raw: "1250000000",
  decimals: 8,
  formatted: "12.5000", 
  symbol: "ADM"
}
```

### For APT Coin:
```bash
💰 User balance for 0x1::aptos_coin::AptosCoin: {
  raw: "500000000",
  decimals: 8,
  formatted: "5.0000",
  symbol: "APT"
}
```

### For Token with Different Decimals:
```bash
💰 User balance for 0xTOKEN_ADDRESS: {
  raw: "1000000",
  decimals: 6,
  formatted: "1.0000",
  symbol: "USDC"
}
```

---

## ✅ Benefits

### 1. **Dynamic Decimals**
- ✅ Each token uses correct decimals
- ✅ No more hardcoded 8 decimals
- ✅ Supports any token type

### 2. **Better Debugging**
- ✅ Shows raw balance from API
- ✅ Shows decimals used
- ✅ Shows formatted result
- ✅ Shows token symbol

### 3. **Accurate Balance**
- ✅ Correct calculation for all tokens
- ✅ Matches portfolio page behavior
- ✅ Consistent across app

---

## 🎯 Test Now

1. **Connect wallet** di coin detail page
2. **Check console** untuk melihat detailed balance info
3. **Your Balance** seharusnya menampilkan nilai yang benar
4. **Compare dengan portfolio** - harus sama

### Expected Result:
```
Your Balance: 12.50 ADM ✅ (instead of 0.00)
```

**Balance sekarang menggunakan decimals yang benar dari getCoinInfo!** 🚀
