export type TournamentStatus = 'active' | 'upcoming' | 'finished';

export type PrizeRow = {
  place: string;
  prize: string;
};

export type LeaderRow = {
  rank: number;
  player: string;
  points: number;
  win: string;
  isMe?: boolean;
};

export type TournamentGame = {
  id: string;
  name: string;
  accent: string;
};

export type Tournament = {
  id: string;
  name: string;
  provider: string;
  category: string;
  banner: string;
  prizePool: string;
  minBet: string;
  startsAt: string;
  endsAt: string;
  endsAtTimestamp: number;
  startsAtTimestamp: number;
  participants: number;
  status: TournamentStatus;
  freeEntry: boolean;
  description: string;
  rules: string[];
  winnersCount: number;
  games: TournamentGame[];
  prizeTable: PrizeRow[];
  leaderboard: LeaderRow[];
  myStats: {
    place: number;
    points: number;
    bets: number;
    turnover: string;
    projectedWin: string;
  } | null;
};

const now = Date.now();
const DAY = 86400000;

export const tournaments: Tournament[] = [
  {
    id: 't1',
    name: 'PLAY & WIN',
    provider: 'Originals',
    category: 'Originals',
    banner: '/images/slider/5abbd92b-d14e-448f-a31b-9743c7913778.jpg',
    prizePool: '1 000 000 ₽',
    minBet: '50 ₽',
    startsAt: '01.08.2024 00:00',
    endsAt: '07.08.2024 23:59',
    startsAtTimestamp: now - 4 * DAY,
    endsAtTimestamp: now + 2 * DAY + 14 * 3600000 + 37 * 60000,
    participants: 1284,
    status: 'active',
    freeEntry: true,
    description:
      'Крупнейший недельный турнир от ZERO7. Зарабатывайте очки за каждую ставку в играх Originals и поднимайтесь в таблице лидеров. Чем выше ставка — тем больше очков.',
    rules: [
      'Минимальная ставка для участия — 50 ₽',
      '1 очко начисляется за каждые 100 ₽ оборота',
      'Очки начисляются только в играх турнира',
      'Призовой фонд распределяется между топ-100 игроками',
      'Использование бонусных средств не запрещено',
    ],
    winnersCount: 100,
    games: [
      { id: 'g1', name: 'COIN FLIP', accent: '#FFD23F' },
      { id: 'g2', name: 'DICE', accent: '#4DA8FF' },
      { id: 'g3', name: 'HI-LO', accent: '#3DD68C' },
      { id: 'g4', name: 'WHEEL', accent: '#FF6B9D' },
      { id: 'g5', name: 'MINES', accent: '#FF9E2C' },
      { id: 'g6', name: 'CRASH', accent: '#FF4D6D' },
      { id: 'g7', name: 'PLINKO', accent: '#A78BFA' },
    ],
    prizeTable: [
      { place: '1', prize: '100 000 ₽' },
      { place: '2', prize: '50 000 ₽' },
      { place: '3', prize: '25 000 ₽' },
      { place: '4–10', prize: '5 000 ₽' },
      { place: '11–50', prize: '2 000 ₽' },
      { place: '51–100', prize: '500 ₽' },
    ],
    leaderboard: [
      { rank: 1, player: 'Mara_K', points: 28450, win: '100 000 ₽' },
      { rank: 2, player: 'Alex_92', points: 24100, win: '50 000 ₽' },
      { rank: 3, player: 'Dmitriy', points: 19870, win: '25 000 ₽' },
      { rank: 4, player: 'USERNAME', points: 8420, win: '5 000 ₽', isMe: true },
      { rank: 5, player: 'Nika_777', points: 8100, win: '5 000 ₽' },
      { rank: 6, player: 'Viktor', points: 7600, win: '5 000 ₽' },
      { rank: 7, player: 'Igor_88', points: 6900, win: '5 000 ₽' },
      { rank: 8, player: 'Lena', points: 5400, win: '5 000 ₽' },
      { rank: 9, player: 'Oleg_T', points: 4800, win: '5 000 ₽' },
      { rank: 10, player: 'Pavel', points: 4200, win: '5 000 ₽' },
    ],
    myStats: {
      place: 4,
      points: 8420,
      bets: 127,
      turnover: '842 000 ₽',
      projectedWin: '5 000 ₽',
    },
  },
  {
    id: 't2',
    name: 'Summer Slots Race',
    provider: 'Pragmatic Play',
    category: 'Слоты',
    banner: '/images/tournament/bad4b643-53dc-4e7c-bd66-cea63b4253e2.jpg',
    prizePool: '500 000 ₽',
    minBet: '100 ₽',
    startsAt: '01.08.2024 00:00',
    endsAt: '10.08.2024 23:59',
    startsAtTimestamp: now - 4 * DAY,
    endsAtTimestamp: now + 5 * DAY + 8 * 3600000,
    participants: 842,
    status: 'active',
    freeEntry: false,
    description:
      'Летняя гонка по слотам Pragmatic Play. Каждая ставка приносит очки — собирайте их и забирайте часть призового фонда.',
    rules: [
      'Минимальная ставка — 100 ₽',
      '1 очко за каждые 200 ₽ оборота',
      'Только слоты Pragmatic Play участвуют',
      'Призы получают топ-50 игроков',
    ],
    winnersCount: 50,
    games: [
      { id: 'g1', name: 'COIN FLIP', accent: '#FFD23F' },
      { id: 'g2', name: 'DICE', accent: '#4DA8FF' },
      { id: 'g3', name: 'HI-LO', accent: '#3DD68C' },
      { id: 'g4', name: 'WHEEL', accent: '#FF6B9D' },
    ],
    prizeTable: [
      { place: '1', prize: '50 000 ₽' },
      { place: '2', prize: '25 000 ₽' },
      { place: '3', prize: '15 000 ₽' },
      { place: '4–10', prize: '3 000 ₽' },
      { place: '11–50', prize: '1 000 ₽' },
    ],
    leaderboard: [
      { rank: 1, player: 'BigWinner', points: 19200, win: '50 000 ₽' },
      { rank: 2, player: 'LuckyStrike', points: 16800, win: '25 000 ₽' },
      { rank: 3, player: 'SpinMaster', points: 13400, win: '15 000 ₽' },
      { rank: 23, player: 'USERNAME', points: 3210, win: '1 000 ₽', isMe: true },
      { rank: 24, player: 'Anna_777', points: 3100, win: '1 000 ₽' },
      { rank: 25, player: 'Sergey_K', points: 2950, win: '1 000 ₽' },
    ],
    myStats: {
      place: 23,
      points: 3210,
      bets: 64,
      turnover: '642 000 ₽',
      projectedWin: '1 000 ₽',
    },
  },
  {
    id: 't3',
    name: 'Weekend Madness',
    provider: 'Originals',
    category: 'Originals',
    banner: '/images/cashback/4aefdf7b-de40-4c1e-9a5d-c9f85af0fb78.jpg',
    prizePool: '250 000 ₽',
    minBet: '25 ₽',
    startsAt: '15.08.2024 18:00',
    endsAt: '18.08.2024 23:59',
    startsAtTimestamp: now + 10 * DAY,
    endsAtTimestamp: now + 13 * DAY,
    participants: 0,
    status: 'upcoming',
    freeEntry: true,
    description:
      'Безумные выходные с турниром по всем играм Originals. Три дня нон-стоп гонки за призовым фондом 250 000 ₽.',
    rules: [
      'Минимальная ставка — 25 ₽',
      '2 очка за каждые 100 ₽ оборота (повышенный коэффициент)',
      'Все игры Originals участвуют',
      'Призы получают топ-30 игроков',
    ],
    winnersCount: 30,
    games: [
      { id: 'g1', name: 'COIN FLIP', accent: '#FFD23F' },
      { id: 'g2', name: 'DICE', accent: '#4DA8FF' },
      { id: 'g3', name: 'HI-LO', accent: '#3DD68C' },
      { id: 'g4', name: 'WHEEL', accent: '#FF6B9D' },
      { id: 'g5', name: 'MINES', accent: '#FF9E2C' },
      { id: 'g6', name: 'CRASH', accent: '#FF4D6D' },
      { id: 'g7', name: 'PLINKO', accent: '#A78BFA' },
    ],
    prizeTable: [
      { place: '1', prize: '25 000 ₽' },
      { place: '2', prize: '15 000 ₽' },
      { place: '3', prize: '10 000 ₽' },
      { place: '4–10', prize: '2 000 ₽' },
      { place: '11–30', prize: '500 ₽' },
    ],
    leaderboard: [],
    myStats: null,
  },
  {
    id: 't4',
    name: 'Spring Championship',
    provider: 'Pragmatic Play',
    category: 'Слоты',
    banner: '/images/tournament/bad4b643-53dc-4e7c-bd66-cea63b4253e2.jpg',
    prizePool: '750 000 ₽',
    minBet: '50 ₽',
    startsAt: '01.04.2024 00:00',
    endsAt: '30.04.2024 23:59',
    startsAtTimestamp: now - 100 * DAY,
    endsAtTimestamp: now - 70 * DAY,
    participants: 2104,
    status: 'finished',
    freeEntry: false,
    description:
      'Весенний чемпионат завершён. Призовой фонд 750 000 ₽ распределён между топ-100 игроками. Поздравляем победителей!',
    rules: [
      'Минимальная ставка — 50 ₽',
      '1 очко за каждые 100 ₽ оборота',
      'Призы получили топ-100 игроков',
    ],
    winnersCount: 100,
    games: [
      { id: 'g1', name: 'COIN FLIP', accent: '#FFD23F' },
      { id: 'g2', name: 'DICE', accent: '#4DA8FF' },
      { id: 'g3', name: 'HI-LO', accent: '#3DD68C' },
    ],
    prizeTable: [
      { place: '1', prize: '75 000 ₽' },
      { place: '2', prize: '40 000 ₽' },
      { place: '3', prize: '20 000 ₽' },
      { place: '4–10', prize: '5 000 ₽' },
      { place: '11–100', prize: '1 000 ₽' },
    ],
    leaderboard: [
      { rank: 1, player: 'Champion_X', points: 45200, win: '75 000 ₽' },
      { rank: 2, player: 'Mara_K', points: 38100, win: '40 000 ₽' },
      { rank: 3, player: 'Dmitriy', points: 32400, win: '20 000 ₽' },
      { rank: 1, player: 'USERNAME', points: 15600, win: '1 000 ₽', isMe: true },
    ],
    myStats: {
      place: 47,
      points: 15600,
      bets: 210,
      turnover: '1 560 000 ₽',
      projectedWin: '1 000 ₽',
    },
  },
  {
    id: 't5',
    name: 'Crash Masters',
    provider: 'Originals',
    category: 'Originals',
    banner: '/images/cashback/4aefdf7b-de40-4c1e-9a5d-c9f85af0fb78.jpg',
    prizePool: '300 000 ₽',
    minBet: '50 ₽',
    startsAt: '20.08.2024 12:00',
    endsAt: '25.08.2024 23:59',
    startsAtTimestamp: now + 15 * DAY,
    endsAtTimestamp: now + 20 * DAY,
    participants: 0,
    status: 'upcoming',
    freeEntry: true,
    description:
      'Турнир для мастеров Crash. Успевайте забрать максимальный множитель и возглавить таблицу лидеров.',
    rules: [
      'Минимальная ставка — 50 ₽',
      'Очки начисляются за максимальный множитель выигрыша',
      'Только игра CRASH участвует',
      'Призы получают топ-20 игроков',
    ],
    winnersCount: 20,
    games: [
      { id: 'g6', name: 'CRASH', accent: '#FF4D6D' },
    ],
    prizeTable: [
      { place: '1', prize: '30 000 ₽' },
      { place: '2', prize: '20 000 ₽' },
      { place: '3', prize: '10 000 ₽' },
      { place: '4–10', prize: '3 000 ₽' },
      { place: '11–20', prize: '1 000 ₽' },
    ],
    leaderboard: [],
    myStats: null,
  },
  {
    id: 't6',
    name: 'Plinko Festival',
    provider: 'Originals',
    category: 'Originals',
    banner: '/images/slider/5abbd92b-d14e-448f-a31b-9743c7913778.jpg',
    prizePool: '150 000 ₽',
    minBet: '25 ₽',
    startsAt: '10.07.2024 00:00',
    endsAt: '20.07.2024 23:59',
    startsAtTimestamp: now - 30 * DAY,
    endsAtTimestamp: now - 15 * DAY,
    participants: 678,
    status: 'finished',
    freeEntry: true,
    description:
      'Фестиваль Plinko завершён. Спасибо всем участникам — призовой фонд распределён среди топ-30 игроков.',
    rules: [
      'Минимальная ставка — 25 ₽',
      '1 очко за каждые 50 ₽ оборота',
      'Только игра PLINKO участвует',
      'Призы получили топ-30 игроков',
    ],
    winnersCount: 30,
    games: [
      { id: 'g7', name: 'PLINKO', accent: '#A78BFA' },
    ],
    prizeTable: [
      { place: '1', prize: '15 000 ₽' },
      { place: '2', prize: '10 000 ₽' },
      { place: '3', prize: '5 000 ₽' },
      { place: '4–10', prize: '1 500 ₽' },
      { place: '11–30', prize: '500 ₽' },
    ],
    leaderboard: [
      { rank: 1, player: 'PlinkoKing', points: 22400, win: '15 000 ₽' },
      { rank: 2, player: 'Nika_777', points: 18900, win: '10 000 ₽' },
      { rank: 3, player: 'Igor_88', points: 14200, win: '5 000 ₽' },
    ],
    myStats: null,
  },
];

export const providers = ['Все провайдеры', 'Originals', 'Pragmatic Play'];
export const categories = ['Все категории', 'Originals', 'Слоты'];
export const fundRanges = ['Любой фонд', 'до 250 000 ₽', '250 000 – 500 000 ₽', '500 000 – 1 000 000 ₽'];
export const entryTypes = ['Любое участие', 'Бесплатные', 'Платные'];
