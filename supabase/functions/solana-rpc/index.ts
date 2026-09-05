const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, solana-client",
};

const NETWORK_ENDPOINTS: Record<string, string[]> = {
  devnet: [
    "https://api.devnet.solana.com",
    "https://devnet.helius-rpc.com/?api-key=demo",
  ],
  testnet: [
    "https://api.testnet.solana.com",
  ],
  mainnet: [
    "https://api.mainnet-beta.solana.com",
    "https://rpc.ankr.com/solana",
    "https://solana-mainnet.g.alchemy.com/v2/demo",
  ],
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();

    // Determine network from URL query param (?network=devnet) or solana-client header
    const url = new URL(req.url);
    const network = url.searchParams.get("network") || req.headers.get("solana-client") || "mainnet";
    const endpoints = NETWORK_ENDPOINTS[network] || NETWORK_ENDPOINTS.mainnet;

    console.log(`[solana-rpc] network=${network} method=${req.method} body_len=${body.length}`);

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        if (res.ok) {
          const data = await res.text();
          return new Response(data, {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        // try next endpoint
      }
    }

    return new Response(JSON.stringify({ error: `All RPC endpoints failed for ${network}` }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
