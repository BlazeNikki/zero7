export type GameInfo = {
  id: string;
  name: string;
  provider: string;
  art: string;
  accent: string;
  category: string;
  rtp: string;
  volatility: 'Низкая' | 'Средняя' | 'Высокая' | 'Очень высокая';
  maxWin: string;
  minBet: string;
  maxBet: string;
  added: string;
  description: string;
  features: string[];
  lines: string;
  rules: { title: string; body: string }[];
  paytable: { symbol: string; payout: string }[];
  hasDemo: boolean;
  tournament?: { name: string; fund: string; place: string };
  promo?: { type: string; value: string };
};

export const gamesData: GameInfo[] = [
  {
    id: 'g1',
    name: 'COIN FLIP',
    provider: 'Originals',
    art: 'coinflip',
    accent: '#FFD23F',
    category: 'Оригиналы',
    rtp: '98.00%',
    volatility: 'Низкая',
    maxWin: 'x2',
    minBet: '10 ₽',
    maxBet: '100 000 ₽',
    added: '15 марта 2024',
    description: 'Простая и быстрая игра с подбрасыванием монеты. Угадайте сторону — орёл или решка — и мгновенно получите выигрыш. Идеальна для разгона баланса и проверки удачи.',
    features: ['Мгновенный результат', 'Двойной выигрыш', 'История раундов'],
    lines: '—',
    rules: [
      { title: 'Цель игры', body: 'Угадать, какой стороной упадёт монета — орлом или решкой.' },
      { title: 'Выплата', body: 'При угадывании стороны выигрыш составляет x2 от ставки. Вероятность выпадения каждой стороны — 50%.' },
      { title: 'Бонусные функции', body: 'Дополнительных бонусных функций нет. Игра является чистой ставкой на шанс.' },
    ],
    paytable: [
      { symbol: 'Орёл', payout: 'x2' },
      { symbol: 'Решка', payout: 'x2' },
    ],
    hasDemo: true,
    tournament: { name: 'Originals Cup', fund: '500 000 ₽', place: '12' },
    promo: { type: 'Кешбэк', value: '5% на эту игру' },
  },
  {
    id: 'g2',
    name: 'DICE',
    provider: 'Originals',
    art: 'dice',
    accent: '#4DA8FF',
    category: 'Оригиналы',
    rtp: '99.00%',
    volatility: 'Средняя',
    maxWin: 'x9900',
    minBet: '10 ₽',
    maxBet: '100 000 ₽',
    added: '15 марта 2024',
    description: 'Классическая игра в кости с настраиваемой вероятностью. Выберите целевое число и множитель — чем выше риск, тем больше потенциальный выигрыш.',
    features: ['Настраиваемая вероятность', 'Автоигра', 'Множитель до x9900'],
    lines: '—',
    rules: [
      { title: 'Цель игры', body: 'Предсказать, выпадет ли число больше или меньше выбранного порога.' },
      { title: 'Выплата', body: 'Выплата рассчитывается как обратная вероятность: чем меньше шанс выигрыша, тем выше множитель.' },
      { title: 'Автоигра', body: 'Доступен режим автоматической игры с настройкой количества раундов и условий остановки.' },
    ],
    paytable: [
      { symbol: 'Меньше порога', payout: 'По вероятности' },
      { symbol: 'Больше порога', payout: 'По вероятности' },
    ],
    hasDemo: true,
  },
  {
    id: 'g3',
    name: 'HI-LO',
    provider: 'Originals',
    art: 'hilo',
    accent: '#3DD68C',
    category: 'Оригиналы',
    rtp: '98.50%',
    volatility: 'Средняя',
    maxWin: 'x1000',
    minBet: '10 ₽',
    maxBet: '50 000 ₽',
    added: '15 марта 2024',
    description: 'Угадайте, будет ли следующая карта выше или ниже текущей. Каждое правильное угадывание увеличивает множитель — заберите выигрыш в любой момент.',
    features: ['Карты от 2 до Туза', 'Каскадный множитель', 'Забрать в любой момент'],
    lines: '—',
    rules: [
      { title: 'Цель игры', body: 'Предсказать, будет ли следующая карта выше или ниже текущей.' },
      { title: 'Выплата', body: 'Множитель растёт с каждым угаданным шагом. Можно забрать выигрыш на любом шаге.' },
      { title: 'Особые карты', body: 'Туз — самая старшая карта, двойка — самая младшая. Вероятность зависит от текущей карты.' },
    ],
    paytable: [
      { symbol: 'Выше', payout: 'По вероятности' },
      { symbol: 'Ниже', payout: 'По вероятности' },
    ],
    hasDemo: true,
    tournament: { name: 'Originals Cup', fund: '500 000 ₽', place: '8' },
  },
  {
    id: 'g4',
    name: 'WHEEL',
    provider: 'Originals',
    art: 'wheel',
    accent: '#FF6B9D',
    category: 'Оригиналы',
    rtp: '98.00%',
    volatility: 'Средняя',
    maxWin: 'x50',
    minBet: '10 ₽',
    maxBet: '100 000 ₽',
    added: '15 марта 2024',
    description: 'Колесо фортуны с настраиваемыми секторами. Выберите количество секторов и риск — чем меньше сектор, тем выше выплата.',
    features: ['Настраиваемые секторы', 'До 10 уровней риска', 'Анимация вращения'],
    lines: '—',
    rules: [
      { title: 'Цель игры', body: 'Угадать сектор, на котором остановится колесо.' },
      { title: 'Выплата', body: 'Выплата зависит от размера сектора: чем меньше сектор, тем выше множитель.' },
      { title: 'Уровни риска', body: 'Доступно от 10 до 50 секторов. Чем больше секторов, тем выше максимальный множитель.' },
    ],
    paytable: [
      { symbol: 'Сектор 1', payout: 'x1.5' },
      { symbol: 'Сектор 2', payout: 'x2' },
      { symbol: 'Сектор 3', payout: 'x3' },
      { symbol: 'Сектор 10', payout: 'x50' },
    ],
    hasDemo: true,
  },
  {
    id: 'g5',
    name: 'MINES',
    provider: 'Originals',
    art: 'mines',
    accent: '#FF9E2C',
    category: 'Оригиналы',
    rtp: '99.00%',
    volatility: 'Высокая',
    maxWin: 'x2400',
    minBet: '10 ₽',
    maxBet: '50 000 ₽',
    added: '15 марта 2024',
    description: 'Игра в стиле сапёр. Выберите количество мин на поле и открывайте ячейки. Каждая безопасная ячейка увеличивает выигрыш — но попадание на мину заканчивает игру.',
    features: ['До 24 мин на поле', 'Каскадный множитель', 'Забрать в любой момент'],
    lines: '—',
    rules: [
      { title: 'Цель игры', body: 'Открывать ячейки на поле, избегая мин.' },
      { title: 'Выплата', body: 'Каждая открытая безопасная ячейка увеличивает множитель. Можно забрать выигрыш в любой момент.' },
      { title: 'Количество мин', body: 'От 1 до 24 мин на поле 5x5. Чем больше мин, тем выше множитель за каждую ячейку.' },
    ],
    paytable: [
      { symbol: '1 мина', payout: 'x1.03 за ячейку' },
      { symbol: '5 мин', payout: 'x1.18 за ячейку' },
      { symbol: '24 мины', payout: 'x2400 (макс.)' },
    ],
    hasDemo: true,
    promo: { type: 'Фриспины', value: '20 FS на MINES' },
  },
  {
    id: 'g6',
    name: 'CRASH',
    provider: 'Originals',
    art: 'crash',
    accent: '#FF4D6D',
    category: 'Оригиналы',
    rtp: '99.00%',
    volatility: 'Очень высокая',
    maxWin: 'x1000',
    minBet: '10 ₽',
    maxBet: '100 000 ₽',
    added: '15 марта 2024',
    description: 'Множитель растёт с каждой секундой — заберите выигрыш до того, как график рухнет. Чем дольше ждёте, тем больше выигрыш, но и риск выше.',
    features: ['Живой график', 'Автовывод', 'История раундов'],
    lines: '—',
    rules: [
      { title: 'Цель игры', body: 'Забрать выигрыш до того, как множитель обрушится.' },
      { title: 'Выплата', body: 'Множитель растёт от 1.00x. Выигрыш = ставка × множитель на момент вывода.' },
      { title: 'Автовывод', body: 'Можно настроить автоматический вывод при достижении заданного множителя.' },
    ],
    paytable: [
      { symbol: 'x1.5', payout: 'Низкий риск' },
      { symbol: 'x2', payout: 'Средний риск' },
      { symbol: 'x10+', payout: 'Высокий риск' },
    ],
    hasDemo: true,
    tournament: { name: 'Originals Cup', fund: '500 000 ₽', place: '5' },
  },
  {
    id: 'g7',
    name: 'PLINKO',
    provider: 'Originals',
    art: 'plinko',
    accent: '#A78BFA',
    category: 'Оригиналы',
    rtp: '99.00%',
    volatility: 'Высокая',
    maxWin: 'x1000',
    minBet: '10 ₽',
    maxBet: '50 000 ₽',
    added: '15 марта 2024',
    description: 'Шарик падает через поле пирамидальных штырей, отклоняясь влево или вправо. Выберите уровень риска и количество рядов — множитель зависит от того, в какой сектор упадёт шарик.',
    features: ['8–16 рядов', '4 уровня риска', 'Множитель до x1000'],
    lines: '—',
    rules: [
      { title: 'Цель игры', body: 'Шарик падает через поле штырей и попадает в сектор с множителем.' },
      { title: 'Выплата', body: 'Крайние секторы дают максимальный множитель, центральные — минимальный.' },
      { title: 'Уровни риска', body: 'Низкий, Средний, Высокий, Очень высокий — определяют разброс множителей.' },
    ],
    paytable: [
      { symbol: 'Центр', payout: 'x1' },
      { symbol: 'Край', payout: 'x1000 (макс.)' },
    ],
    hasDemo: true,
    promo: { type: 'Бонус', value: '+10% к выигрышу' },
  },
];

