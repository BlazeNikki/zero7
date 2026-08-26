/*
# Create casino platform database schema

This migration creates the full database for a casino/gambling platform.
The app has NO sign-in screen, so all policies use `TO anon, authenticated`
(intentionally public/shared data — the anon-key frontend must be able to read and write).

## New Tables

1. `profiles` — user profile data (nickname, VIP level, email, phone, etc.)
2. `balances` — user balance information (main, bonus, freespins, VIP points, totals)
3. `bonuses` — bonus records with wager progress and status
4. `game_history` — history of game rounds played
5. `finance_history` — deposit/withdraw/bonus/refund transactions
6. `verification_docs` — KYC verification document statuses
7. `sessions` — active login sessions (IP, browser, OS, location)
8. `responsible_limits` — responsible gaming limits (deposit, loss, bet, time)
9. `vip_program` — VIP level info, perks, and level history (JSONB columns)
10. `tournaments` — tournament listings with prize pools and user standings
11. `referrals` — referral program data and invitation history (JSONB)
12. `notifications` — user notifications with categories and read status
13. `support_tickets` — support ticket records
14. `faq_items` — FAQ questions and answers
15. `winners` — live winners feed displayed in sidebar
16. `chat_messages` — live chat messages displayed in sidebar
17. `games` — game catalog entries

## Security

- RLS enabled on every table.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because this is a single-tenant app with no sign-in screen — the anon-key
  frontend must be able to read and write all data.
*/

-- ============ profiles ============
CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY DEFAULT 'main',
  nickname text NOT NULL DEFAULT 'USERNAME',
  user_id_tag text NOT NULL DEFAULT '#0000000',
  vip_level integer NOT NULL DEFAULT 0,
  registered_at text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  birth_date text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'RUB',
  language text NOT NULL DEFAULT 'Русский',
  avatar text NOT NULL DEFAULT ''
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);

-- ============ balances ============
CREATE TABLE IF NOT EXISTS balances (
  id text PRIMARY KEY DEFAULT 'main',
  main numeric NOT NULL DEFAULT 0,
  bonus numeric NOT NULL DEFAULT 0,
  freespins integer NOT NULL DEFAULT 0,
  vip_points integer NOT NULL DEFAULT 0,
  in_processing numeric NOT NULL DEFAULT 0,
  total_deposits numeric NOT NULL DEFAULT 0,
  total_withdrawals numeric NOT NULL DEFAULT 0
);

ALTER TABLE balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_balances" ON balances;
CREATE POLICY "anon_select_balances" ON balances FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_balances" ON balances;
CREATE POLICY "anon_insert_balances" ON balances FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_balances" ON balances;
CREATE POLICY "anon_update_balances" ON balances FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_balances" ON balances;
CREATE POLICY "anon_delete_balances" ON balances FOR DELETE
  TO anon, authenticated USING (true);

-- ============ bonuses ============
CREATE TABLE IF NOT EXISTS bonuses (
  id text PRIMARY KEY,
  name text NOT NULL,
  amount text NOT NULL,
  received_at text NOT NULL,
  expires_at text NOT NULL,
  wager_progress integer NOT NULL DEFAULT 0,
  wager_remaining text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active'
);

ALTER TABLE bonuses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bonuses" ON bonuses;
CREATE POLICY "anon_select_bonuses" ON bonuses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bonuses" ON bonuses;
CREATE POLICY "anon_insert_bonuses" ON bonuses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bonuses" ON bonuses;
CREATE POLICY "anon_update_bonuses" ON bonuses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bonuses" ON bonuses;
CREATE POLICY "anon_delete_bonuses" ON bonuses FOR DELETE
  TO anon, authenticated USING (true);

-- ============ game_history ============
CREATE TABLE IF NOT EXISTS game_history (
  id text PRIMARY KEY,
  date text NOT NULL,
  game text NOT NULL,
  provider text NOT NULL,
  bet numeric NOT NULL DEFAULT 0,
  win numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'loss'
);

ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_game_history" ON game_history;
CREATE POLICY "anon_select_game_history" ON game_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_game_history" ON game_history;
CREATE POLICY "anon_insert_game_history" ON game_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_game_history" ON game_history;
CREATE POLICY "anon_update_game_history" ON game_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_game_history" ON game_history;
CREATE POLICY "anon_delete_game_history" ON game_history FOR DELETE
  TO anon, authenticated USING (true);

