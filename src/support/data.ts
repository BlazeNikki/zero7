export type TicketStatus = 'new' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';

export type TicketCategory =
  | 'deposit' | 'withdrawal' | 'bonuses' | 'tournaments' | 'promotions'
  | 'technical' | 'game_error' | 'verification' | 'account' | 'complaint' | 'other';

export type TicketMessage = {
  id: string;
  author: 'user' | 'operator';
  text: string;
  timestamp: string;
};

export type Ticket = {
  id: string;
  number: string;
  subject: string;
  category: TicketCategory;
  createdAt: string;
  lastReply: string;
  status: TicketStatus;
  messages: TicketMessage[];
};

export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  new: 'Новое',
  in_progress: 'В работе',
  waiting_user: 'Ожидает ответа',
  resolved: 'Решено',
  closed: 'Закрыто',
};

export const ticketStatusStyles: Record<TicketStatus, string> = {
  new: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  in_progress: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  waiting_user: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  closed: 'bg-white/10 text-white/40 border-white/20',
};

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  deposit: 'Пополнение счета',
  withdrawal: 'Вывод средств',
  bonuses: 'Бонусы',
  tournaments: 'Турниры',
  promotions: 'Акции',
  technical: 'Техническая проблема',
  game_error: 'Ошибка игры',
  verification: 'Верификация',
  account: 'Аккаунт',
  complaint: 'Жалоба',
  other: 'Другое',
};

export const ticketCategories: { value: TicketCategory; label: string }[] = [
  { value: 'deposit', label: 'Пополнение счета' },
  { value: 'withdrawal', label: 'Вывод средств' },
  { value: 'bonuses', label: 'Бонусы' },
  { value: 'tournaments', label: 'Турниры' },
  { value: 'promotions', label: 'Акции' },
  { value: 'technical', label: 'Техническая проблема' },
  { value: 'game_error', label: 'Ошибка игры' },
  { value: 'verification', label: 'Верификация' },
  { value: 'account', label: 'Аккаунт' },
  { value: 'complaint', label: 'Жалоба' },
  { value: 'other', label: 'Другое' },
];

export const faqCategories = [
  'Регистрация', 'Пополнение', 'Вывод средств', 'Бонусы', 'Кешбек',
  'Турниры', 'Игры', 'Верификация', 'Безопасность', 'Аккаунт',
];

