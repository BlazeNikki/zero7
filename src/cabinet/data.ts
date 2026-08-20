import { fetchItems, fetchSingle } from '@/lib/directus';

export type Bonus = {
  id: string;
  name: string;
  amount: string;
  receivedAt: string;
  expiresAt: string;
  wagerProgress: number;
  wagerRemaining: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
};

export type GameRecord = {
  id: string;
  date: string;
  game: string;
  provider: string;
  bet: number;
  win: number;
  status: 'win' | 'loss' | 'pending';
};

export type FinanceRecord = {
  id: string;
  date: string;
  type: 'deposit' | 'withdraw' | 'bonus' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  method: string;
  status: 'completed' | 'pending' | 'rejected';
  txId: string;
};

export type DocStatus = 'approved' | 'pending' | 'rejected' | 'not_uploaded';
export type VerificationDoc = {
  id: string;
  name: string;
  status: DocStatus;
  uploadedAt: string | null;
  comment: string | null;
};

export type Session = {
  id: string;
  ip: string;
  browser: string;
  os: string;
  country: string;
  lastActive: string;
  current: boolean;
};

export type Notification = {
  id: string;
  category: 'system' | 'finance' | 'bonus' | 'tournament';
  title: string;
  text: string;
  date: string;
  read: boolean;
};

export type Ticket = {
  id: string;
  subject: string;
  status: 'open' | 'answered' | 'closed';
  createdAt: string;
  lastReply: string;
};

export type UserProfile = {
  avatar: string;
  nickname: string;
  userId: string;
  vipLevel: number;
  registeredAt: string;
  verified: boolean;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  country: string;
  city: string;
  currency: string;
  language: string;
};

export type Balances = {
  main: number;
  bonus: number;
  freespins: number;
  vipPoints: number;
  inProcessing: number;
  totalDeposits: number;
  totalWithdrawals: number;
};

export type ResponsibleLimits = {
  depositLimit: { value: number; period: string; active: boolean };
  lossLimit: { value: number; period: string; active: boolean };
  betLimit: { value: number; period: string; active: boolean };
  timeLimit: { value: number; period: string; active: boolean };
};

export type VipProgram = {
  currentLevel: number;
  levelName: string;
  points: number;
  nextLevelPoints: number;
  prevLevelPoints: number;
  perks: string[];
  history: { level: number; name: string; date: string }[];
};

export type Tournament = {
  id: string;
  name: string;
  prizePool: string;
  userPlace: number;
  userPoints: number;
  endsAt: string;
};

export type Referral = {
  link: string;
  code: string;
  invitedCount: number;
  totalEarnings: number;
  history: { id: string; user: string; date: string; amount: number }[];
};

export type CabinetData = {
  userProfile: UserProfile;
  balances: Balances;
  bonuses: Bonus[];
  gameHistory: GameRecord[];
  financeHistory: FinanceRecord[];
  verificationDocs: VerificationDoc[];
  sessions: Session[];
  responsibleLimits: ResponsibleLimits;
  vipProgram: VipProgram;
  tournaments: Tournament[];
  referral: Referral;
  notifications: Notification[];
  tickets: Ticket[];
  faqItems: { q: string; a: string }[];
};

