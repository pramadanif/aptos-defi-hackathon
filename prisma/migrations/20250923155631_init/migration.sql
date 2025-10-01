-- CreateEnum
CREATE TYPE "public"."TradeType" AS ENUM ('BUY', 'SELL', 'MINT', 'BURN');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('CREATE_FA', 'MINT_FA', 'BURN_FA', 'BUY_TOKENS', 'POOL_GRADUATED');

-- CreateTable
CREATE TABLE "public"."FA" (
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 8,
    "max_supply" DECIMAL(65,30),
    "icon_uri" TEXT,
    "project_uri" TEXT,
    "mint_fee_per_unit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FA_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "public"."Trade" (
    "id" TEXT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "transaction_version" TEXT,
    "fa_address" TEXT NOT NULL,
    "user_address" TEXT NOT NULL,
    "apt_amount" DECIMAL(65,30) NOT NULL,
    "token_amount" DECIMAL(65,30) NOT NULL,
    "price_per_token" DECIMAL(65,30) NOT NULL,
    "fee_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "trade_type" "public"."TradeType" NOT NULL DEFAULT 'BUY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PoolStats" (
    "fa_address" TEXT NOT NULL,
    "apt_reserves" DECIMAL(65,30) NOT NULL,
    "total_volume" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "trade_count" INTEGER NOT NULL DEFAULT 0,
    "is_graduated" BOOLEAN NOT NULL DEFAULT false,
    "graduation_threshold" DECIMAL(65,30) NOT NULL DEFAULT 2150000000000,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoolStats_pkey" PRIMARY KEY ("fa_address")
);

-- CreateTable
CREATE TABLE "public"."FAEvent" (
    "id" TEXT NOT NULL,
    "transaction_hash" TEXT NOT NULL,
    "transaction_version" TEXT,
    "fa_address" TEXT NOT NULL,
    "event_type" "public"."EventType" NOT NULL,
    "event_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FAEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_transaction_hash_key" ON "public"."Trade"("transaction_hash");

-- CreateIndex
CREATE INDEX "FAEvent_fa_address_event_type_idx" ON "public"."FAEvent"("fa_address", "event_type");

-- CreateIndex
CREATE INDEX "FAEvent_transaction_hash_idx" ON "public"."FAEvent"("transaction_hash");

-- AddForeignKey
ALTER TABLE "public"."Trade" ADD CONSTRAINT "Trade_fa_address_fkey" FOREIGN KEY ("fa_address") REFERENCES "public"."FA"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PoolStats" ADD CONSTRAINT "PoolStats_fa_address_fkey" FOREIGN KEY ("fa_address") REFERENCES "public"."FA"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FAEvent" ADD CONSTRAINT "FAEvent_fa_address_fkey" FOREIGN KEY ("fa_address") REFERENCES "public"."FA"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