export type RecentWin = {
  id: string;
  nick: string;
  game: string;
  amount: string;
  time: string;
};

export const recentWins: RecentWin[] = [
  { id: 'rw1', nick: 'Alex_92', game: 'Coin Flip', amount: '84 200 ₽', time: '2 мин назад' },
  { id: 'rw2', nick: 'Mara_K', game: 'Dice', amount: '15 600 ₽', time: '5 мин назад' },
  { id: 'rw3', nick: 'Dmitriy', game: 'Crash', amount: '421 000 ₽', time: '8 мин назад' },
  { id: 'rw4', nick: 'Nika_777', game: 'Plinko', amount: '9 800 ₽', time: '12 мин назад' },
  { id: 'rw5', nick: 'Viktor', game: 'Mines', amount: '67 400 ₽', time: '15 мин назад' },
  { id: 'rw6', nick: 'Oleg_T', game: 'Wheel', amount: '23 500 ₽', time: '18 мин назад' },
  { id: 'rw7', nick: 'Lena_K', game: 'Hi-Lo', amount: '12 100 ₽', time: '22 мин назад' },
];

export type BetHistory = {
  id: string;
  time: string;
  bet: string;
  win: string;
  result: 'win' | 'loss';
};

export const betHistory: BetHistory[] = [
  { id: 'bh1', time: '21:42', bet: '500 ₽', win: '1 000 ₽', result: 'win' },
  { id: 'bh2', time: '21:38', bet: '200 ₽', win: '0 ₽', result: 'loss' },
  { id: 'bh3', time: '21:35', bet: '1 000 ₽', win: '2 500 ₽', result: 'win' },
  { id: 'bh4', time: '21:30', bet: '300 ₽', win: '0 ₽', result: 'loss' },
  { id: 'bh5', time: '21:25', bet: '500 ₽', win: '1 200 ₽', result: 'win' },
];
