/*
# Emergency RLS Lockdown — Remove Open Access Policies

## Purpose
Immediately block all unauthorized write access (INSERT/UPDATE/DELETE) from
anon and authenticated roles on all 17 tables that previously had
USING(true)/WITH_CHECK(true) policies. Additionally, remove SELECT access
from 12 tables containing sensitive data (balances, finance, personal info,
sessions, KYC docs). Only 5 tables with public-facing content retain
read-only SELECT access.

## Changes

### Tables where ALL policies are removed (SELECT + INSERT + UPDATE + DELETE):
These tables contain sensitive data and should never be accessible directly
from the frontend. All access must go through Edge Functions using the
service role key.

- balances (financial balances)
- bonuses (bonus amounts, wager progress)
- finance_history (transaction history, tx IDs)
- game_history (bet/win history)
- notifications (private notifications)
- profiles (email, phone, KYC, personal data)
- referrals (referral earnings)
- responsible_limits (responsible gaming limits)
- sessions (IP addresses, browser/OS fingerprints)
- support_tickets (support interactions)
- vip_program (VIP status, points history)
- verification_docs (KYC verification documents)

### Tables where only INSERT/UPDATE/DELETE policies are removed (SELECT kept):
These tables contain public-facing content (game catalog, FAQ, tournament
boards, winner feeds, chat). Read access remains open; write access is now
blocked.

- faq_items
- games
- tournaments
- winners
- chat_messages

## Security Impact
After this migration:
- No anon or authenticated role can INSERT, UPDATE, or DELETE any data
  in any of these 17 tables.
- No anon or authenticated role can SELECT from the 12 sensitive tables.
- Only the service_role key (used in Edge Functions) bypasses RLS and
  can still read/write all tables.
- wallet_nonces is unchanged (already had RLS enabled with no policies).

## Important Notes
1. This is a breaking change — any frontend code that directly queries
   these tables via the Supabase anon client will stop working.
2. This is intentional: the security audit found that all 17 tables had
   fully open USING(true) policies, allowing anyone with the public anon
   key to read, modify, and delete sensitive data.
3. The migration is idempotent — DROP POLICY IF EXISTS is safe to re-run.
4. No data is lost — only access policies are removed.
*/

-- ============================================================
-- TABLES: REMOVE ALL POLICIES (SELECT + INSERT + UPDATE + DELETE)
-- ============================================================

-- balances
DROP POLICY IF EXISTS "anon_select_balances" ON public.balances;
DROP POLICY IF EXISTS "anon_insert_balances" ON public.balances;
DROP POLICY IF EXISTS "anon_update_balances" ON public.balances;
DROP POLICY IF EXISTS "anon_delete_balances" ON public.balances;

-- bonuses
DROP POLICY IF EXISTS "anon_select_bonuses" ON public.bonuses;
DROP POLICY IF EXISTS "anon_insert_bonuses" ON public.bonuses;
DROP POLICY IF EXISTS "anon_update_bonuses" ON public.bonuses;
DROP POLICY IF EXISTS "anon_delete_bonuses" ON public.bonuses;

-- finance_history
DROP POLICY IF EXISTS "anon_select_finance_history" ON public.finance_history;
DROP POLICY IF EXISTS "anon_insert_finance_history" ON public.finance_history;
DROP POLICY IF EXISTS "anon_update_finance_history" ON public.finance_history;
DROP POLICY IF EXISTS "anon_delete_finance_history" ON public.finance_history;

-- game_history
DROP POLICY IF EXISTS "anon_select_game_history" ON public.game_history;
DROP POLICY IF EXISTS "anon_insert_game_history" ON public.game_history;
DROP POLICY IF EXISTS "anon_update_game_history" ON public.game_history;
DROP POLICY IF EXISTS "anon_delete_game_history" ON public.game_history;

-- notifications
DROP POLICY IF EXISTS "anon_select_notifications" ON public.notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON public.notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON public.notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON public.notifications;

-- profiles
DROP POLICY IF EXISTS "anon_select_profiles" ON public.profiles;
DROP POLICY IF EXISTS "anon_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "anon_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "anon_delete_profiles" ON public.profiles;

-- referrals
DROP POLICY IF EXISTS "anon_select_referrals" ON public.referrals;
DROP POLICY IF EXISTS "anon_insert_referrals" ON public.referrals;
DROP POLICY IF EXISTS "anon_update_referrals" ON public.referrals;
DROP POLICY IF EXISTS "anon_delete_referrals" ON public.referrals;

-- responsible_limits
DROP POLICY IF EXISTS "anon_select_responsible_limits" ON public.responsible_limits;
DROP POLICY IF EXISTS "anon_insert_responsible_limits" ON public.responsible_limits;
DROP POLICY IF EXISTS "anon_update_responsible_limits" ON public.responsible_limits;
DROP POLICY IF EXISTS "anon_delete_responsible_limits" ON public.responsible_limits;

-- sessions
DROP POLICY IF EXISTS "anon_select_sessions" ON public.sessions;
DROP POLICY IF EXISTS "anon_insert_sessions" ON public.sessions;
DROP POLICY IF EXISTS "anon_update_sessions" ON public.sessions;
DROP POLICY IF EXISTS "anon_delete_sessions" ON public.sessions;

-- support_tickets
DROP POLICY IF EXISTS "anon_select_support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "anon_insert_support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "anon_update_support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "anon_delete_support_tickets" ON public.support_tickets;

-- vip_program
DROP POLICY IF EXISTS "anon_select_vip_program" ON public.vip_program;
DROP POLICY IF EXISTS "anon_insert_vip_program" ON public.vip_program;
DROP POLICY IF EXISTS "anon_update_vip_program" ON public.vip_program;
DROP POLICY IF EXISTS "anon_delete_vip_program" ON public.vip_program;

-- verification_docs
DROP POLICY IF EXISTS "anon_select_verification_docs" ON public.verification_docs;
DROP POLICY IF EXISTS "anon_insert_verification_docs" ON public.verification_docs;
DROP POLICY IF EXISTS "anon_update_verification_docs" ON public.verification_docs;
DROP POLICY IF EXISTS "anon_delete_verification_docs" ON public.verification_docs;

-- ============================================================
-- TABLES: REMOVE WRITE POLICIES ONLY (KEEP SELECT)
-- ============================================================

-- faq_items
DROP POLICY IF EXISTS "anon_insert_faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "anon_update_faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "anon_delete_faq_items" ON public.faq_items;

-- games
DROP POLICY IF EXISTS "anon_insert_games" ON public.games;
DROP POLICY IF EXISTS "anon_update_games" ON public.games;
DROP POLICY IF EXISTS "anon_delete_games" ON public.games;

-- tournaments
DROP POLICY IF EXISTS "anon_insert_tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "anon_update_tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "anon_delete_tournaments" ON public.tournaments;

-- winners
DROP POLICY IF EXISTS "anon_insert_winners" ON public.winners;
DROP POLICY IF EXISTS "anon_update_winners" ON public.winners;
DROP POLICY IF EXISTS "anon_delete_winners" ON public.winners;

-- chat_messages
DROP POLICY IF EXISTS "anon_insert_chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "anon_update_chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "anon_delete_chat_messages" ON public.chat_messages;