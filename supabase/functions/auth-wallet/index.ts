import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import nacl from "npm:tweetnacl@1.0.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false } },
);

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Decode(input: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let carry = B58_ALPHABET.indexOf(input[i]);
    if (carry < 0) throw new Error("Invalid base58 character");
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < input.length && input[i] === "1"; i++) {
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
}

async function recoverEthAddress(message: string, sigHex: string): Promise<string | null> {
  try {
    const { verify } = await import("npm:@noble/curves@1.6.0/secp256k1.js");
    const { keccak_256 } = await import("npm:js-sha3@0.9.3");

    const fullHex = sigHex.startsWith("0x") ? sigHex.slice(2) : sigHex;
    const r = fullHex.slice(0, 64);
    const s = fullHex.slice(64, 128);
    let v = parseInt(fullHex.slice(128, 130), 16);
    if (v < 27) v += 27;

    const prefix = `\x19Ethereum Signed Message:\n${message.length}`;
    const encoder = new TextEncoder();
    const prefixBytes = encoder.encode(prefix);
    const messageBytes = encoder.encode(message);
    const hashInput = new Uint8Array(prefixBytes.length + messageBytes.length);
    hashInput.set(prefixBytes, 0);
    hashInput.set(messageBytes, prefixBytes.length);
    const hash = keccak_256(hashInput);

    const sigBytes = new Uint8Array(64);
    sigBytes.set(new Uint8Array(r.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))), 0);
    sigBytes.set(new Uint8Array(s.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))), 32);

    const pubKey = verify(hash, sigBytes, BigInt(v));
    if (!pubKey) return null;

    const pubKeyBytes = pubKey.slice(1);
    const address = keccak_256(pubKeyBytes).slice(-40);
    return "0x" + address;
  } catch {
    return null;
  }
}

async function issueSupabaseToken(walletAddress: string, chain: string): Promise<{ accessToken: string; user: Record<string, unknown> | null }> {
  const email = `${walletAddress.toLowerCase()}@wallet.nrg`;

  const { error: createErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { wallet_address: walletAddress, chain },
  });

  if (createErr && !createErr.message.includes("already")) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === email);
    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, {
        user_metadata: { wallet_address: walletAddress, chain },
      });
    }
  }

  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkErr || !linkData?.properties?.hashed_token) {
    throw new Error("Failed to generate auth token");
  }

  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    }),
  });

  if (!verifyRes.ok) {
    const errText = await verifyRes.text();
    throw new Error(`Token exchange failed: ${errText}`);
  }

  const session = await verifyRes.json();
  return {
    accessToken: session.access_token,
    user: linkData.user?.user_metadata ?? null,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "challenge") {
      const { walletAddress } = await req.json();
      if (!walletAddress || typeof walletAddress !== "string") {
        return json({ error: "walletAddress required" }, 400);
      }

      const nonce = generateNonce();
      const { error } = await supabase
        .from("wallet_nonces")
        .insert({ wallet_address: walletAddress, nonce });

      if (error) return json({ error: "Failed to create challenge" }, 500);

      return json({ nonce });
    }

    if (action === "verify") {
      const { walletAddress, signature, chain } = await req.json();
      if (!walletAddress || !signature) {
        return json({ error: "walletAddress and signature required" }, 400);
      }

      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: nonceRows, error: nonceErr } = await supabase
        .from("wallet_nonces")
        .select("id, nonce, created_at")
        .eq("wallet_address", walletAddress)
        .eq("used", false)
        .gte("created_at", fiveMinAgo)
        .order("created_at", { ascending: false })
        .limit(1);

      if (nonceErr || !nonceRows || nonceRows.length === 0) {
        return json({ error: "No valid challenge found" }, 400);
      }

      const nonceRow = nonceRows[0];
      const message = `Sign this message to authenticate with NRG Casino. Nonce: ${nonceRow.nonce}`;

      let verified = false;

      if (chain === "ethereum") {
        const recovered = await recoverEthAddress(message, signature);
        verified = recovered?.toLowerCase() === walletAddress.toLowerCase();
      } else {
        try {
          const pubKeyBytes = base58Decode(walletAddress);
          const sigBytes = hexToBytes(signature);
          const msgBytes = new TextEncoder().encode(message);
          verified = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
        } catch {
          verified = false;
        }
      }

      if (!verified) {
        return json({ error: "Signature verification failed" }, 401);
      }

      const { data: updated, error: updateErr } = await supabase
        .from("wallet_nonces")
        .update({ used: true })
        .eq("id", nonceRow.id)
        .eq("used", false)
        .select("id");

      if (updateErr || !updated || updated.length === 0) {
        return json({ error: "Challenge already consumed or expired" }, 409);
      }

      const { accessToken } = await issueSupabaseToken(walletAddress, chain ?? "solana");

      return json({
        authenticated: true,
        accessToken,
        walletAddress,
      });
    }

    return json({ error: "Invalid action. Use ?action=challenge or ?action=verify" }, 400);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
