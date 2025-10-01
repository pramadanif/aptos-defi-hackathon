import { NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// GET /api/tokens/registry - Fetch tokens from BullPump smart contract
export async function GET() {
  try {
    const MODULE_ADDR = process.env.NEXT_PUBLIC_MODULE_ADDR;
    
    if (!MODULE_ADDR) {
      return NextResponse.json({
        success: false,
        error: 'Module address not configured'
      }, { status: 500 });
    }

    // Initialize Aptos client
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);

    // Get token registry from smart contract
    const registry = await aptos.view({
      payload: {
        function: `${MODULE_ADDR}::token_factory::get_registry`,
        typeArguments: [],
        functionArguments: []
      }
    });

    const tokenAddresses = Array.isArray(registry[0]) ? registry[0] as string[] : [];
    console.log("Raw registry response:", registry);
    console.log("Token addresses from registry:", tokenAddresses);
    
    // Filter out obviously invalid addresses before processing
    const validAddresses = tokenAddresses.filter(addr => {
      const addrStr = typeof addr === 'string' ? addr : String(addr);
      // Check if it's at least a reasonable length and contains hex characters
      return addrStr.length >= 10 && /^0x[0-9a-fA-F]+$/.test(addrStr);
    });
    
    console.log("Filtered valid addresses:", validAddresses);
    
    // Fetch metadata for each token
    const tokens = await Promise.all(
      validAddresses.map(async (tokenAddress) => {
        try {
          // Ensure tokenAddress is a string and validate hex format
          let addressStr = typeof tokenAddress === 'string' ? tokenAddress : String(tokenAddress);
          
          // Clean up the address - remove any invalid characters
          addressStr = addressStr.replace(/[^0-9a-fA-Fx]/g, '');
          
          // Ensure it starts with 0x
          if (!addressStr.startsWith('0x')) {
            addressStr = '0x' + addressStr.replace(/^0x/, '');
          }
          
          // Validate hex format (should be 66 characters: 0x + 64 hex chars)
          if (!/^0x[0-9a-fA-F]{64}$/.test(addressStr)) {
            console.warn(`Invalid token address format: ${addressStr}, skipping...`);
            return null;
          }
          
          console.log(`Processing token: ${addressStr}`);
          
          // Get token metadata
          const [nameResult, symbolResult, decimalsResult, iconResult, projectResult] = await Promise.all([
            aptos.view({
              payload: {
                function: "0x1::fungible_asset::name",
                typeArguments: [],
                functionArguments: [addressStr]
              }
            }).catch(() => [""]),
            aptos.view({
              payload: {
                function: "0x1::fungible_asset::symbol",
                typeArguments: [],
                functionArguments: [addressStr]
              }
            }).catch(() => [""]),
            aptos.view({
              payload: {
                function: "0x1::fungible_asset::decimals",
                typeArguments: [],
                functionArguments: [addressStr]
              }
            }).catch(() => [8]),
            aptos.view({
              payload: {
                function: "0x1::fungible_asset::icon_uri",
                typeArguments: [],
                functionArguments: [addressStr]
              }
            }).catch(() => [""]),
            aptos.view({
              payload: {
                function: "0x1::fungible_asset::project_uri",
                typeArguments: [],
                functionArguments: [addressStr]
              }
            }).catch(() => [""]),
          ]);

          // Get bonding curve pool stats
          let poolStats = null;
          try {
            const aptReserves = await aptos.view({
              payload: {
                function: `${MODULE_ADDR}::bonding_curve_pool::get_apt_reserves`,
                typeArguments: [],
                functionArguments: [addressStr]
              }
            });
            
            const tokenReserves = await aptos.view({
              payload: {
                function: `${MODULE_ADDR}::bonding_curve_pool::get_token_reserves`,
                typeArguments: [],
                functionArguments: [addressStr]
              }
            });

            poolStats = {
              aptReserves: aptReserves[0] as string,
              tokenReserves: tokenReserves[0] as string,
              // Calculate market cap and other metrics
              marketCap: 0, // Will be calculated based on reserves
              volume24h: 0, // Would need historical data
              priceChange24h: 0 // Would need historical data
            };
          } catch (poolError) {
            console.warn(`Could not fetch pool stats for ${addressStr}:`, poolError);
          }

          return {
            address: addressStr,
            name: nameResult[0] as string || "Unknown Token",
            symbol: symbolResult[0] as string || "UNK",
            decimals: decimalsResult[0] as number || 8,
            iconUri: iconResult[0] as string || "",
            projectUri: projectResult[0] as string || "",
            poolStats,
            createdAt: new Date().toISOString(), // Would need to get from blockchain events
          };
        } catch (error) {
          console.error(`Error fetching metadata for token ${tokenAddress}:`, error);
          return null;
        }
      })
    );

    const validTokens = tokens.filter(token => token !== null);

    return NextResponse.json({
      success: true,
      data: validTokens,
      count: validTokens.length
    });
  } catch (error) {
    console.error('Error fetching token registry:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch token registry'
    }, { status: 500 });
  }
}