-- ============ finance_history ============
CREATE TABLE IF NOT EXISTS finance_history (
  id text PRIMARY KEY,
  date text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'RUB',
  method text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'completed',
  tx_id text NOT NULL DEFAULT ''
);

ALTER TABLE finance_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_finance_history" ON finance_history;
CREATE POLICY "anon_select_finance_history" ON finance_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_finance_history" ON finance_history;
CREATE POLICY "anon_insert_finance_history" ON finance_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_finance_history" ON finance_history;
CREATE POLICY "anon_update_finance_history" ON finance_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_finance_history" ON finance_history;
CREATE POLICY "anon_delete_finance_history" ON finance_history FOR DELETE
  TO anon, authenticated USING (true);

-- ============ verification_docs ============
CREATE TABLE IF NOT EXISTS verification_docs (
  id text PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'not_uploaded',
  uploaded_at text,
  comment text
);

ALTER TABLE verification_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_verification_docs" ON verification_docs;
CREATE POLICY "anon_select_verification_docs" ON verification_docs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_verification_docs" ON verification_docs;
CREATE POLICY "anon_insert_verification_docs" ON verification_docs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_verification_docs" ON verification_docs;
CREATE POLICY "anon_update_verification_docs" ON verification_docs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_verification_docs" ON verification_docs;
CREATE POLICY "anon_delete_verification_docs" ON verification_docs FOR DELETE
  TO anon, authenticated USING (true);

-- ============ sessions ============
CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  ip text NOT NULL,
  browser text NOT NULL,
  os text NOT NULL,
  country text NOT NULL,
  last_active text NOT NULL,
  current boolean NOT NULL DEFAULT false
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "anon_delete_sessions" ON sessions FOR DELETE
  TO anon, authenticated USING (true);

-- ============ responsible_limits ============
CREATE TABLE IF NOT EXISTS responsible_limits (
  id text PRIMARY KEY DEFAULT 'main',
  deposit_limit_value numeric NOT NULL DEFAULT 100000,
  deposit_limit_period text NOT NULL DEFAULT 'месяц',
  deposit_limit_active boolean NOT NULL DEFAULT true,
  loss_limit_value numeric NOT NULL DEFAULT 50000,
  loss_limit_period text NOT NULL DEFAULT 'месяц',
  loss_limit_active boolean NOT NULL DEFAULT true,
  bet_limit_value numeric NOT NULL DEFAULT 5000,
  bet_limit_period text NOT NULL DEFAULT 'день',
  bet_limit_active boolean NOT NULL DEFAULT false,
  time_limit_value integer NOT NULL DEFAULT 4,
  time_limit_period text NOT NULL DEFAULT 'час/день',
  time_limit_active boolean NOT NULL DEFAULT true
);

ALTER TABLE responsible_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_responsible_limits" ON responsible_limits;
CREATE POLICY "anon_select_responsible_limits" ON responsible_limits FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_responsible_limits" ON responsible_limits;
CREATE POLICY "anon_insert_responsible_limits" ON responsible_limits FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_responsible_limits" ON responsible_limits;
CREATE POLICY "anon_update_responsible_limits" ON responsible_limits FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_responsible_limits" ON responsible_limits;
CREATE POLICY "anon_delete_responsible_limits" ON responsible_limits FOR DELETE
  TO anon, authenticated USING (true);

-- ============ vip_program ============
CREATE TABLE IF NOT EXISTS vip_program (
  id text PRIMARY KEY DEFAULT 'main',
  current_level integer NOT NULL DEFAULT 0,
  level_name text NOT NULL DEFAULT '',
  points integer NOT NULL DEFAULT 0,
  next_level_points integer NOT NULL DEFAULT 0,
  prev_level_points integer NOT NULL DEFAULT 0,
  perks jsonb NOT NULL DEFAULT '[]',
  history jsonb NOT NULL DEFAULT '[]'
);

ALTER TABLE vip_program ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vip_program" ON vip_program;
CREATE POLICY "anon_select_vip_program" ON vip_program FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vip_program" ON vip_program;
CREATE POLICY "anon_insert_vip_program" ON vip_program FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vip_program" ON vip_program;
CREATE POLICY "anon_update_vip_program" ON vip_program FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_vip_program" ON vip_program;
CREATE POLICY "anon_delete_vip_program" ON vip_program FOR DELETE
  TO anon, authenticated USING (true);

