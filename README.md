# 🚀 ArgoPump - Bonding Curve Token Launchpad on Aptos

<div align="center">

![ArgoPump Banner](https://i.pinimg.com/736x/8f/d5/b9/8fd5b957fcce04f15127e7b363254ee8.jpg)

**The Ultimate Bonding Curve Token Launchpad on Aptos Blockchain**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Aptos](https://img.shields.io/badge/Aptos-Testnet-green)](https://aptoslabs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Smart Contract](#-Smart-Contract)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Smart Contract Integration](#-smart-contract-integration)
- [Real-Time Indexer](#-real-time-indexer)
- [DEX Integration](#-dex-integration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ArgoPump** is a cutting-edge token launchpad built on the Aptos blockchain, featuring an innovative bonding curve mechanism for fair token distribution and price discovery. The platform enables creators to launch tokens instantly while providing traders with a seamless, low-slippage trading experience.

### Why ArgoPump?

- **🔄 Bonding Curve Mechanism** - Fair price discovery through XYK (x*y=k) automated market maker formula
- **⚡ Real-Time Trading** - Sub-second transaction confirmation with instant UI updates
- **🎓 Graduation System** - Automatic migration to DEX pools when reaching 21,500 APT threshold
- **📊 Advanced Analytics** - Comprehensive token metrics, trading volume, and pool statistics
- **🔗 Blockchain-First** - Direct smart contract integration with no intermediaries

---

## 📃 Smart Contract

For the Smart Contract Detaile go here: [Link](https://github.com/HusseinHato/argopump)

---

## ✨ Key Features

### 🚀 Token Launchpad
- **Instant Token Creation** - Launch fungible assets (FA) in seconds
- **Fixed Supply** - 1 billion tokens with 8 decimals
- **Initial Buy Option** - Creators can purchase tokens immediately at launch
- **Customizable Metadata** - Token name, symbol, icon URI, and project URI
- **No Fees** - Zero minting fees for token creation

### 💹 Bonding Curve Trading
- **XYK Formula** - Industry-standard automated market maker (AMM) algorithm
- **Virtual Reserves** - 28.24 APT virtual reserves for price stability
- **Low Fees** - Only 0.1% trading fee
- **Slippage Protection** - Configurable slippage tolerance (5% default)
- **Real-Time Pricing** - Live price updates based on pool reserves

### 🎓 Graduation Mechanism
- **Automatic Threshold** - Graduates to DEX at 21,500 APT
- **Token Burn** - Remaining tokens burned upon graduation
- **DEX Pool Creation** - Seamless migration to liquidity pools
- **Progress Tracking** - Visual indicators showing graduation progress

### 📊 Portfolio Management
- **Multi-Wallet Support** - Petra, Martian, Pontem wallets
- **Real-Time Balances** - Live balance updates from blockchain
- **Token Discovery** - Automatic detection of BullPump tokens
- **Portfolio Analytics** - Total value, asset distribution, P&L tracking

### 🔍 Search & Discovery
- **Real-Time Search** - Debounced search with autocomplete
- **Trending Tokens** - Top tokens by volume and trade count
- **Token Details** - Comprehensive coin information pages
- **Trade History** - Complete transaction history with explorer links

### ⚡ Real-Time Indexer
- **1-Second Polling** - Ultra-fast blockchain monitoring
- **Instant Detection** - 1-3 second delay after on-chain confirmation
- **Event Tracking** - All BullPump events (Create, Buy, Sell, Graduation)
- **Auto-Start** - Automatic initialization on server startup
- **Smart Resume** - Continues from last processed transaction

### 🎨 Modern UI/UX
- **Responsive Design** - Mobile-first, works on all devices
- **Dark Mode** - Built-in theme support
- **Animated Transitions** - Smooth animations with Framer Motion
- **3D Effects** - Three.js powered visual effects
- **Professional Design** - Clean, elegant interface

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   LaunchPad   │  │   Trading    │  │   Portfolio     │  │
│  └───────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│          │                  │                   │           │
│          └──────────────────┼───────────────────┘           │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │   Wallet SDK    │                      │
│                    │  (Aptos Labs)   │                      │
│                    └────────┬────────┘                      │
└─────────────────────────────┼───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        │            ┌────────▼────────┐            │
        │            │   API Routes    │            │
        │            │   (Next.js)     │            │
        │            └────────┬────────┘            │
        │                     │                     │
        │        ┌────────────┼────────────┐        │
        │        │            │            │        │
  ┌─────▼─────┐  │  ┌────────▼────────┐  │  ┌─────▼──────┐
  │  Indexer  │──┼──│    Database     │──┼──│   Aptos    │
  │  Service  │  │  │  (PostgreSQL)   │  │  │ Blockchain │
  └───────────┘  │  └─────────────────┘  │  └────────────┘
                 │                        │
                 │  ┌─────────────────┐  │
                 └──│     Prisma      │──┘
                    │      ORM        │
                    └─────────────────┘
```

### Data Flow

```
┌──────────────┐
│    User      │
└──────┬───────┘
       │ 1. Interact
       ▼
┌──────────────────┐
│   React UI       │
└──────┬───────────┘
       │ 2. Call API / Smart Contract
       ▼
┌─────────────────────────────────┐
│   API Routes / Wallet Adapter   │
└──────┬──────────────────┬───────┘
       │                  │
       │ 3. Query DB      │ 4. Sign Transaction
       ▼                  ▼
┌──────────────┐   ┌────────────────┐
│  PostgreSQL  │   │ Aptos Blockchain│
└──────────────┘   └────────┬────────┘
       ▲                    │
       │ 6. Store Data      │ 5. Emit Events
       │                    ▼
       └────────────┌───────────────┐
                    │  Indexer      │
                    │  (Real-Time)  │
                    └───────────────┘
```

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 15.5](https://nextjs.org/)** - React framework with App Router
- **[React 19.1](https://reactjs.org/)** - UI library
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion 12.23](https://www.framer.com/motion/)** - Animation library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon library
- **[Three.js 0.179](https://threejs.org/)** - 3D graphics library

### Backend
- **[Prisma 6.16](https://www.prisma.io/)** - Type-safe ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Node.js](https://nodejs.org/)** - JavaScript runtime

### Blockchain
- **[Aptos SDK 5.1](https://github.com/aptos-labs/aptos-ts-sdk)** - Aptos TypeScript SDK
- **[Wallet Adapter 7.0](https://github.com/aptos-labs/aptos-wallet-adapter)** - Multi-wallet support
- **[BullPump Contract](https://explorer.aptoslabs.com/)** - Custom Move smart contracts

### DevOps
- **[Vercel](https://vercel.com/)** - Hosting platform
- **[Supabase](https://supabase.com/)** - PostgreSQL hosting
- **[Turbopack](https://turbo.build/)** - Fast bundler

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/) or use [Supabase](https://supabase.com/)
- **npm or yarn** - Package manager
- **Git** - Version control

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/argopump.git
cd argopump
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

#### 3. Setup Environment Variables

Create `.env.local` file in the root directory:

```env
# ═══════════════════════════════════════════════════════
#  Frontend Configuration
# ═══════════════════════════════════════════════════════
NEXT_PUBLIC_MODULE_ADDR=0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257
NEXT_PUBLIC_APTOS_NODE_URL=https://api.testnet.aptoslabs.com
NEXT_PUBLIC_APTOS_FAUCET_URL=https://faucet.testnet.aptoslabs.com
NEXT_PUBLIC_APTOS_API_KEY=your_aptos_api_key_here

# ═══════════════════════════════════════════════════════
#  Backend Configuration
# ═══════════════════════════════════════════════════════
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_API_KEY=your_aptos_api_key_here
BULLPUMP_CONTRACT_ADDRESS=0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257

# Optional: Router Module (for DEX swaps)
NEXT_PUBLIC_ARGO_ROUTER_ADDR=0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257

# ═══════════════════════════════════════════════════════
#  Database Configuration (Supabase)
# ═══════════════════════════════════════════════════════
DATABASE_URL="postgresql://username:password@host:6543/database?pgbouncer=true"
DIRECT_URL="postgresql://username:password@host:5432/database"

# ═══════════════════════════════════════════════════════
#  Server Configuration
# ═══════════════════════════════════════════════════════
PORT=3000
NODE_ENV=development
```

> **Get Aptos API Key**: Visit [Aptos Labs Developer Portal](https://developers.aptoslabs.com/) to get your free API key

#### 4. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

#### 5. Start Development Server

```bash
npm run dev
```

The application will be available at **[http://localhost:3000](http://localhost:3000)**

#### 6. Start Real-Time Indexer

The indexer starts automatically when the server runs. Verify it's running:

```bash
curl http://localhost:3000/api/indexer/status
```

---

## 🔗 Smart Contract Integration

### Contract Address

```
Module: 0xf937c2d4a8ed5d30141b4911593543dd5975eab3a0e6d75105783205996e516f
Network: Aptos Testnet
```

### Modules

#### 1. Token Factory (`token_factory`)

**Create Fungible Asset**
```move
public entry fun create_fa(
    creator: &signer,
    name: String,
    symbol: String,
    icon_uri: String,
    project_uri: String,
    amount_creator_buy: u64
)
```

#### 2. Bonding Curve Pool (`bonding_curve_pool`)

**Buy Tokens**
```move
public entry fun buy_tokens(
    buyer: &signer,
    fa_obj_addr: address,
    amount: u64
)
```

**Get Pool Reserves**
```move
#[view]
public fun get_apt_reserves(fa_obj_addr: address): u64
```

**Get Token Balance**
```move
#[view]
public fun get_token_balance(
    user_addr: address,
    fa_obj_addr: address
): u64
```

#### 3. Router (`router`) - DEX Trading

**Swap Assets**
```move
public entry fun swap(
    sender: &signer,
    args: vector<u8>  // BCS encoded: pool_addr, asset_in_idx, asset_out_idx, amount_in, min_amount_out
)
```

### Events

```move
// Token Creation
struct CreateFAEvent {
    creator_addr: address,
    fa_obj: Object<Metadata>,
    max_supply: u128,
    name: String,
    symbol: String,
    decimals: u8,
    icon_uri: String,
    project_uri: String
}

// Token Purchase
struct TokenPurchaseEvent {
    buyer: address,
    fa_object: address,
    apt_in: u64,
    tokens_out: u64
}

// Token Sale
struct TokenSaleEvent {
    seller: address,
    fa_object: address,
    tokens_in: u64,
    apt_out: u64
}

// Pool Graduation
struct PoolGraduatedEvent {
    fa_obj: address,
    final_apt_reserves: u64,
    tokens_burned: u64
}
```

### Bonding Curve Math

**XYK Formula**: `x * y = k`

```typescript
// Price Calculation
const x = aptReserves + VIRTUAL_APT_RESERVES; // 28.24 APT
const y = tokenSupply;
const k = x * y;

// Buy Tokens
const tokensOut = (y * aptIn) / (x + aptIn);

// Sell Tokens (not available in bonding curve, only DEX)
const aptOut = (x * tokensIn) / (y + tokensIn);
```

**Graduation Threshold**: 21,500 APT in pool reserves

---

## ⚡ Real-Time Indexer

### Overview

ArgoPump features a **real-time blockchain indexer** that monitors Aptos blockchain with **1-second polling** and detects transactions with **1-3 second delay**. Due to Vercel Limitation the demo indexer is delayed for 5 - 10 minutes.

### Key Features

- **⚡ 1-Second Polling** - Checks blockchain every second
- **📦 Batch Processing** - 500 transactions per check
- **🎯 Smart Initialization** - Starts from latest, skips old history
- **🔄 Auto-Resume** - Continues from last processed transaction
- **📊 Event Detection** - Tracks all BullPump events
- **🚀 Auto-Start** - Initializes automatically on server startup

### Configuration

```typescript
// lib/services/indexer.ts
const POLLING_INTERVAL = 1000; // 1 second
const BATCH_SIZE = 500; // transactions per check
const GRADUATION_THRESHOLD = 21500; // APT
```

### Monitoring

Check indexer status:
```bash
GET /api/indexer/status
```

Response:
```json
{
  "success": true,
  "indexer": {
    "isRunning": true,
    "mode": "real-time",
    "pollingInterval": "1000ms",
    "batchSize": 500
  },
  "database": {
    "totalTokens": 45,
    "totalTrades": 1234,
    "recentTrades": 12,
    "lastTradeAt": "2025-01-01T07:03:45.123Z"
  },
  "performance": {
    "expectedDelay": "1-3 seconds",
    "isHealthy": true
  }
}
```

### Events Tracked

- ✅ `CreateFAEvent` - Token creation
- ✅ `TokenPurchaseEvent` - Buy transactions
- ✅ `TokenSaleEvent` - Sell transactions
- ✅ `PoolGraduatedEvent` - Token graduation
- ✅ `MintFAEvent` - Token minting
- ✅ `BurnFAEvent` - Token burning

---

## 🔄 DEX Integration

### Graduated Token Trading

When a token reaches 21,500 APT threshold, it **graduates** from bonding curve to DEX pools. Currently we are integrated with **TAPP Exchange** for the DEX interactions.

### DEX Swap Implementation

**BCS Encoding for Router**:
```typescript
// Swap Arguments Structure:
// [pool_addr (32 bytes)] + [asset_in_index (1 byte)] + [asset_out_index (1 byte)] + 
// [amount_in (8 bytes, LE)] + [min_amount_out (8 bytes, LE)]

const encodeRouterSwapArgs = (
  poolAddr: string,
  assetInIndex: number,
  assetOutIndex: number,
  amountIn: bigint,
  minAmountOut: bigint
): number[] => {
  const parts: number[] = [];
  
  // Pool address (32 bytes)
  const poolAddrBytes = hexToBytes32(poolAddr);
  parts.push(...Array.from(poolAddrBytes));
  
  // Asset indices (1 byte each)
  parts.push(assetInIndex & 0xff);
  parts.push(assetOutIndex & 0xff);
  
  // Amounts (8 bytes each, little endian)
  parts.push(...Array.from(encodeU64LE(amountIn)));
  parts.push(...Array.from(encodeU64LE(minAmountOut)));
  
  return parts;
};
```

**Asset Indices**:
- APT = 0
- Token = 1

**Slippage Protection**: 5% default tolerance

### UI Features

- **Visual Differentiation** - Green gradient for graduated tokens
- **Swap Interface** - "Swap APT → TOKEN" instead of "Buy"
- **Explorer Links** - Direct links to transaction explorer
- **Real-Time Updates** - Balance refreshes after swaps

---

## 📡 API Documentation

### Token Endpoints

#### Get All Tokens
```http
GET /api/tokens
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "address": "0x...",
      "name": "MyToken",
      "symbol": "MTK",
      "creator": "0x...",
      "decimals": 8,
      "pool_stats": {
        "apt_reserves": "50000000000",
        "total_volume": "100000000000",
        "trade_count": 245,
        "is_graduated": false
      }
    }
  ]
}
```

#### Get Token Details
```http
GET /api/tokens/[address]
```

#### Search Tokens
```http
GET /api/tokens/search?q=query
```

#### Get Trending Tokens
```http
GET /api/tokens/trending
```

### Trade Endpoints

#### Get Recent Trades
```http
GET /api/trades/recent?limit=50
```

#### Get Token Trades
```http
GET /api/trades/[tokenAddress]
```

### Indexer Endpoints

#### Check Status
```http
GET /api/indexer/status
```

#### Start Indexer (Manual)
```http
POST /api/indexer/start
```

#### Cron Job (Vercel)
```http
GET /api/indexer/cron
```

---

## 🗄 Database Schema

### Models

```prisma
model FA {
  address           String        @id
  name              String
  symbol            String
  creator           String
  decimals          Int           @default(8)
  max_supply        Decimal?
  icon_uri          String?
  project_uri       String?
  mint_fee_per_unit Decimal       @default(0)
  created_at        DateTime      @default(now())
  
  trades            Trade[]
  pool_stats        PoolStats?
  events            FAEvent[]
}

model Trade {
  id                  String      @id @default(cuid())
  transaction_hash    String      @unique
  transaction_version String?
  fa_address          String
  user_address        String
  apt_amount          Decimal
  token_amount        Decimal
  price_per_token     Decimal
  fee_amount          Decimal     @default(0)
  trade_type          TradeType   @default(BUY)
  created_at          DateTime    @default(now())
  
  fa                  FA          @relation(fields: [fa_address], references: [address])
}

model PoolStats {
  fa_address            String      @id
  apt_reserves          Decimal
  total_volume          Decimal     @default(0)
  trade_count           Int         @default(0)
  is_graduated          Boolean     @default(false)
  graduation_threshold  Decimal     @default(2150000000000)
  dex_pool_addr         String?     // DEX pool address after graduation
  updated_at            DateTime    @updatedAt
  
  fa                    FA          @relation(fields: [fa_address], references: [address])
}

enum TradeType {
  BUY
  SELL
  MINT
  BURN
}

enum EventType {
  CREATE_FA
  MINT_FA
  BURN_FA
  BUY_TOKENS
  POOL_GRADUATED
}
```

---

## 🚢 Deployment

### Vercel Deployment

#### 1. Prerequisites
- Vercel account
- GitHub repository
- PostgreSQL database (Supabase recommended)

#### 2. Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```env
# Frontend
NEXT_PUBLIC_MODULE_ADDR
NEXT_PUBLIC_APTOS_NODE_URL
NEXT_PUBLIC_APTOS_API_KEY
NEXT_PUBLIC_ARGO_ROUTER_ADDR

# Backend
APTOS_NODE_URL
APTOS_API_KEY
BULLPUMP_CONTRACT_ADDRESS

# Database
DATABASE_URL
DIRECT_URL

# Server
NODE_ENV=production
```

#### 3. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository in Vercel Dashboard for automatic deployments.

#### 4. Setup Cron Job

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/indexer/cron",
    "schedule": "*/5 * * * *"
  }]
}
```

### Local vs Production

| Feature | Local | Production (Vercel) |
|---------|-------|---------------------|
| **Indexer Mode** | Real-time (1s polling) | Batch (5min cron) |
| **Expected Delay** | 1-3 seconds | 5-10 minutes |
| **Database** | Local PostgreSQL | Supabase/Neon |
| **Server** | Node.js | Serverless Functions |

---

## 📂 Project Structure

```
aptos-defi/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── debug/                # Debug utilities
│   │   ├── health/               # Health check endpoint
│   │   ├── indexer/              # Indexer endpoints (start, status, cron)
│   │   ├── tokens/               # Token endpoints (list, detail, search, trending)
│   │   └── trades/               # Trade endpoints (recent trades)
│   ├── coin/[address]/           # Token detail page with trading
│   ├── bonding-curve/            # Trading dashboard page
│   ├── launch/                   # Token creation launchpad
│   ├── portfolio/                # User portfolio page
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page with hero
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Radix UI components (48 components)
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── tabs.tsx              # Tabs component
│   │   └── ...                   # Other UI primitives
│   ├── wallet/                   # Wallet integration
│   │   └── AptosWalletProvider.tsx
│   ├── BondingCurveTrading.tsx   # Trading interface component
│   ├── Header.tsx                # Navigation header with search
│   ├── Footer.tsx                # Footer component
│   ├── HeroSection.tsx           # Landing page hero
│   ├── TrendingSection.tsx       # Trending tokens display
│   ├── TokenCard.tsx             # Token display card
│   ├── LaunchTokenForm.tsx       # Token creation form
│   ├── TradingDashboard.tsx      # Trading dashboard
│   ├── ThemeProvider.tsx         # Dark mode provider
│   ├── BackgroundLiquidChrome.tsx # 3D background effects
│   └── BackgroundParticles.tsx   # Particle effects
├── lib/                          # Utilities & services
│   ├── services/                 # Business logic services
│   │   └── indexer.ts            # Real-time blockchain indexer
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # Shared types
│   ├── prisma.ts                 # Prisma database client
│   ├── indexer-startup.ts        # Indexer initialization
│   └── reset-indexer.ts          # Indexer reset utility
├── prisma/                       # Database configuration
│   ├── schema.prisma             # Database schema (FA, Trade, PoolStats)
│   └── migrations/               # Migration files
├── public/                       # Static assets
│   └── ...                       # Images, icons, etc.
├── .env.local                    # Environment variables (local)
├── .env.example                  # Environment template
├── vercel.json                   # Vercel deployment config
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies & scripts
├── eslint.config.mjs             # ESLint configuration
└── postcss.config.mjs            # PostCSS configuration
```

### Key Directories Explained

**`app/api/`** - Backend API routes
- `indexer/` - Blockchain indexer management (start, status, cron job)
- `tokens/` - Token operations (list all, get details, search, trending)
- `trades/` - Trading history and recent trades
- `health/` - Application health check
- `debug/` - Development debugging tools

**`components/ui/`** - 48+ Reusable UI components
- Built with Radix UI primitives
- Fully accessible and customizable
- Consistent design system

**`lib/services/`** - Core business logic
- `indexer.ts` - Real-time blockchain event monitoring (1s polling)

**`prisma/`** - Database layer
- Schema defines FA tokens, trades, pool stats, and events
- Migrations track database changes

**Documentation Files**
- `README.md` - Main documentation (this file)
- `API_KEY_SETUP.md` - Aptos API key configuration
- `VERCEL_DEPLOYMENT.md` - Deployment guide
- `ROUTER_IMPLEMENTATION.md` - DEX router integration
- `ULTRA_FAST_INDEXER.md` - Indexer performance guide
- And more... (see root directory)
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork the Repository

```bash
git clone https://github.com/yourusername/argopump.git
cd argopump
```

### 2. Create a Branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes

- Write clean, documented code
- Follow existing code style
- Add tests if applicable
- Update documentation

### 4. Commit Changes

```bash
git add .
git commit -m "Add amazing feature"
```

### 5. Push and Create PR

```bash
git push origin feature/amazing-feature
```

Then open a Pull Request on GitHub.

### Code Style

- **TypeScript** - Strict mode enabled
- **ESLint** - Follow Next.js recommended rules
- **Prettier** - Auto-format on save
- **Naming** - camelCase for variables, PascalCase for components

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Aptos Labs** - For the amazing blockchain infrastructure
- **Next.js Team** - For the incredible React framework
- **Vercel** - For seamless deployment
- **Prisma** - For type-safe database access
- **Radix UI** - For accessible component primitives
- **God** - For Giving us life to make this dapp

---

<div align="center">

**Built with ❤️ by the ArgoPump Team**

[Website](https://argopump.io) • [Documentation](./docs) • [Twitter](https://twitter.com/argopump) • [Discord](https://discord.gg/argopump)

</div>
