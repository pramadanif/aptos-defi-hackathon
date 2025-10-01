import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('address');
    
    if (!tokenAddress) {
      return NextResponse.json({ error: "Token address is required" }, { status: 400 });
    }

    const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR;
    if (!MODULE_ADDR) {
      return NextResponse.json({ error: "MODULE_ADDR not configured" }, { status: 500 });
    }

    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);

    console.log(`Debugging token: ${tokenAddress}`);
    console.log(`Module address: ${MODULE_ADDR}`);

    // Test 1: Check if token exists in registry
    try {
      const registry = await aptos.view({
        payload: {
          function: `${MODULE_ADDR}::token_factory::get_registry`,
          typeArguments: [],
          functionArguments: []
        }
      });
      
      const tokenAddresses = Array.isArray(registry[0]) ? registry[0] as string[] : [];
      const isInRegistry = tokenAddresses.some(addr => {
        const cleanAddr = typeof addr === 'string' ? addr : String(addr);
        return cleanAddr === tokenAddress;
      });
      
      console.log("Registry check:", { isInRegistry, totalTokens: tokenAddresses.length });
    } catch (registryError) {
      console.error("Registry error:", registryError);
    }

    // Test 2: Try to get token metadata
    const metadata: Record<string, unknown> = {};
    try {
      const nameResult = await aptos.view({
        payload: {
          function: "0x1::fungible_asset::name",
          typeArguments: [],
          functionArguments: [tokenAddress]
        }
      });
      metadata.name = nameResult[0];
    } catch (e: unknown) {
      metadata.nameError = e instanceof Error ? e.message : String(e);
    }

    try {
      const symbolResult = await aptos.view({
        payload: {
          function: "0x1::fungible_asset::symbol",
          typeArguments: [],
          functionArguments: [tokenAddress]
        }
      });
      metadata.symbol = symbolResult[0];
    } catch (e: unknown) {
      metadata.symbolError = e instanceof Error ? e.message : String(e);
    }

    try {
      const decimalsResult = await aptos.view({
        payload: {
          function: "0x1::fungible_asset::decimals",
          typeArguments: [],
          functionArguments: [tokenAddress]
        }
      });
      metadata.decimals = decimalsResult[0];
    } catch (e: unknown) {
      metadata.decimalsError = e instanceof Error ? e.message : String(e);
    }

    // Test 3: Try to get bonding curve data
    const bondingCurve: Record<string, unknown> = {};
    try {
      const aptReserves = await aptos.view({
        payload: {
          function: `${MODULE_ADDR}::bonding_curve_pool::get_apt_reserves`,
          typeArguments: [],
          functionArguments: [tokenAddress]
        }
      });
      bondingCurve.aptReserves = aptReserves[0];
    } catch (e: unknown) {
      bondingCurve.aptReservesError = e instanceof Error ? e.message : String(e);
    }

    try {
      const tokenReserves = await aptos.view({
        payload: {
          function: `${MODULE_ADDR}::bonding_curve_pool::get_token_reserves`,
          typeArguments: [],
          functionArguments: [tokenAddress]
        }
      });
      bondingCurve.tokenReserves = tokenReserves[0];
    } catch (e: unknown) {
      bondingCurve.tokenReservesError = e instanceof Error ? e.message : String(e);
    }

    // Test 4: Check account balance for a test address
    const testAddress = "0xcd349975d4c757e1516b0ba20b104183875454500ed8a43241d95e256e16fd1eea";
    let balance = null;
    try {
      const balanceResponse = await fetch(
        `https://api.testnet.aptoslabs.com/v1/accounts/${testAddress.startsWith('0x') ? testAddress.slice(2) : testAddress}/balance/${tokenAddress}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (balanceResponse.ok) {
        balance = await balanceResponse.json();
      } else {
        balance = { error: `HTTP ${balanceResponse.status}` };
      }
    } catch (e: unknown) {
      balance = { error: e instanceof Error ? e.message : String(e) };
    }

    return NextResponse.json({
      success: true,
      tokenAddress,
      metadata,
      bondingCurve,
      balance,
      moduleAddr: MODULE_ADDR
    });

  } catch (error: unknown) {
    console.error("Debug error:", error);
    return NextResponse.json({ 
      error: "Debug failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
