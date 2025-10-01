import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const moduleAddr = process.env.NEXT_PUBLIC_MODULE_ADDR;
    
    return NextResponse.json({
      success: true,
      moduleAddr: moduleAddr || "NOT_SET",
      isConfigured: !!(moduleAddr && !moduleAddr.includes("_HERE")),
      expectedAddr: "0x4660906d4ed4062029a19e989e51c814aa5b0711ef0ba0433b5f7487cb03b257",
      allEnvVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    });
  } catch (error: unknown) {
    return NextResponse.json({ 
      error: "Failed to check environment", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
