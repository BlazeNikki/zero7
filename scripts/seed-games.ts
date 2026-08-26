/**
 * One-off seed script: creates 7 records in the Directus `games` collection.
 *
 * - 3 active games (Crash, Plinko, Mines) — working engines.
 * - 4 coming_soon games (Coin Flip, Dice, Hilo, Wheel) — announcements.
 *
 * All fields beyond name/slug/provider/category/status/is_popular/sort are
 * left untouched (not sent in the POST body) so Directus uses its defaults.
 *
 * Usage:
 *   1. Add DIRECTUS_ADMIN_TOKEN=... and DIRECTUS_URL=... to .env
 *   2. npx tsx scripts/seed-games.ts
 *
 * The token is never printed. Only id + name are logged.
 */

const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
if (!TOKEN) {
  console.error(
    "DIRECTUS_ADMIN_TOKEN is not set. Add it to .env and re-run.",
  );
  process.exit(1);
}

const DIRECTUS_URL = process.env.DIRECTUS_URL;
if (!DIRECTUS_URL) {
  console.error(
    "DIRECTUS_URL is not set. Add it to .env and re-run.",
  );
  process.exit(1);
}

const BASE = DIRECTUS_URL.replace(/\/+$/, "");

// --- Directus REST helpers -------------------------------------------------
type Game = { id: string; name: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Directus ${res.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text) as T;
}

async function listGames(): Promise<Game[]> {
  const data = await api<{ data: Game[] }>(
    "/items/games?fields=id,name&limit=50",
  );
  return data.data ?? [];
}

async function createGame(
  body: Record<string, unknown>,
): Promise<Game> {
  const data = await api<{ data: Game }>(`/items/games`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data.data;
}

// --- games to create -------------------------------------------------------
const GAMES: {
  name: string;
  slug: string;
  provider: string;
  category: string;
  status: string;
  is_popular: boolean;
  sort: number;
}[] = [
  { name: "Crash", slug: "crash", provider: "ZERO7", category: "originals", status: "active", is_popular: true, sort: 1 },
  { name: "Plinko", slug: "plinko", provider: "ZERO7", category: "originals", status: "active", is_popular: true, sort: 2 },
  { name: "Mines", slug: "mines", provider: "ZERO7", category: "originals", status: "active", is_popular: true, sort: 3 },
  { name: "Coin Flip", slug: "coin-flip", provider: "ZERO7", category: "originals", status: "coming_soon", is_popular: false, sort: 4 },
  { name: "Dice", slug: "dice", provider: "ZERO7", category: "originals", status: "coming_soon", is_popular: false, sort: 5 },
  { name: "Hilo", slug: "hilo", provider: "ZERO7", category: "originals", status: "coming_soon", is_popular: false, sort: 6 },
  { name: "Wheel", slug: "wheel", provider: "ZERO7", category: "originals", status: "coming_soon", is_popular: false, sort: 7 },
];

// --- main ------------------------------------------------------------------
async function main() {
  // Pre-flight: check for existing records
  const existing = await listGames();
  console.log("\n=== Current games in Directus ===");
  if (existing.length === 0) {
    console.log("  (collection is empty — safe to seed)");
  } else {
    console.log(`  Found ${existing.length} existing record(s):`);
    for (const g of existing) console.log(`    ${g.id}  ${g.name}`);
    console.error(
      "\n  WARNING: collection is not empty. Aborting to avoid duplicates.",
    );
    process.exit(1);
  }
  console.log();

  // Create
  const created: Game[] = [];
  for (const g of GAMES) {
    try {
      const record = await createGame({
        name: g.name,
        slug: g.slug,
        provider: g.provider,
        category: g.category,
        status: g.status,
        is_popular: g.is_popular,
        sort: g.sort,
      });
      created.push(record);
      console.log(`  OK   ${record.id}  ${g.name}`);
    } catch (err) {
      console.error(`  FAIL ${g.name}  ${(err as Error).message}`);
    }
  }

  console.log("\n=== Created records ===");
  for (const g of created) console.log(`  ${g.id}  ${g.name}`);
  console.log(`\nDone. ${created.length}/${GAMES.length} created.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