export const faqItems: FaqItem[] = [
  { id: 'f1', category: 'Регистрация', question: 'Как зарегистрироваться на сайте?', answer: 'Нажмите кнопку «Регистрация» в правом верхнем углу, заполните форму: укажите email, пароль и валюту. После регистрации подтвердите email по ссылке из письма.' },
  { id: 'f2', category: 'Регистрация', question: 'Можно ли создать несколько аккаунтов?', answer: 'Нет, правила сайта запрещают создание нескольких аккаунтов одному пользователю. При обнаружении дублирующих аккаунтов все они могут быть заблокированы.' },
  { id: 'f3', category: 'Регистрация', question: 'Что делать, если не приходит письмо подтверждения?', answer: 'Проверьте папку «Спам». Если письма нет, запросите повторную отправку в настройках аккаунта или обратитесь в поддержку.' },
  { id: 'f4', category: 'Пополнение', question: 'Какие способы пополнения доступны?', answer: 'Доступны: банковские карты (Visa, Mastercard), криптовалюта (BTC, ETH, USDT), электронные кошельки. Минимальная сумма пополнения — 500 ₽.' },
  { id: 'f5', category: 'Пополнение', question: 'Как быстро зачисляются средства?', answer: 'Пополнение через карты и электронные кошельки зачисляется мгновенно. Криптоплатежи — в течение 10–30 минут после подтверждения сети.' },
  { id: 'f6', category: 'Пополнение', question: 'Есть ли комиссия за пополнение?', answer: 'Комиссия за пополнение не взимается. Однако комиссия может удерживаться платёжной системой или криптосетью.' },
  { id: 'f7', category: 'Вывод средств', question: 'Как быстро выводятся средства?', answer: 'Заявка на вывод обрабатывается в течение 24 часов. После одобрения средства поступают на ваш платёжный метод в течение 1–3 рабочих дней.' },
  { id: 'f8', category: 'Вывод средств', question: 'Почему вывод задерживается?', answer: 'Вывод может задерживаться при: верификации аккаунта, сумме вывода более 50 000 ₽, технических работах платёжной системы. Если задержка более 48 часов — обратитесь в поддержку.' },
  { id: 'f9', category: 'Вывод средств', question: 'Какой минимальный и максимальный вывод?', answer: 'Минимальная сумма вывода — 1 000 ₽. Максимальная — 500 000 ₽ в сутки и 2 000 000 ₽ в месяц для обычных игроков. VIP-игроки имеют повышенные лимиты.' },
  { id: 'f10', category: 'Бонусы', question: 'Как активировать бонус?', answer: 'Бонусы активируются автоматически при пополнении или вводе промокода в личном кабинете. Некоторые бонусы требуют активации в разделе «Мои бонусы».' },
  { id: 'f11', category: 'Бонусы', question: 'Что такое вейджер?', answer: 'Вейджер — это коэффициент отыгрыша бонуса. Например, вейджер x35 означает, что сумму бонуса нужно проставить 35 раз, прежде чем вывести выигрыш.' },
  { id: 'f12', category: 'Бонусы', question: 'Можно ли отказаться от бонуса?', answer: 'Да, вы можете отказаться от бонуса в личном кабинете до начала отыгрыша. При отказе бонус и выигрыш с него аннулируются.' },
  { id: 'f13', category: 'Кешбек', question: 'Когда начисляется кешбек?', answer: 'Еженедельный кешбек начисляется каждый понедельник до 12:00 за предыдущую неделю. Ежемесячный — в первый рабочий день месяца.' },
  { id: 'f14', category: 'Кешбек', question: 'Нужно ли отыгрывать кешбек?', answer: 'Нет, кешбек зачисляется на основной баланс и не требует отыгрыша. Вы можете сразу использовать или вывести эти средства.' },
  { id: 'f15', category: 'Турниры', question: 'Как участвовать в турнире?', answer: 'Откройте раздел «Турниры», выберите активный турнир и делайте ставки в играх турнира. Очки начисляются автоматически за каждую ставку.' },
  { id: 'f16', category: 'Турниры', question: 'Как начисляются очки в турнире?', answer: 'Очки начисляются за оборот средств в играх турнира. Обычно 1 очко за каждые 100 ₽ ставки. Точный коэффициент указан в правилах каждого турнира.' },
  { id: 'f17', category: 'Игры', question: 'Какие провайдеры игр доступны?', answer: 'На сайте представлены игры от Originals, Pragmatic Play и других провайдеров. Полный список доступен в разделе «Казино».' },
  { id: 'f18', category: 'Игры', question: 'Что делать, если игра не загружается?', answer: 'Попробуйте обновить страницу, очистить кэш браузера или использовать другой браузер. Если проблема persists — обратитесь в поддержку с описанием ошибки.' },
  { id: 'f19', category: 'Верификация', question: 'Как пройти верификацию?', answer: 'Загрузите в личном кабинете фото документа, удостоверяющего личность, и селфи с этим документом. Верификация занимает до 24 часов.' },
  { id: 'f20', category: 'Верификация', question: 'Зачем нужна верификация?', answer: 'Верификация необходима для безопасности вашего аккаунта и соблюдения требований AML/KYC. Без верификации вывод средств недоступен.' },
  { id: 'f21', category: 'Безопасность', question: 'Как защитить аккаунт от взлома?', answer: 'Используйте сложный пароль, включите двухфакторную аутентификацию, не сообщайте пароль третьим лицам и не переходите по подозрительным ссылкам.' },
  { id: 'f22', category: 'Безопасность', question: 'Что делать, если аккаунт взломан?', answer: 'Немедленно обратитесь в поддержку через email или чат, измените пароль и по возможности включите 2FA. Мы заблокируем аккаунт для защиты средств.' },
  { id: 'f23', category: 'Аккаунт', question: 'Как изменить email или пароль?', answer: 'Email изменяется в настройках аккаунта с подтверждением нового адреса. Пароль можно изменить в разделе «Безопасность».' },
  { id: 'f24', category: 'Аккаунт', question: 'Как удалить аккаунт?', answer: 'Для удаления аккаунта обратитесь в поддержку. Удаление возможно только после вывода всех средств и завершения активных бонусов.' },
];

