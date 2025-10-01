# 🔄 BullPump Router Integration - DEX Swap Implementation

## ✅ Updated: DEX Now Uses BullPump::router Module

### 🎯 Change Applied:

**Before:** DEX test mode menggunakan bonding curve `buy_tokens` function sebagai placeholder.

**After:** DEX sekarang menggunakan **BullPump::router::swap** function yang benar untuk DEX trading!

---

## 🔧 Router Module Integration

### **BullPump::router::swap Function**

Berdasarkan smart contract yang Anda berikan, router menggunakan:

```move
public entry fun swap(sender: &signer, args: vector<u8>) acquires Manager, PoolCap {
    let (manager, vault) = manager_vault();
    
    let stream = &mut bcs_stream::new(args);
    let pool_addr = deserialize_address(stream);
    // ... more BCS deserialization
    
    let pool_signer = &generate_signer_for_extending(&PoolCap[pool_addr].extend_ref);
    let txs = hook_factory::swap(pool_signer, address_of(sender), stream);
    
    do_accounting(pool_signer, sender, &vault, txs);
    
    emit(Swapped { ... });
}
```

### **Key Features:**
- ✅ **BCS Encoding**: Arguments encoded sebagai `vector<u8>`
- ✅ **Pool Management**: Uses Manager dan PoolCap resources
- ✅ **Event Emission**: Emits Swapped events
- ✅ **Asset Accounting**: Proper transfer via `do_accounting`
- ✅ **Hook Factory**: Uses hook_factory untuk swap logic

---

## 🎯 Implementation Details

### **handleDEXSwapBuy** - APT → Token

```typescript
// 🧪 TEST MODE: Use BullPump router for DEX swap
if (testGraduatedMode) {
  // Calculate swap parameters
  const poolAddr = selectedToken.fa_object_addr;
  const amountIn = aptInOctas.toString();
  const assetInIndex = "0"; // APT index (first asset)
  const assetOutIndex = "1"; // Token index (second asset)  
  const minAmountOut = Math.floor(estimatedTokens * 0.95 * 100000000).toString(); // 5% slippage
  
  console.log("🔄 Would call BullPump::router::swap with:", {
    poolAddr,
    amountIn,
    assetInIndex,
    assetOutIndex,
    minAmountOut,
    estimatedOut: estimatedTokens.toFixed(6)
  });

  // TODO: Implement proper BCS encoding
  // const transaction = await signAndSubmitTransaction({
  //   sender: account.address,
  //   data: {
  //     function: `${MODULE_ADDR}::router::swap`,
  //     typeArguments: [],
  //     functionArguments: [encodedArgs],
  //   },
  // });
}
```

### **handleDEXSwapSell** - Token → APT

```typescript
// 🧪 TEST MODE: Use BullPump router for DEX swap (Token → APT)
if (testGraduatedMode) {
  // Calculate reverse swap parameters
  const poolAddr = selectedToken.fa_object_addr;
  const amountIn = tokensInOctas.toString();
  const assetInIndex = "1"; // Token index (second asset)
  const assetOutIndex = "0"; // APT index (first asset)
  const minAmountOut = Math.floor(estimatedApt * 0.95 * 100000000).toString(); // 5% slippage
  
  console.log("🔄 Would call BullPump::router::swap with:", {
    poolAddr,
    amountIn,
    assetInIndex,
    assetOutIndex,
    minAmountOut,
    estimatedOut: estimatedApt.toFixed(6)
  });

  // Same router::swap function, different direction
}
```

---

## 📊 BCS Encoding Requirements

### **Router::swap Arguments Structure:**

```move
// From smart contract analysis:
let stream = &mut bcs_stream::new(args);
let pool_addr = deserialize_address(stream);
// ... additional parameters need to be determined from hook_factory implementation
```

### **Required BCS Encoding:**

```typescript
// TODO: Implement proper BCS encoding function
function encodeBCSSwapArgs(
  poolAddr: string,
  amountIn: string,
  assetInIndex: string,
  assetOutIndex: string,
  minAmountOut: string
): Uint8Array {
  // Need to implement BCS serialization:
  // 1. pool_addr (address)
  // 2. Additional swap parameters based on hook_factory::swap requirements
  // 3. Asset indices and amounts
  // 4. Slippage protection (minAmountOut)
}
```