export async function fetchCabinetData(): Promise<CabinetData> {
  const [
    profileRes, balancesRes, bonusesRes, gameHistoryRes, financeRes,
    verificationRes, sessionsRes, limitsRes, vipRes, tournamentsRes,
    referralRes, notificationsRes, ticketsRes, faqRes,
  ] = await Promise.all([
    fetchSingle<Record<string, unknown>>('profiles', { 'filter[id]': 'main' }),
    fetchSingle<Record<string, unknown>>('balances', { 'filter[id]': 'main' }),
    fetchItems<Record<string, unknown>>('bonuses'),
    fetchItems<Record<string, unknown>>('game_history'),
    fetchItems<Record<string, unknown>>('finance_history'),
    fetchItems<Record<string, unknown>>('verification_docs'),
    fetchItems<Record<string, unknown>>('sessions'),
    fetchSingle<Record<string, unknown>>('responsible_limits', { 'filter[id]': 'main' }),
    fetchSingle<Record<string, unknown>>('vip_program', { 'filter[id]': 'main' }),
    fetchItems<Record<string, unknown>>('tournaments'),
    fetchSingle<Record<string, unknown>>('referrals', { 'filter[id]': 'main' }),
    fetchItems<Record<string, unknown>>('notifications'),
    fetchItems<Record<string, unknown>>('support_tickets'),
    fetchItems<Record<string, unknown>>('faq_items'),
  ]);

  const p = profileRes;
  const b = balancesRes;
  const l = limitsRes;
  const v = vipRes;
  const r = referralRes;

  return {
    userProfile: {
      avatar: (p?.avatar as string) ?? '',
      nickname: (p?.nickname as string) ?? 'USERNAME',
      userId: (p?.user_id_tag as string) ?? '#0000000',
      vipLevel: (p?.vip_level as number) ?? 0,
      registeredAt: (p?.registered_at as string) ?? '',
      verified: (p?.verified as boolean) ?? false,
      email: (p?.email as string) ?? '',
      phone: (p?.phone as string) ?? '',
      firstName: (p?.first_name as string) ?? '',
      lastName: (p?.last_name as string) ?? '',
      birthDate: (p?.birth_date as string) ?? '',
      country: (p?.country as string) ?? '',
      city: (p?.city as string) ?? '',
      currency: (p?.currency as string) ?? 'RUB',
      language: (p?.language as string) ?? 'Русский',
    },
    balances: {
      main: Number(b?.main ?? 0),
      bonus: Number(b?.bonus ?? 0),
      freespins: (b?.freespins as number) ?? 0,
      vipPoints: (b?.vip_points as number) ?? 0,
      inProcessing: Number(b?.in_processing ?? 0),
      totalDeposits: Number(b?.total_deposits ?? 0),
      totalWithdrawals: Number(b?.total_withdrawals ?? 0),
    },
    bonuses: bonusesRes.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      amount: row.amount as string,
      receivedAt: row.received_at as string,
      expiresAt: row.expires_at as string,
      wagerProgress: row.wager_progress as number,
      wagerRemaining: row.wager_remaining as string,
      status: row.status as Bonus['status'],
    })),
    gameHistory: gameHistoryRes.map((row) => ({
      id: row.id as string,
      date: row.date as string,
      game: row.game as string,
      provider: row.provider as string,
      bet: Number(row.bet),
      win: Number(row.win),
      status: row.status as GameRecord['status'],
    })),
    financeHistory: financeRes.map((row) => ({
      id: row.id as string,
      date: row.date as string,
      type: row.type as FinanceRecord['type'],
      amount: Number(row.amount),
      currency: row.currency as string,
      method: row.method as string,
      status: row.status as FinanceRecord['status'],
      txId: row.tx_id as string,
    })),
    verificationDocs: verificationRes.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      status: row.status as VerificationDoc['status'],
      uploadedAt: (row.uploaded_at as string | null) ?? null,
      comment: (row.comment as string | null) ?? null,
    })),
    sessions: sessionsRes.map((row) => ({
      id: row.id as string,
      ip: row.ip as string,
      browser: row.browser as string,
      os: row.os as string,
      country: row.country as string,
      lastActive: row.last_active as string,
      current: row.current as boolean,
    })),
    responsibleLimits: {
      depositLimit: { value: Number(l?.deposit_limit_value ?? 0), period: (l?.deposit_limit_period as string) ?? '', active: (l?.deposit_limit_active as boolean) ?? false },
      lossLimit: { value: Number(l?.loss_limit_value ?? 0), period: (l?.loss_limit_period as string) ?? '', active: (l?.loss_limit_active as boolean) ?? false },
      betLimit: { value: Number(l?.bet_limit_value ?? 0), period: (l?.bet_limit_period as string) ?? '', active: (l?.bet_limit_active as boolean) ?? false },
      timeLimit: { value: (l?.time_limit_value as number) ?? 0, period: (l?.time_limit_period as string) ?? '', active: (l?.time_limit_active as boolean) ?? false },
    },
    vipProgram: {
      currentLevel: (v?.current_level as number) ?? 0,
      levelName: (v?.level_name as string) ?? '',
      points: (v?.points as number) ?? 0,
      nextLevelPoints: (v?.next_level_points as number) ?? 0,
      prevLevelPoints: (v?.prev_level_points as number) ?? 0,
      perks: (v?.perks ?? []) as string[],
      history: (v?.history ?? []) as { level: number; name: string; date: string }[],
    },
    tournaments: tournamentsRes.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      prizePool: row.prize_pool as string,
      userPlace: row.user_place as number,
      userPoints: row.user_points as number,
      endsAt: row.ends_at as string,
    })),
    referral: {
      link: (r?.link as string) ?? '',
      code: (r?.code as string) ?? '',
      invitedCount: (r?.invited_count as number) ?? 0,
      totalEarnings: Number(r?.total_earnings ?? 0),
      history: (r?.history ?? []) as { id: string; user: string; date: string; amount: number }[],
    },
    notifications: notificationsRes.map((row) => ({
      id: row.id as string,
      category: row.category as Notification['category'],
      title: row.title as string,
      text: row.text as string,
      date: row.date as string,
      read: row.read as boolean,
    })),
    tickets: ticketsRes.map((row) => ({
      id: row.id as string,
      subject: row.subject as string,
      status: row.status as Ticket['status'],
      createdAt: row.created_at as string,
      lastReply: row.last_reply as string,
    })),
    faqItems: faqRes.map((row) => ({
      q: row.question as string,
      a: row.answer as string,
    })),
  };
}