export const myTickets: Ticket[] = [
  {
    id: 't1',
    number: '#4821',
    subject: 'Не зачислился бонус на первый депозит',
    category: 'bonuses',
    createdAt: '03.08.2024 14:22',
    lastReply: '03.08.2024 15:10',
    status: 'resolved',
    messages: [
      { id: 'm1', author: 'user', text: 'Здравствуйте! Я пополнил счёт на 5 000 ₽, но приветственный бонус 100% не зачислился. Пополнение прошло успешно.', timestamp: '03.08.2024 14:22' },
      { id: 'm2', author: 'operator', text: 'Здравствуйте! Проверили ваш аккаунт — бонус начислен. Проверьте раздел «Мои бонусы» в личном кабинете. Если бонуса нет, уточните время пополнения.', timestamp: '03.08.2024 14:45' },
      { id: 'm3', author: 'user', text: 'Проверил, бонус появился. Спасибо!', timestamp: '03.08.2024 15:10' },
    ],
  },
  {
    id: 't2',
    number: '#4835',
    subject: 'Задержка вывода средств',
    category: 'withdrawal',
    createdAt: '04.08.2024 09:15',
    lastReply: '04.08.2024 11:30',
    status: 'in_progress',
    messages: [
      { id: 'm1', author: 'user', text: 'Подал заявку на вывод 20 000 ₽ вчера вечером, но средства ещё не поступили. Заявка в обработке уже 14 часов.', timestamp: '04.08.2024 09:15' },
      { id: 'm2', author: 'operator', text: 'Здравствуйте! Ваша заявка на вывод находится на проверке из-за суммы более 10 000 ₽. Ожидаемое время обработки — до 24 часов. Мы уведомим вас о завершении.', timestamp: '04.08.2024 11:30' },
    ],
  },
  {
    id: 't3',
    number: '#4840',
    subject: 'Вопрос по турнирным очкам',
    category: 'tournaments',
    createdAt: '05.08.2024 18:00',
    lastReply: '05.08.2024 18:00',
    status: 'waiting_user',
    messages: [
      { id: 'm1', author: 'user', text: 'В турнире PLAY & WIN у меня 8420 очков, но я делал ставки на 842 000 ₽. По правилам 1 очко за 100 ₽ — должно быть 8420. Всё верно?', timestamp: '05.08.2024 18:00' },
    ],
  },
];

export const contactChannels = [
  { id: 'chat', name: 'Онлайн-чат', description: 'Мгновенное общение с оператором', icon: 'MessageCircle', available: true, action: 'Открыть чат' },
  { id: 'email', name: 'Email', description: 'support@zero7.com — ответ в течение 24 часов', icon: 'Mail', available: true, action: 'Написать' },
  { id: 'telegram', name: 'Telegram', description: '@zero7_support — быстрый ответ в мессенджере', icon: 'Send', available: true, action: 'Открыть' },
  { id: 'whatsapp', name: 'WhatsApp', description: '+7 900 000-00-00 — связь через WhatsApp', icon: 'MessageSquare', available: true, action: 'Открыть' },
];

export const usefulLinks = [
  { label: 'Правила сайта', href: '#' },
  { label: 'Политика конфиденциальности', href: '#' },
  { label: 'Ответственная игра', href: '#' },
  { label: 'AML/KYC', href: '#' },
  { label: 'Пользовательское соглашение', href: '#' },
];
