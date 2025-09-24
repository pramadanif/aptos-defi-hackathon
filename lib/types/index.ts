export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginationResponse {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface TokenWithStats {
  address: string;
  name: string;
  symbol: string;
  creator: string;
  created_at: Date;
  pool_stats?: {
    apt_reserves: number;
    total_volume: number;
    trade_count: number;
    is_graduated: boolean;
    updated_at: Date;
  };
  _count?: {
    trades: number;
  };
  volume_24h?: number;
  trade_count_24h?: number;
}

export interface TradeWithToken {
  id: string;
  transaction_hash: string;
  fa_address: string;
  user_address: string;
  apt_amount: number;
  token_amount: number;
  price_per_token: number;
  created_at: Date;
  fa: {
    name: string;
    symbol: string;
  };
}