-- ============ tournaments ============
CREATE TABLE IF NOT EXISTS tournaments (
  id text PRIMARY KEY,
  name text NOT NULL,
  prize_pool text NOT NULL,
  user_place integer NOT NULL DEFAULT 0,
  user_points integer NOT NULL DEFAULT 0,
  ends_at text NOT NULL
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tournaments" ON tournaments;
CREATE POLICY "anon_select_tournaments" ON tournaments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tournaments" ON tournaments;
CREATE POLICY "anon_insert_tournaments" ON tournaments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tournaments" ON tournaments;
CREATE POLICY "anon_update_tournaments" ON tournaments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tournaments" ON tournaments;
CREATE POLICY "anon_delete_tournaments" ON tournaments FOR DELETE
  TO anon, authenticated USING (true);

-- ============ referrals ============
CREATE TABLE IF NOT EXISTS referrals (
  id text PRIMARY KEY DEFAULT 'main',
  link text NOT NULL DEFAULT '',
  code text NOT NULL DEFAULT '',
  invited_count integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  history jsonb NOT NULL DEFAULT '[]'
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_referrals" ON referrals;
CREATE POLICY "anon_select_referrals" ON referrals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_referrals" ON referrals;
CREATE POLICY "anon_insert_referrals" ON referrals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_referrals" ON referrals;
CREATE POLICY "anon_update_referrals" ON referrals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_referrals" ON referrals;
CREATE POLICY "anon_delete_referrals" ON referrals FOR DELETE
  TO anon, authenticated USING (true);

-- ============ notifications ============
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  category text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  text text NOT NULL DEFAULT '',
  date text NOT NULL,
  read boolean NOT NULL DEFAULT false
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE
  TO anon, authenticated USING (true);

-- ============ support_tickets ============
CREATE TABLE IF NOT EXISTS support_tickets (
  id text PRIMARY KEY,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at text NOT NULL,
  last_reply text NOT NULL
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_support_tickets" ON support_tickets;
CREATE POLICY "anon_select_support_tickets" ON support_tickets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_support_tickets" ON support_tickets;
CREATE POLICY "anon_insert_support_tickets" ON support_tickets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_support_tickets" ON support_tickets;
CREATE POLICY "anon_update_support_tickets" ON support_tickets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_support_tickets" ON support_tickets;
CREATE POLICY "anon_delete_support_tickets" ON support_tickets FOR DELETE
  TO anon, authenticated USING (true);

-- ============ faq_items ============
CREATE TABLE IF NOT EXISTS faq_items (
  id serial PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_faq_items" ON faq_items;
CREATE POLICY "anon_select_faq_items" ON faq_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_faq_items" ON faq_items;
CREATE POLICY "anon_insert_faq_items" ON faq_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_faq_items" ON faq_items;
CREATE POLICY "anon_update_faq_items" ON faq_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_faq_items" ON faq_items;
CREATE POLICY "anon_delete_faq_items" ON faq_items FOR DELETE
  TO anon, authenticated USING (true);

-- ============ winners ============
CREATE TABLE IF NOT EXISTS winners (
  id text PRIMARY KEY,
  name text NOT NULL,
  game text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  hue integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_winners" ON winners;
CREATE POLICY "anon_select_winners" ON winners FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_winners" ON winners;
CREATE POLICY "anon_insert_winners" ON winners FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_winners" ON winners;
CREATE POLICY "anon_update_winners" ON winners FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_winners" ON winners;
CREATE POLICY "anon_delete_winners" ON winners FOR DELETE
  TO anon, authenticated USING (true);

-- ============ chat_messages ============
CREATE TABLE IF NOT EXISTS chat_messages (
  id text PRIMARY KEY,
  username text NOT NULL,
  vip integer NOT NULL DEFAULT 0,
  time text NOT NULL,
  text text NOT NULL,
  hue integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_messages" ON chat_messages;
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);

-- ============ games ============
CREATE TABLE IF NOT EXISTS games (
  id text PRIMARY KEY,
  name text NOT NULL,
  provider text NOT NULL,
  art text NOT NULL,
  accent text NOT NULL
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_games" ON games;
CREATE POLICY "anon_select_games" ON games FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_games" ON games;
CREATE POLICY "anon_insert_games" ON games FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_games" ON games;
CREATE POLICY "anon_update_games" ON games FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_games" ON games;
CREATE POLICY "anon_delete_games" ON games FOR DELETE
  TO anon, authenticated USING (true);
