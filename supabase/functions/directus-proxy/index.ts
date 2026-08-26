import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const DIRECTUS_URL = Deno.env.get("DIRECTUS_URL") ?? "https://admin.nrg-travel.com";
const DIRECTUS_TOKEN = Deno.env.get("DIRECTUS_TOKEN") ?? "";

/**
 * Allowed collections and their access levels.
 * - "public": readable without auth (games, winners — for display)
 * - "auth": requires authenticated wallet
 */
const PUBLIC_COLLECTIONS = new Set(["games", "winners", "faq_items", "chat_messages"]);
const AUTH_COLLECTIONS = new Set([
  "users", "profiles", "balances", "bonuses",
  "game_history", "finance_history", "verification_docs", "sessions",
  "responsible_limits", "vip_program", "tournaments", "referrals",
  "notifications", "support_tickets",
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function forwardToDirectus(restPath: string, search: string, method: string, body?: string) {
  const directusUrl = `${DIRECTUS_URL}/${restPath}${search}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (DIRECTUS_TOKEN) headers["Authorization"] = `Bearer ${DIRECTUS_TOKEN}`;
  const fetchOptions: RequestInit = { method, headers };
  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    fetchOptions.body = body;
  }
  const proxyRes = await fetch(directusUrl, fetchOptions);
  const text = await proxyRes.text();
  try {
    const result = JSON.parse(text);
    return json(result, proxyRes.status);
  } catch {
    return json({ error: "Invalid response from Directus" }, 502);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Parse the requested path
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const itemsIdx = pathParts.indexOf("items");
    if (itemsIdx === -1 || !pathParts[itemsIdx + 1]) {
      return json({ error: "Invalid proxy path" }, 400);
    }
    const collection = pathParts[itemsIdx + 1];
    const restPath = pathParts.slice(itemsIdx).join("/");

    const isPublic = PUBLIC_COLLECTIONS.has(collection);
    const isAuth = AUTH_COLLECTIONS.has(collection);

    if (!isPublic && !isAuth) {
      return json({ error: "Collection not allowed" }, 403);
    }

    // Public collections: allow GET without auth
    if (isPublic && req.method === "GET") {
      return forwardToDirectus(restPath, url.search, req.method);
    }

    // All other access requires auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    // Verify the token is a valid Supabase JWT
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return json({ error: "Invalid or expired token" }, 401);
    }

    // For auth-required collections, verify wallet is set in user metadata
    if (isAuth) {
      const walletAddress = userData.user.user_metadata?.wallet_address;
      if (!walletAddress) {
        return json({ error: "Wallet not connected" }, 403);
      }

      // For GET requests with a filter param, ensure users can only read their own data
      if (req.method === "GET") {
        const filterParam = url.searchParams.get("filter");
        if (filterParam) {
          let filter: Record<string, unknown>;
          try {
            filter = JSON.parse(decodeURIComponent(filterParam));
          } catch {
            return json({ error: "Invalid filter parameter" }, 400);
          }
          const filterWallet = (filter as { wallet_address?: { _eq?: string } }).wallet_address?._eq;
          if (filterWallet && filterWallet !== walletAddress) {
            return json({ error: "Cannot access other users' data" }, 403);
          }
        }
      }

      // For chat_messages POST, inject the wallet address
      if (collection === "chat_messages" && req.method === "POST") {
        const body = await req.json();
        body.wallet_address = walletAddress;
        return forwardToDirectus(restPath, url.search, req.method, JSON.stringify(body));
      }
    }

    // Forward authenticated request to Directus
    const reqBody = (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")
      ? await req.text()
      : undefined;
    return forwardToDirectus(restPath, url.search, req.method, reqBody);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
