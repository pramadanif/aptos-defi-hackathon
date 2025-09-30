# ✅ Balance Function Sync - EXACT COPY from Portfolio

## 🎯 Problem Solved

**Your Balance** di coin detail page sekarang menggunakan **EXACT SAME FUNCTION** seperti portfolio page.

## 🔧 Changes Made

### File: `app/coin/[address]/page.tsx`

**Added EXACT COPY of `getBalanceFromAPI` from portfolio:**

```typescript
// Function to get balance using direct API endpoint (EXACT COPY from portfolio)
const getBalanceFromAPI = async (address: string, assetType: string): Promise<string> => {
  try {
    // Clean address - remove 0x prefix if present for URL
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    
    const response = await fetch(
      `https://api.testnet.aptoslabs.com/v1/accounts/${cleanAddress}/balance/${encodeURIComponent(assetType)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json, application/x-bcs'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return "0"; // Asset not found means 0 balance
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // The API returns a simple number as text (e.g., "96394200")
    const balanceText = await response.text();
    const balance = balanceText.trim().replace(/"/g, ''); // Remove quotes if present
    
    console.log(`Balance for ${assetType}: ${balance}`);
    return balance || "0";
  } catch (error) {
    console.warn(`Failed to get balance for ${assetType}:`, error);
    return "0";
  }
};
```

**Updated `getUserTokenBalance` to use the exact same method:**

```typescript
// Function to get user's token balance (wrapper for getBalanceFromAPI)
const getUserTokenBalance = async (faObjectAddr: string): Promise<number> => {
  if (!account?.address) return 0;

  try {
    const balanceRaw = await getBalanceFromAPI(account.address, faObjectAddr);
    const balanceNum = Number(balanceRaw) / 100000000; // 8 decimals
    
    console.log(`💰 User balance for ${faObjectAddr}: ${balanceNum.toFixed(4)}`);
    return balanceNum;
  } catch (error) {
    console.warn(`Could not get user balance for ${faObjectAddr}:`, error);
    return 0;
  }
};
```

## ✅ Result

### Portfolio Page:
```typescript
const balanceRaw = await getBalanceFromAPI(address, assetType);
const amount = Number(balanceRaw) / Math.pow(10, 8);
```

### Coin Detail Page:
```typescript
const balanceRaw = await getBalanceFromAPI(account.address, faObjectAddr);
const balanceNum = Number(balanceRaw) / 100000000; // Same as Math.pow(10, 8)
```

**IDENTICAL METHODS!** ✅

## 🧪 Test Now

1. **Connect wallet** di coin detail page
2. **Check console:** Should see `Balance for 0x...: [raw_balance]`
3. **Check Your Balance:** Should show correct balance (same as portfolio)
4. **Compare with portfolio:** Balance should be identical

## 🎉 Expected Behavior

- ✅ **Portfolio shows balance:** 12.50 KOPI
- ✅ **Coin detail shows balance:** 12.50 KOPI  
- ✅ **Same API endpoint used**
- ✅ **Same error handling**
- ✅ **Same console logging format**

**Balance sekarang KONSISTEN di kedua halaman!** 🚀