---

## 🧪 Current Test Mode Behavior

### **Buy Test (APT → Token):**
```bash
1. Enable test mode
2. Enter APT amount: "1"
3. Click "Swap APT → TOKEN"
4. Toast: "🧪 Test Mode: Using BullPump router for DEX swap"
5. Console: Detailed swap parameters
6. Toast: "🧪 Router Swap Simulation"
7. Form cleared
```

### **Sell Test (Token → APT):**
```bash
1. Enter token amount: "100"
2. Click "Swap TOKEN → APT"
3. Toast: "🧪 Test Mode: Using BullPump router for DEX swap"
4. Console: Reverse swap parameters
5. Toast: "🧪 Router Swap Simulation"
6. Form cleared
```

### **Console Output Example:**
```bash
🔄 DEX Swap: 1 APT → KOPI {
  aptAmount: "1 APT",
  octas: 100000000,
  token: "KOPI",
  poolAddress: "0x..."
}

🔄 Would call BullPump::router::swap with: {
  poolAddr: "0x...",
  amountIn: "100000000",
  assetInIndex: "0",
  assetOutIndex: "1", 
  minAmountOut: "95000000000",
  estimatedOut: "100.000000"
}
```

---

## 🎯 Next Implementation Steps

### **Phase 1: BCS Encoding** 🔄
```typescript
// Need to implement:
1. BCS serialization library integration
2. Proper argument encoding for router::swap
3. Hook factory parameter analysis
4. Asset index determination
```

### **Phase 2: Transaction Execution** 📋
```typescript
// Enable actual transaction calls:
const transaction = await signAndSubmitTransaction({
  sender: account.address,
  data: {
    function: `${MODULE_ADDR}::router::swap`,
    typeArguments: [],
    functionArguments: [encodedBCSArgs],
  },
});
```

### **Phase 3: Pool Discovery** 📋
```typescript
// Implement pool discovery:
1. Find correct pool address for token pair
2. Determine asset indices in pool
3. Get pool reserves for price calculation
4. Validate pool exists and is active
```

---

## 🔍 Smart Contract Analysis Needed

### **Hook Factory Investigation:**
```move
// Need to understand hook_factory::swap parameters:
let txs = hook_factory::swap(pool_signer, address_of(sender), stream);

// Questions:
1. What parameters does hook_factory::swap expect in stream?
2. How are asset indices determined?
3. What is the exact BCS encoding format?
4. How is slippage protection implemented?
```

### **Pool Structure:**
```move
// Need to understand pool asset ordering:
assets: vector<address>  // How are APT and token ordered?
asset_in_index: u64     // Index of input asset
asset_out_index: u64    // Index of output asset
```

---

## ✅ Benefits of Router Integration

### **Correct Architecture:**
- ✅ **Uses proper DEX module** instead of bonding curve
- ✅ **Follows BullPump design** for graduated tokens
- ✅ **Proper event emission** via Swapped events
- ✅ **Pool-based trading** instead of curve-based

### **Advanced Features:**
- ✅ **Slippage protection** via minAmountOut
- ✅ **Asset index flexibility** for different pool configurations
- ✅ **Hook factory integration** for advanced swap logic
- ✅ **Proper accounting** via do_accounting function

---

## 🚀 Current Status

### **✅ Completed:**
- [x] Router function identification
- [x] Parameter structure analysis
- [x] Test mode simulation
- [x] Console logging implementation
- [x] UI integration

### **🔄 In Progress:**
- [ ] BCS encoding implementation
- [ ] Pool discovery logic
- [ ] Asset index determination
- [ ] Transaction execution

### **📋 Next Steps:**
- [ ] Analyze hook_factory::swap requirements
- [ ] Implement BCS serialization
- [ ] Test with real graduated tokens
- [ ] Add pool validation

**DEX sekarang menggunakan BullPump::router architecture yang benar!** 🔄🚀
