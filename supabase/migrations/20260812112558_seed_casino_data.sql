/*
# Seed casino database with initial data

Populates all tables with the data that was previously hardcoded in the
TypeScript data files (src/data.ts, src/cabinet/data.ts).

## Tables populated

1. profiles — single user profile row
2. balances — single balance row
3. bonuses — 4 bonus records
4. game_history — 8 game round records
5. finance_history — 7 transaction records
6. verification_docs — 4 KYC documents
7. sessions — 3 active sessions
8. responsible_limits — single limits row
9. vip_program — single VIP row with perks and history as JSONB
10. tournaments — 3 tournament records
11. referrals — single referral row with history as JSONB
12. notifications — 4 notification records
13. support_tickets — 2 ticket records
14. faq_items — 4 FAQ entries
15. winners — 5 winner records
16. chat_messages — 8 chat messages
17. games — 7 game catalog entries
*/

-- profiles
INSERT INTO profiles (id, nickname, user_id_tag, vip_level, registered_at, verified, email, phone, first_name, last_name, birth_date, country, city, currency, language, avatar)
VALUES ('main', 'USERNAME', '#7041928', 7, '12 марта 2023', true, 'user@example.com', '+7 9XX 123-45-67', 'Иван', 'Иванов', '15.06.1992', 'Россия', 'Москва', 'RUB', 'Русский', 'https://images.pexels.com/photos/29261090/pexels-photo-29261090.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- balances
INSERT INTO balances (id, main, bonus, freespins, vip_points, in_processing, total_deposits, total_withdrawals)
VALUES ('main', 125000.0, 18400.0, 120, 8430, 5000.0, 842000.0, 610000.0)
ON CONFLICT (id) DO NOTHING;

-- bonuses
INSERT INTO bonuses (id, name, amount, received_at, expires_at, wager_progress, wager_remaining, status) VALUES
('b1', 'Приветственный бонус 100%', '50 000 ₽', '12.03.2024', '12.04.2024', 65, '17 500 ₽', 'active'),
('b2', 'Фриспины в Wild West Gold', '50 FS', '01.03.2024', '15.03.2024', 100, '0 ₽', 'used'),
('b3', 'Кэшбэк 10%', '3 200 ₽', '20.02.2024', '27.02.2024', 40, '1 920 ₽', 'expired'),
('b4', 'Бонус за депозит 50%', '25 000 ₽', '10.02.2024', '24.02.2024', 0, '25 000 ₽', 'cancelled')
ON CONFLICT (id) DO NOTHING;

-- game_history
INSERT INTO game_history (id, date, game, provider, bet, win, status) VALUES
('gh1', '05.08.2024 21:14', 'Gates of Olympus', 'Pragmatic Play', 500, 1250, 'win'),
('gh2', '05.08.2024 21:08', 'Sweet Bonanza', 'Pragmatic Play', 300, 0, 'loss'),
('gh3', '05.08.2024 20:55', 'Wild West Gold', 'Pragmatic Play', 200, 800, 'win'),
('gh4', '05.08.2024 20:41', 'Book of Dead', 'Play''n GO', 100, 0, 'loss'),
('gh5', '05.08.2024 20:30', 'Big Bass Bonanza', 'Pragmatic Play', 400, 0, 'pending'),
('gh6', '04.08.2024 23:12', 'Gates of Olympus', 'Pragmatic Play', 500, 3200, 'win'),
('gh7', '04.08.2024 22:50', 'Sugar Rush X', 'Pragmatic Play', 250, 0, 'loss'),
('gh8', '04.08.2024 22:30', 'Sweet Bonanza', 'Pragmatic Play', 300, 900, 'win')
ON CONFLICT (id) DO NOTHING;

-- finance_history
INSERT INTO finance_history (id, date, type, amount, currency, method, status, tx_id) VALUES
('f1', '05.08.2024 18:20', 'deposit', 50000, 'RUB', 'VISA •• 4421', 'completed', 'TXN-902841'),
('f2', '04.08.2024 14:05', 'withdraw', 30000, 'RUB', 'СБП', 'completed', 'TXN-902734'),
('f3', '03.08.2024 10:15', 'bonus', 5000, 'RUB', '—', 'completed', 'TXN-902510'),
('f4', '02.08.2024 21:30', 'deposit', 20000, 'RUB', 'BTC', 'completed', 'TXN-902300'),
('f5', '01.08.2024 16:45', 'refund', 3200, 'RUB', '—', 'completed', 'TXN-902100'),
('f6', '01.08.2024 09:00', 'withdraw', 15000, 'RUB', 'VISA •• 4421', 'pending', 'TXN-902050'),
('f7', '30.07.2024 19:20', 'adjustment', -500, 'RUB', '—', 'rejected', 'TXN-901980')
ON CONFLICT (id) DO NOTHING;

-- verification_docs
INSERT INTO verification_docs (id, name, status, uploaded_at, comment) VALUES
('d1', 'Паспорт', 'approved', '15.03.2024', NULL),
('d2', 'ID-карта', 'approved', '15.03.2024', NULL),
('d3', 'Селфи с документом', 'pending', '02.08.2024', 'На проверке. Обычно занимает до 24 часов.'),
('d4', 'Подтверждение адреса', 'not_uploaded', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- sessions
INSERT INTO sessions (id, ip, browser, os, country, last_active, current) VALUES
('s1', '92.124.18.42', 'Chrome 127', 'Windows 11', 'Россия, Москва', 'Сейчас', true),
('s2', '188.43.21.90', 'Safari 17', 'iOS 17', 'Россия, Москва', '2 часа назад', false),
('s3', '5.128.77.10', 'Chrome 125', 'Android 14', 'Россия, Казань', 'Вчера, 23:15', false)
ON CONFLICT (id) DO NOTHING;

-- responsible_limits
INSERT INTO responsible_limits (id, deposit_limit_value, deposit_limit_period, deposit_limit_active, loss_limit_value, loss_limit_period, loss_limit_active, bet_limit_value, bet_limit_period, bet_limit_active, time_limit_value, time_limit_period, time_limit_active)
VALUES ('main', 100000, 'месяц', true, 50000, 'месяц', true, 5000, 'день', false, 4, 'час/день', true)
ON CONFLICT (id) DO NOTHING;

-- vip_program
INSERT INTO vip_program (id, current_level, level_name, points, next_level_points, prev_level_points, perks, history)
VALUES ('main', 7, 'Platinum', 8430, 10000, 7500,
  '["Персональный менеджер 24/7","Повышенный кэшбэк до 10%","Эксклюзивные турниры","Бонусы на каждый депозит","Приоритетный вывод средств"]',
  '[{"level":7,"name":"Platinum","date":"01.07.2024"},{"level":6,"name":"Gold","date":"15.04.2024"},{"level":5,"name":"Silver","date":"20.01.2024"},{"level":4,"name":"Bronze","date":"05.11.2023"},{"level":1,"name":"New","date":"12.03.2023"}]'
)
ON CONFLICT (id) DO NOTHING;

-- tournaments
INSERT INTO tournaments (id, name, prize_pool, user_place, user_points, ends_at) VALUES
('t1', 'PLAY & WIN', '1 000 000 ₽', 4, 8420, '07.08.2024 23:59'),
('t2', 'Summer Slots Race', '500 000 ₽', 23, 3210, '10.08.2024 23:59'),
('t3', 'Weekend Madness', '250 000 ₽', 1, 15600, 'Завершён')
ON CONFLICT (id) DO NOTHING;

-- referrals
INSERT INTO referrals (id, link, code, invited_count, total_earnings, history)
VALUES ('main', 'https://zero7.bet/r/7041928', 'ZERO7-7041928', 14, 28400,
  '[{"id":"r1","user":"Alex_92","date":"01.08.2024","amount":1200},{"id":"r2","user":"Mara_K","date":"28.07.2024","amount":800},{"id":"r3","user":"Nika_777","date":"20.07.2024","amount":2400},{"id":"r4","user":"Pavel","date":"15.07.2024","amount":500}]'
)
ON CONFLICT (id) DO NOTHING;

-- notifications
INSERT INTO notifications (id, category, title, text, date, read) VALUES
('n1', 'bonus', 'Бонус зачислен', 'Кэшбэк 3 200 ₽ зачислен на бонусный баланс.', '05.08.2024 12:00', false),
('n2', 'finance', 'Вывод средств', 'Заявка на вывод 15 000 ₽ обрабатывается.', '01.08.2024 09:05', false),
('n3', 'tournament', 'Турнир PLAY & WIN', 'Вы поднялись на 4 место! Продолжайте играть.', '04.08.2024 18:30', true),
('n4', 'system', 'Новый уровень VIP', 'Поздравляем! Вы достигли Platinum уровня.', '01.07.2024 00:00', true)
ON CONFLICT (id) DO NOTHING;

-- support_tickets
INSERT INTO support_tickets (id, subject, status, created_at, last_reply) VALUES
('tk1', 'Не зачислен депозит', 'answered', '03.08.2024', '04.08.2024'),
('tk2', 'Вопрос по отыгрышу бонуса', 'closed', '20.07.2024', '21.07.2024')
ON CONFLICT (id) DO NOTHING;

-- faq_items
INSERT INTO faq_items (question, answer) VALUES
('Сколько времени занимает вывод средств?', 'Вывод обрабатывается от 5 минут до 24 часов в зависимости от выбранного метода.'),
('Как отыграть бонус?', 'Бонус отыгрывается ставками х35. Прогресс отображается в разделе «Бонусы».'),
('Что нужно для верификации?', 'Понадобятся паспорт, селфи с документом и подтверждение адреса.'),
('Как получить VIP-статус?', 'VIP-уровни начисляются автоматически за активную игру и депозиты.')
ON CONFLICT DO NOTHING;

-- winners
INSERT INTO winners (id, name, game, amount, hue) VALUES
('w1', 'Alex_92', 'Gates of Olympus', 84200, 340),
('w2', 'Mara_K', 'Sugar Rush X', 15600, 28),
('w3', 'Dmitriy', 'Sweet Bonanza', 421000, 200),
('w4', 'Nika_777', 'Starlight Princess', 9800, 150),
('w5', 'Viktor', 'Big Bass Bonanza', 67400, 260)
ON CONFLICT (id) DO NOTHING;

-- chat_messages
INSERT INTO chat_messages (id, username, vip, time, text, hue) VALUES
('c1', 'Sergey_K', 3, '21:04', 'Кто играет в Gates сегодня? идет горка 🔥', 200),
('c2', 'Anna_777', 7, '21:05', 'Забрала 50к на sweet bonanza 🍭', 320),
('c3', 'Pavel', 1, '21:05', 'Подскажите по отыгрышу бонуса, какой вейджер?', 40),
('c4', 'Marina_K', 5, '21:06', 'Турнир топ, уже 4 место 🏆', 160),
('c5', 'Igor_88', 2, '21:07', 'Всем удачи 🍀', 280),
('c6', 'Lena', 6, '21:08', 'Кэшбэк зачислили, спасибо zero7 ❤️', 10),
('c7', 'Dmitriy', 4, '21:09', 'Лайв казино вечером зайдёт', 220),
('c8', 'Oleg_T', 9, '21:10', '5000x на starlight 💀', 100)
ON CONFLICT (id) DO NOTHING;

-- games
INSERT INTO games (id, name, provider, art, accent) VALUES
('g1', 'COIN FLIP', 'Originals', 'coinflip', '#FFD23F'),
('g2', 'DICE', 'Originals', 'dice', '#4DA8FF'),
('g3', 'HI-LO', 'Originals', 'hilo', '#3DD68C'),
('g4', 'WHEEL', 'Originals', 'wheel', '#FF6B9D'),
('g5', 'MINES', 'Originals', 'mines', '#FF9E2C'),
('g6', 'CRASH', 'Originals', 'crash', '#FF4D6D'),
('g7', 'PLINKO', 'Originals', 'plinko', '#A78BFA')
ON CONFLICT (id) DO NOTHING;
