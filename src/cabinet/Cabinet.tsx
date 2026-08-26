import { useState, useEffect, type ReactNode } from 'react';
import {
  LayoutDashboard, Wallet, Gift, Gamepad2, Receipt, UserCircle, ShieldCheck, Lock,
  HeartHandshake, Crown, Trophy, Share2, Bell, Headphones, ChevronLeft, Plus, ArrowDownToLine,
  ArrowUpFromLine, History, Check, Upload, Smartphone, LogOut, Copy, Search, Send,
  QrCode, AlertTriangle, X,
} from 'lucide-react';
import {
  Card, SectionTitle, ProgressBar, Badge, Button, Input, Select, Table, TableRow, Td,
  FilterTabs, Pagination,
} from './ui';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { fetchCabinetData, type CabinetData } from './data';
import { useWallet, openWalletModal } from '@/lib/wallet';
import { createContext, useContext } from 'react';

// ===== Cabinet data context =====
const CabinetDataContext = createContext<CabinetData | null>(null);
function useCabinetData(): CabinetData {
  const data = useContext(CabinetDataContext);
  if (!data) throw new Error('useCabinetData must be used within Cabinet');
  return data;
}

// ===== Toast =====
type Toast = { id: number; text: string };
let toastId = 0;

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="bg-black border border-white/20 rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl animate-toast-in">
          <Check size={16} className="text-emerald-400" strokeWidth={2.5} />
          <span className="text-white text-[13px] font-semibold">{t.text}</span>
        </div>
      ))}
    </div>
  );
}

// ===== Balance cards =====
function BalanceCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <Card className="p-5 flex flex-col gap-1">
      <span className="text-white/40 text-[10px] font-bold tracking-wider uppercase">{label}</span>
      <span className={`text-[24px] font-black tracking-tight tabular-nums ${accent ?? 'text-white'}`}>{value}</span>
      {sub && <span className="text-white/30 text-[11px] font-medium">{sub}</span>}
    </Card>
  );
}

// ===== Section 1: Dashboard =====
function Dashboard({ go }: { go: (s: string) => void }) {
  const wallet = useWallet();
  const { userProfile, balances, bonuses } = useCabinetData();
  return (
    <div>
      <SectionTitle icon={LayoutDashboard}>Личный кабинет</SectionTitle>

      {/* User info */}
      <Card className="p-5 md:p-6 mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <img src={userProfile.avatar} alt="" className="w-16 h-16 rounded-full object-cover border border-white/20 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-white font-black text-[20px] tracking-tight">{userProfile.nickname}</h3>
              <span className="text-[10px] text-white/40 font-bold tracking-[0.2em] border border-white/15 rounded px-2 py-1 leading-none">VIP {userProfile.vipLevel}</span>
              <Badge status={userProfile.verified ? 'approved' : 'not_uploaded'} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-[12px]">
              <span className="text-white/30">ID: <span className="text-white/60 font-semibold">{userProfile.userId}</span></span>
              <span className="text-white/30">Регистрация: <span className="text-white/60 font-semibold">{userProfile.registeredAt}</span></span>
            </div>
          </div>
        </div>
      </Card>

      {/* Balances */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <BalanceCard label="Крипто-кошелёк" value={wallet.isConnected ? `${wallet.balance} ${wallet.chain === 'solana' ? 'SOL' : 'ETH'}` : 'Не подключён'} sub={wallet.isConnected ? (wallet.balanceUsd || undefined) : 'Solflare'} accent={wallet.isConnected ? 'text-emerald-400' : 'text-white/40'} />
        <BalanceCard label="Бонусный баланс" value={`${balances.bonus.toLocaleString('ru-RU')} ₽`} accent="text-amber-400" />
        <BalanceCard label="Фриспины" value={`${balances.freespins}`} sub="доступно" accent="text-sky-400" />
        <BalanceCard label="VIP Points" value={`${balances.vipPoints.toLocaleString('ru-RU')}`} sub="очков" accent="text-emerald-400" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button onClick={() => wallet.requireWallet(() => go('balance'))} className="bg-white text-black font-black text-[12px] tracking-[0.15em] rounded-xl py-4 flex items-center justify-center gap-2.5 hover:bg-white/90 transition-colors">
          <Plus size={18} strokeWidth={2.5} /> ПОПОЛНИТЬ
        </button>
        <button onClick={() => wallet.requireWallet(() => go('balance'))} className="border border-white/25 text-white font-black text-[12px] tracking-[0.15em] rounded-xl py-4 flex items-center justify-center gap-2.5 hover:bg-white/10 transition-colors">
          <ArrowUpFromLine size={17} strokeWidth={2.5} /> ВЫВЕСТИ СРЕДСТВА
        </button>
        <button onClick={() => wallet.requireWallet(() => go('finance'))} className="border border-white/25 text-white font-black text-[12px] tracking-[0.15em] rounded-xl py-4 flex items-center justify-center gap-2.5 hover:bg-white/10 transition-colors">
          <History size={17} strokeWidth={2.5} /> ИСТОРИЯ ОПЕРАЦИЙ
        </button>
      </div>

      {/* Active bonus preview */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-black text-[13px] tracking-[0.15em]">АКТИВНЫЙ БОНУС</h4>
          <button onClick={() => go('bonuses')} className="text-white/30 hover:text-white text-[11px] font-bold tracking-wide transition-colors">ПОДРОБНЕЕ ›</button>
        </div>
        {bonuses.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-[14px] font-bold">{bonuses[0].name}</span>
              <span className="text-amber-400 font-black text-[14px]">{bonuses[0].amount}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1"><ProgressBar value={bonuses[0].wagerProgress} accent="bg-amber-400" /></div>
              <span className="text-white/50 text-[11px] font-bold tabular-nums whitespace-nowrap">{bonuses[0].wagerProgress}% · {bonuses[0].wagerRemaining}</span>
            </div>
          </>
        ) : (
          <p className="text-white/30 text-[13px] text-center py-6">Нет активных бонусов</p>
        )}
      </Card>
    </div>
  );
}

// ===== Section 2: Balance =====
function BalanceSection({ toast }: { toast: (t: string) => void }) {
  const wallet = useWallet();
  const { balances } = useCabinetData();
  return (
    <div>
      <SectionTitle icon={Wallet}>Баланс</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <BalanceCard label="Solflare кошелёк" value={wallet.isConnected ? `${wallet.balance} ${wallet.chain === 'solana' ? 'SOL' : 'ETH'}` : 'Не подключён'} sub={wallet.isConnected ? (wallet.balanceUsd || wallet.displayAddress || undefined) : 'Нажмите для подключения'} accent={wallet.isConnected ? 'text-emerald-400' : 'text-white/40'} />
        <BalanceCard label="Бонусный баланс" value={`${balances.bonus.toLocaleString('ru-RU')} ₽`} accent="text-amber-400" />
        <BalanceCard label="Средства в обработке" value={`${balances.inProcessing.toLocaleString('ru-RU')} ₽`} accent="text-amber-400" />
        <BalanceCard label="Всего депозитов" value={`${balances.totalDeposits.toLocaleString('ru-RU')} ₽`} accent="text-emerald-400" />
        <BalanceCard label="Всего выводов" value={`${balances.totalWithdrawals.toLocaleString('ru-RU')} ₽`} accent="text-sky-400" />
        <BalanceCard label="Фриспины" value={`${balances.freespins}`} sub="доступно" accent="text-sky-400" />
      </div>
      {!wallet.isConnected && (
        <Card className="p-5 mb-4 border-emerald-500/30">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Wallet size={20} className="text-emerald-400" strokeWidth={2} />
              <div>
                <p className="text-white font-bold text-[13px]">Подключите Solflare кошелёк</p>
                <p className="text-white/40 text-[11px] mt-0.5">Используйте баланс крипто-кошелька для ставок</p>
              </div>
            </div>
            <button onClick={openWalletModal} disabled={wallet.isConnecting} className="bg-emerald-500 text-black font-black text-[12px] tracking-widest rounded-lg px-5 py-2.5 hover:bg-emerald-400 transition-colors whitespace-nowrap disabled:opacity-50">
              {wallet.isConnecting ? 'ПОДКЛЮЧЕНИЕ…' : 'ПОДКЛЮЧИТЬ'}
            </button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button onClick={() => wallet.requireWallet(() => toast('Счёт пополнен на 10 000 ₽'))}><span className="flex items-center justify-center gap-2"><ArrowDownToLine size={16} strokeWidth={2.5} /> ПОПОЛНИТЬ</span></Button>
        <Button variant="ghost" onClick={() => wallet.requireWallet(() => toast('Создана заявка на вывод'))}><span className="flex items-center justify-center gap-2"><ArrowUpFromLine size={16} strokeWidth={2.5} /> ВЫВЕСТИ</span></Button>
        <Button variant="ghost" onClick={() => wallet.requireWallet(() => toast('Открыта история операций'))}><span className="flex items-center justify-center gap-2"><History size={16} strokeWidth={2.5} /> ИСТОРИЯ</span></Button>
      </div>
    </div>
  );
}

// ===== Section 3: Bonuses =====
function BonusesSection() {
  const { bonuses } = useCabinetData();
  const [tab, setTab] = useState('active');
  const filtered = bonuses.filter((b) => (tab === 'all' ? true : b.status === tab));
  return (
    <div>
      <SectionTitle icon={Gift}>Бонусы</SectionTitle>
      <div className="mb-5"><FilterTabs tabs={['active', 'used', 'expired', 'cancelled', 'all']} active={tab} onChange={setTab} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-bold text-[14px]">{b.name}</h4>
                <span className="text-white/30 text-[11px]">{b.receivedAt} — {b.expiresAt}</span>
              </div>
              <span className="text-amber-400 font-black text-[16px]">{b.amount}</span>
            </div>
            <Badge status={b.status} />
            {b.status === 'active' && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2 text-[11px] font-bold">
                  <span className="text-white/40 tracking-wider uppercase">Прогресс отыгрыша</span>
                  <span className="text-white/60 tabular-nums">{b.wagerProgress}% · {b.wagerRemaining}</span>
                </div>
                <ProgressBar value={b.wagerProgress} accent="bg-amber-400" />
              </div>
            )}
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-white/30 text-[13px] col-span-full text-center py-10">Нет бонусов в этой категории</p>}
      </div>
    </div>
  );
}

// ===== Section 4: Game history =====
function GameHistorySection() {
  const { gameHistory } = useCabinetData();
  const [period, setPeriod] = useState('today');
  const [gameFilter, setGameFilter] = useState('all');
  const [page, setPage] = useState(1);
  const games = [...new Set(gameHistory.map((g) => g.game))];
  let rows = gameHistory;
  if (gameFilter !== 'all') rows = rows.filter((r) => r.game === gameFilter);
  const perPage = 5;
  const totalPages = Math.ceil(rows.length / perPage);
  const pageRows = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <SectionTitle icon={Gamepad2}>История игр</SectionTitle>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <FilterTabs tabs={['today', 'week', 'month', 'period']} active={period} onChange={setPeriod} />
        <Select value={gameFilter} onChange={(e) => { setGameFilter(e.target.value); setPage(1); }} className="sm:w-48">
          <option value="all">Все игры</option>
          {games.map((g) => <option key={g} value={g}>{g}</option>)}
        </Select>
      </div>
      <Card className="p-4">
        <Table headers={['Дата', 'Игра', 'Провайдер', 'Ставка', 'Выигрыш', 'Результат', 'Статус']}>
          {pageRows.map((r) => (
            <TableRow key={r.id}>
              <Td className="text-white/50 whitespace-nowrap">{r.date}</Td>
              <Td className="text-white font-semibold">{r.game}</Td>
              <Td className="text-white/40">{r.provider}</Td>
              <Td className="text-white/60 tabular-nums">{r.bet.toLocaleString('ru-RU')} ₽</Td>
              <Td className={`tabular-nums font-bold ${r.win > 0 ? 'text-emerald-400' : 'text-white/30'}`}>{r.win > 0 ? `${r.win.toLocaleString('ru-RU')} ₽` : '—'}</Td>
              <Td><span className={`text-[12px] font-bold ${r.win > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{r.win > 0 ? `+${(r.win - r.bet).toLocaleString('ru-RU')}` : `-${r.bet.toLocaleString('ru-RU')}`} ₽</span></Td>
              <Td><Badge status={r.status} /></Td>
            </TableRow>
          ))}
        </Table>
        {pageRows.length === 0 && <p className="text-white/30 text-[13px] text-center py-8">Нет записей за выбранный период</p>}
        <Pagination page={page} total={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}

// ===== Section 5: Finance history =====
function FinanceSection() {
  const { financeHistory } = useCabinetData();
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  let rows = financeHistory;
  if (type !== 'all') rows = rows.filter((r) => r.type === type);
  if (status !== 'all') rows = rows.filter((r) => r.status === status);
  const typeLabels: Record<string, string> = { deposit: 'Пополнение', withdraw: 'Вывод', bonus: 'Бонус', refund: 'Возврат', adjustment: 'Корректировка' };
  const perPage = 5;
  const totalPages = Math.ceil(rows.length / perPage);
  const pageRows = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <SectionTitle icon={Receipt}>Финансовая история</SectionTitle>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="sm:w-44">
          <option value="all">Все типы</option>
          <option value="deposit">Пополнение</option>
          <option value="withdraw">Вывод</option>
          <option value="bonus">Бонус</option>
          <option value="refund">Возврат</option>
          <option value="adjustment">Корректировка</option>
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="sm:w-44">
          <option value="all">Все статусы</option>
          <option value="completed">Выполнен</option>
          <option value="pending">В обработке</option>
          <option value="rejected">Отклонён</option>
        </Select>
      </div>
      <Card className="p-4">
        <Table headers={['Дата', 'Тип', 'Сумма', 'Метод', 'Статус', 'ID транзакции']}>
          {pageRows.map((r) => (
            <TableRow key={r.id}>
              <Td className="text-white/50 whitespace-nowrap">{r.date}</Td>
              <Td className="text-white font-semibold">{typeLabels[r.type]}</Td>
              <Td className={`tabular-nums font-bold ${r.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{r.amount > 0 ? '+' : ''}{r.amount.toLocaleString('ru-RU')} {r.currency}</Td>
              <Td className="text-white/40">{r.method}</Td>
              <Td><Badge status={r.status} /></Td>
              <Td className="text-white/30 text-[11px] font-mono">{r.txId}</Td>
            </TableRow>
          ))}
        </Table>
        {pageRows.length === 0 && <p className="text-white/30 text-[13px] text-center py-8">Нет операций по выбранным фильтрам</p>}
        <Pagination page={page} total={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}

// ===== Section 6: Profile =====
function ProfileSection({ toast }: { toast: (t: string) => void }) {
  const wallet = useWallet();
  const { userProfile } = useCabinetData();
  return (
    <div>
      <SectionTitle icon={UserCircle}>Профиль</SectionTitle>
      <Card className="p-5 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Имя" defaultValue={userProfile.firstName} />
          <Input label="Фамилия" defaultValue={userProfile.lastName} />
          <Input label="Дата рождения" defaultValue={userProfile.birthDate} type="date" />
          <Input label="Email" defaultValue={userProfile.email} type="email" />
          <Input label="Телефон" defaultValue={userProfile.phone} type="tel" />
          <Input label="Страна" defaultValue={userProfile.country} />
          <Input label="Город" defaultValue={userProfile.city} />
          <Select label="Валюта аккаунта" defaultValue={userProfile.currency}>
            <option value="RUB">RUB — ₽</option>
            <option value="USD">USD — $</option>
            <option value="EUR">EUR — €</option>
          </Select>
          <Select label="Язык интерфейса" defaultValue={userProfile.language}>
            <option value="Русский">Русский</option>
            <option value="English">English</option>
          </Select>
        </div>
        <div className="mt-6"><Button onClick={() => wallet.requireWallet(() => toast('Профиль сохранён'))}>СОХРАНИТЬ ИЗМЕНЕНИЯ</Button></div>
      </Card>
    </div>
  );
}

// ===== Section 7: Verification =====
function VerificationSection({ toast }: { toast: (t: string) => void }) {
  const wallet = useWallet();
  const { verificationDocs } = useCabinetData();
  return (
    <div>
      <SectionTitle icon={ShieldCheck}>Верификация</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {verificationDocs.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center">
                  <Upload size={17} className="text-white/50" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-[14px]">{d.name}</h4>
                  {d.uploadedAt && <span className="text-white/30 text-[11px]">Загружен: {d.uploadedAt}</span>}
                </div>
              </div>
              <Badge status={d.status} />
            </div>
            {d.comment && <p className="text-white/40 text-[12px] mt-2 leading-relaxed">{d.comment}</p>}
            <div className="mt-4">
              {d.status === 'approved' ? (
                <Button variant="ghost" className="w-full" onClick={() => wallet.requireWallet(() => toast('Документ заменён'))}>ЗАМЕНИТЬ</Button>
              ) : d.status === 'pending' ? (
                <Button variant="ghost" className="w-full" disabled>НА ПРОВЕРКЕ</Button>
              ) : (
                <Button className="w-full" onClick={() => wallet.requireWallet(() => toast(`Документ «${d.name}» загружен`))}><span className="flex items-center justify-center gap-2"><Upload size={15} strokeWidth={2.5} /> ЗАГРУЗИТЬ</span></Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== Section 8: Security =====
function SecuritySection({ toast }: { toast: (t: string) => void }) {
  const { sessions } = useCabinetData();
  const [twoFA, setTwoFA] = useState(false);
  const wallet = useWallet();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionTitle icon={Lock}>Безопасность</SectionTitle>

        {/* Change password */}
        <Card className="p-5 mb-4">
          <h4 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">СМЕНА ПАРОЛЯ</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Текущий пароль" type="password" placeholder="••••••••" />
            <Input label="Новый пароль" type="password" placeholder="••••••••" />
            <Input label="Повторите пароль" type="password" placeholder="••••••••" />
          </div>
          <div className="mt-4"><Button onClick={() => wallet.requireWallet(() => toast('Пароль изменён'))}>ИЗМЕНИТЬ ПАРОЛЬ</Button></div>
        </Card>

        {/* 2FA */}
        <Card className="p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-black text-[13px] tracking-[0.15em]">ДВУХФАКТОРНАЯ АУТЕНТИФИКАЦИЯ</h4>
              <p className="text-white/40 text-[12px] mt-1">{twoFA ? 'Включена' : 'Отключена'}</p>
            </div>
            <Button variant={twoFA ? 'danger' : 'primary'} onClick={() => wallet.requireWallet(() => { setTwoFA(!twoFA); toast(twoFA ? '2FA отключена' : '2FA включена') })}>{twoFA ? 'ОТКЛЮЧИТЬ' : 'ПОДКЛЮЧИТЬ'}</Button>
          </div>
          {twoFA && (
            <div className="flex flex-col sm:flex-row items-center gap-5 pt-4 border-t border-white/10">
              <div className="w-32 h-32 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
                <QrCode size={80} className="text-white/30" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-white/50 text-[12px] leading-relaxed mb-3">Отсканируйте QR-код в приложении Google Authenticator или Authy. Сохраните резервные коды ниже.</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {['8X2K9', 'M4P7Q', 'R1T6B', 'W3Y8N', 'L5D2J', 'F9H4C', 'V6G1S', 'Z7A3E'].map((c) => (
                    <span key={c} className="text-white/60 text-[11px] font-mono font-bold bg-white/5 border border-white/10 rounded px-2 py-1.5 text-center">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Active sessions */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-black text-[13px] tracking-[0.15em]">АКТИВНЫЕ УСТРОЙСТВА</h4>
            <Button variant="danger" onClick={() => wallet.requireWallet(() => toast('Все сессии завершены'))}>ЗАВЕРШИТЬ ВСЕ</Button>
          </div>
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-lg bg-white/[0.02] border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
                  <Smartphone size={17} className="text-white/50" strokeWidth={2} />
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                  <div><span className="text-white/30 block text-[10px] uppercase tracking-wider">IP</span><span className="text-white/70 font-mono">{s.ip}</span></div>
                  <div><span className="text-white/30 block text-[10px] uppercase tracking-wider">Браузер</span><span className="text-white/70">{s.browser}</span></div>
                  <div><span className="text-white/30 block text-[10px] uppercase tracking-wider">ОС / Страна</span><span className="text-white/70">{s.os} · {s.country}</span></div>
                  <div><span className="text-white/30 block text-[10px] uppercase tracking-wider">Активность</span><span className="text-white/70">{s.lastActive}</span></div>
                </div>
                {s.current ? (
                  <span className="text-emerald-400 text-[10px] font-bold tracking-wider uppercase shrink-0">Текущая</span>
                ) : (
                  <button onClick={() => wallet.requireWallet(() => toast('Сессия завершена'))} className="text-white/30 hover:text-red-400 transition-colors shrink-0"><LogOut size={16} strokeWidth={2} /></button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ===== Section 9: Responsible gaming =====
function ResponsibleGamingSection({ toast }: { toast: (t: string) => void }) {
  const { responsibleLimits } = useCabinetData();
  const [limits, setLimits] = useState(responsibleLimits);
  const wallet = useWallet();
  const update = (key: keyof typeof limits, field: string, val: number | boolean) =>
    setLimits((p) => ({ ...p, [key]: { ...p[key], [field]: val } }));
  const items: { key: keyof typeof limits; label: string; desc: string }[] = [
    { key: 'depositLimit', label: 'Лимит депозита', desc: 'Максимальная сумма пополнения за период' },
    { key: 'lossLimit', label: 'Лимит проигрыша', desc: 'Максимальная сумма проигрыша за период' },
    { key: 'betLimit', label: 'Лимит ставок', desc: 'Максимальная сумма ставки за период' },
    { key: 'timeLimit', label: 'Лимит времени игры', desc: 'Максимальное время в игре за день' },
  ];
  return (
    <div>
      <SectionTitle icon={HeartHandshake}>Ответственная игра</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {items.map((it) => (
          <Card key={it.key} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-white font-bold text-[14px]">{it.label}</h4>
                <p className="text-white/30 text-[11px] mt-0.5">{it.desc}</p>
              </div>
              <button
                onClick={() => wallet.requireWallet(() => { update(it.key, 'active', !limits[it.key].active); toast(limits[it.key].active ? `${it.label} отключён` : `${it.label} включён`) })}
                className={`relative w-11 h-6 rounded-full transition-colors ${limits[it.key].active ? 'bg-emerald-500/30' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${limits[it.key].active ? 'left-[22px] bg-emerald-400' : 'left-0.5 bg-white/40'}`} />
              </button>
            </div>
            {limits[it.key].active && (
              <div className="flex items-center gap-3 mt-3">
                <Input type="number" defaultValue={limits[it.key].value} className="flex-1" />
                <span className="text-white/40 text-[12px] font-bold whitespace-nowrap">/ {limits[it.key].period}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
      <Card className="p-5 border-amber-500/20">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <h4 className="text-white font-black text-[13px] tracking-[0.15em]">ПЕРЕРЫВ И САМОИСКЛЮЧЕНИЕ</h4>
            <p className="text-white/40 text-[12px] mt-1 leading-relaxed">Возьмите перерыв на время или исключите себя из игры навсегда. Эти действия необратимы до истечения срока.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" onClick={() => wallet.requireWallet(() => toast('Перерыв установлен на 24 часа'))}>ВЗЯТЬ ПЕРЕРЫВ</Button>
          <Button variant="danger" onClick={() => wallet.requireWallet(() => toast('Запрошено самоисключение'))}>САМОИСКЛЮЧЕНИЕ</Button>
        </div>
      </Card>
    </div>
  );
}

// ===== Section 10: VIP program =====
function VipSection() {
  const { vipProgram } = useCabinetData();
  const pct = ((vipProgram.points - vipProgram.prevLevelPoints) / (vipProgram.nextLevelPoints - vipProgram.prevLevelPoints)) * 100;
  return (
    <div>
      <SectionTitle icon={Crown}>VIP-программа</SectionTitle>
      <Card className="p-5 md:p-6 mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center">
            <Crown size={26} className="text-amber-400" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-white font-black text-[22px] tracking-tight">Уровень {vipProgram.currentLevel} — {vipProgram.levelName}</h3>
            <span className="text-white/40 text-[12px]">{vipProgram.points.toLocaleString('ru-RU')} VIP-очков</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-white/40 text-[11px] font-bold">Lvl {vipProgram.currentLevel}</span>
          <div className="flex-1"><ProgressBar value={pct} accent="bg-amber-400" /></div>
          <span className="text-white/40 text-[11px] font-bold">Lvl {vipProgram.currentLevel + 1}</span>
        </div>
        <p className="text-white/30 text-[11px]">До следующего уровня: {(vipProgram.nextLevelPoints - vipProgram.points).toLocaleString('ru-RU')} очков</p>
      </Card>

      <Card className="p-5 mb-4">
        <h4 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">ПЕРСОНАЛЬНЫЕ БОНУСЫ</h4>
        <div className="flex flex-col gap-2.5">
          {vipProgram.perks.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <Check size={16} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
              <span className="text-white/60 text-[13px]">{p}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h4 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">ИСТОРИЯ УРОВНЕЙ</h4>
        <div className="flex flex-col gap-3">
          {vipProgram.history.map((h) => (
            <div key={h.level} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
                <span className="text-white/60 text-[11px] font-black">{h.level}</span>
              </div>
              <span className="text-white font-bold text-[13px] flex-1">{h.name}</span>
              <span className="text-white/30 text-[11px]">{h.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ===== Section 11: Tournaments =====
function TournamentsSection() {
  const { tournaments } = useCabinetData();
  return (
    <div>
      <SectionTitle icon={Trophy}>Турниры</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {tournaments.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Trophy size={20} className="text-amber-400" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-white font-black text-[15px]">{t.name}</h4>
                  <span className="text-white/30 text-[11px]">Завершается: {t.endsAt}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/10">
              <div><span className="text-white/30 text-[10px] uppercase tracking-wider block">Призовой фонд</span><span className="text-amber-400 font-black text-[14px]">{t.prizePool}</span></div>
              <div><span className="text-white/30 text-[10px] uppercase tracking-wider block">Ваше место</span><span className="text-white font-black text-[14px]">#{t.userPlace}</span></div>
              <div><span className="text-white/30 text-[10px] uppercase tracking-wider block">Очки</span><span className="text-white font-black text-[14px] tabular-nums">{t.userPoints.toLocaleString('ru-RU')}</span></div>
            </div>
            <Button variant="ghost" className="w-full mt-4">ПОДРОБНЕЕ</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== Section 12: Referral =====
function ReferralSection({ toast }: { toast: (t: string) => void }) {
  const { referral } = useCabinetData();
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);
  const wallet = useWallet();
  const copy = (text: string, what: 'link' | 'code') => {
    if (!wallet.requireWallet()) return;
    navigator.clipboard?.writeText(text);
    setCopied(what);
    toast('Скопировано в буфер обмена');
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <div>
      <SectionTitle icon={Share2}>Реферальная программа</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <BalanceCard label="Приглашено пользователей" value={`${referral.invitedCount}`} accent="text-sky-400" />
        <BalanceCard label="Общий заработок" value={`${referral.totalEarnings.toLocaleString('ru-RU')} ₽`} accent="text-emerald-400" />
      </div>
      <Card className="p-5 mb-4">
        <h4 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">ВАША ССЫЛКА</h4>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1 flex items-center bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5">
            <span className="text-white/60 text-[13px] font-mono truncate flex-1">{referral.link}</span>
            <button onClick={() => copy(referral.link, 'link')} className="text-white/30 hover:text-white transition-colors ml-2 shrink-0">
              {copied === 'link' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        <div className="flex items-center bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5">
          <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider mr-3">Код</span>
          <span className="text-white/60 text-[13px] font-mono flex-1">{referral.code}</span>
          <button onClick={() => copy(referral.code, 'code')} className="text-white/30 hover:text-white transition-colors ml-2 shrink-0">
            {copied === 'code' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>
      </Card>
      <Card className="p-4">
        <h4 className="text-white font-black text-[13px] tracking-[0.15em] mb-4 px-1">ИСТОРИЯ НАЧИСЛЕНИЙ</h4>
        <Table headers={['Пользователь', 'Дата', 'Начислено']}>
          {referral.history.map((r) => (
            <TableRow key={r.id}>
              <Td className="text-white font-semibold">{r.user}</Td>
              <Td className="text-white/40">{r.date}</Td>
              <Td className="text-emerald-400 font-bold tabular-nums">+{r.amount.toLocaleString('ru-RU')} ₽</Td>
            </TableRow>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ===== Section 13: Notifications =====
function NotificationsSection({ toast }: { toast: (t: string) => void }) {
  const { notifications } = useCabinetData();
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState(notifications);
  const wallet = useWallet();
  const filtered = tab === 'all' ? items : items.filter((n) => n.category === tab);
  const catLabels: Record<string, string> = { system: 'Система', finance: 'Финансы', bonus: 'Бонус', tournament: 'Турнир' };
  const catColors: Record<string, string> = { system: 'text-sky-400', finance: 'text-emerald-400', bonus: 'text-amber-400', tournament: 'text-red-400' };
  return (
    <div>
      <SectionTitle icon={Bell}>Уведомления</SectionTitle>
      <div className="mb-5"><FilterTabs tabs={['all', 'system', 'finance', 'bonus', 'tournament']} active={tab} onChange={setTab} /></div>
      <div className="flex flex-col gap-2.5">
        {filtered.map((n) => (
          <Card key={n.id} className={`p-4 ${!n.read ? 'border-white/25' : ''}`}>
            <div className="flex items-start gap-3">
              {!n.read && <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-2" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${catColors[n.category]}`}>{catLabels[n.category]}</span>
                  <span className="text-white/20 text-[11px]">·</span>
                  <span className="text-white/30 text-[11px]">{n.date}</span>
                </div>
                <h4 className="text-white font-bold text-[13px]">{n.title}</h4>
                <p className="text-white/50 text-[12px] mt-1 leading-snug">{n.text}</p>
              </div>
              {!n.read && (
                <button onClick={() => wallet.requireWallet(() => { setItems((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x)); toast('Отмечено прочитанным') })} className="text-white/20 hover:text-white transition-colors shrink-0">
                  <X size={15} />
                </button>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-white/30 text-[13px] text-center py-10">Нет уведомлений</p>}
      </div>
    </div>
  );
}

// ===== Section 14: Support =====
function SupportSection({ toast }: { toast: (t: string) => void }) {
  const { tickets, faqItems } = useCabinetData();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showChat, setShowChat] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const wallet = useWallet();
  return (
    <div>
      <SectionTitle icon={Headphones}>Поддержка</SectionTitle>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Card className="p-5">
          <h4 className="text-white font-black text-[13px] tracking-[0.15em] mb-2">ОНЛАЙН-ЧАТ</h4>
          <p className="text-white/40 text-[12px] mb-4">Ответим за пару минут. Работаем 24/7.</p>
          <Button className="w-full" onClick={() => wallet.requireWallet(() => { setShowChat(true); toast('Чат открыт') })}><span className="flex items-center justify-center gap-2"><Send size={15} strokeWidth={2.5} /> НАЧАТЬ ЧАТ</span></Button>
        </Card>
        <Card className="p-5">
          <h4 className="text-white font-black text-[13px] tracking-[0.15em] mb-2">СОЗДАТЬ ОБРАЩЕНИЕ</h4>
          <p className="text-white/40 text-[12px] mb-4">Опишите вопрос — ответим на email.</p>
          <Input placeholder="Тема обращения" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="mb-3" />
          <Button className="w-full" onClick={() => wallet.requireWallet(() => { if (ticketSubject.trim()) { toast('Обращение создано'); setTicketSubject('') } })}><span className="flex items-center justify-center gap-2"><Plus size={15} strokeWidth={2.5} /> ОТПРАВИТЬ</span></Button>
        </Card>
      </div>

      {/* Tickets */}
      <Card className="p-4 mb-4">
        <h4 className="text-white font-black text-[13px] tracking-[0.15em] mb-4 px-1">ИСТОРИЯ ОБРАЩЕНИЙ</h4>
        <Table headers={['Тема', 'Статус', 'Создано', 'Последний ответ']}>
          {tickets.map((t) => (
            <TableRow key={t.id}>
              <Td className="text-white font-semibold">{t.subject}</Td>
              <Td><Badge status={t.status} /></Td>
              <Td className="text-white/40">{t.createdAt}</Td>
              <Td className="text-white/40">{t.lastReply}</Td>
            </TableRow>
          ))}
        </Table>
      </Card>

      {/* FAQ */}
      <Card className="p-5">
        <h4 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">FAQ</h4>
        <div className="flex flex-col gap-2">
          {faqItems.map((f, i) => (
            <div key={i} className="border-b border-white/10 last:border-0">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-white/70 text-[13px] font-semibold">{f.q}</span>
                <ChevronLeft size={16} className={`text-white/30 transition-transform shrink-0 ${openFaq === i ? '-rotate-90' : ''}`} />
              </button>
              {openFaq === i && <p className="text-white/40 text-[12px] pb-3 leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ===== Navigation config =====
const navConfig = [
  { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
  { id: 'balance', label: 'Баланс', icon: Wallet },
  { id: 'bonuses', label: 'Бонусы', icon: Gift },
  { id: 'games', label: 'История игр', icon: Gamepad2 },
  { id: 'finance', label: 'Финансы', icon: Receipt },
  { id: 'profile', label: 'Профиль', icon: UserCircle },
  { id: 'verification', label: 'Верификация', icon: ShieldCheck },
  { id: 'security', label: 'Безопасность', icon: Lock },
  { id: 'responsible', label: 'Ответственная игра', icon: HeartHandshake },
  { id: 'vip', label: 'VIP-программа', icon: Crown },
  { id: 'tournaments', label: 'Турниры', icon: Trophy },
  { id: 'referral', label: 'Рефералы', icon: Share2 },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
  { id: 'support', label: 'Поддержка', icon: Headphones },
] as const;

// ===== Main Cabinet =====
export default function Cabinet() {
  const [section, setSection] = useState('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mobileNav, setMobileNav] = useState(false);
  const [data, setData] = useState<CabinetData | null>(null);

  const wallet = useWallet();

  useEffect(() => {
    if (!wallet.isAuthed) return;
    fetchCabinetData().then(setData).catch(() => {});
  }, [wallet.isAuthed]);

  if (!wallet.isAuthed) {
    return (
      <div className="flex justify-center w-full flex-1 px-1 pt-3 pb-6">
        <div className="w-full max-w-[1408px] flex gap-3">
          <aside className="hidden lg:block w-[240px] shrink-0">
            <div className="bg-black border border-white/20 rounded-xl p-3 lg:sticky lg:top-3">
              <nav className="flex flex-col gap-1 max-h-[calc(100vh-120px)] overflow-y-auto">
                {navConfig.map((n) => (
                  <button key={n.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-bold tracking-wider text-white/30 text-left">
                    <n.icon size={16} strokeWidth={2} className="shrink-0" />
                    <span className="uppercase tracking-widest">{n.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="bg-black border border-white/15 rounded-xl p-5 md:p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-white font-black text-lg tracking-wide">Подключите кошелёк</h2>
                <p className="text-white/50 text-sm mt-2 leading-relaxed">
                  Для доступа к личному кабинету необходимо подключить криптокошелёк и авторизоваться.
                </p>
              </div>
              <button
                onClick={openWalletModal}
                className="bg-white text-black font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 px-8 hover:bg-white/90 transition-colors"
              >
                ПОДКЛЮЧИТЬ КОШЕЛЁК
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center w-full flex-1 px-1 pt-3 pb-6">
        <div className="w-full max-w-[1408px] flex gap-3">
          <aside className="hidden lg:block w-[240px] shrink-0">
            <div className="bg-black border border-white/20 rounded-xl p-3 lg:sticky lg:top-3">
              <nav className="flex flex-col gap-1 max-h-[calc(100vh-120px)] overflow-y-auto">
                {navConfig.map((n) => (
                  <button key={n.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-bold tracking-wider text-white/30 text-left">
                    <n.icon size={16} strokeWidth={2} className="shrink-0" />
                    <span className="uppercase tracking-widest">{n.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="bg-black border border-white/15 rounded-xl p-5 md:p-6 flex items-center justify-center min-h-[400px]">
              <span className="text-white/40 text-[13px] font-bold tracking-wider animate-pulse">ЗАГРУЗКА...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { userProfile, balances, bonuses, gameHistory, financeHistory, verificationDocs, sessions, responsibleLimits, vipProgram, tournaments, referral, notifications, tickets, faqItems } = data;

  const toast = (text: string) => {
    const id = ++toastId;
    setToasts((p) => [...p, { id, text }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };

  const go = (s: string) => {
    setSection(s);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSection = (): ReactNode => {
    switch (section) {
      case 'dashboard': return <Dashboard go={go} />;
      case 'balance': return <BalanceSection toast={toast} />;
      case 'bonuses': return <BonusesSection />;
      case 'games': return <GameHistorySection />;
      case 'finance': return <FinanceSection />;
      case 'profile': return <ProfileSection toast={toast} />;
      case 'verification': return <VerificationSection toast={toast} />;
      case 'security': return <SecuritySection toast={toast} />;
      case 'responsible': return <ResponsibleGamingSection toast={toast} />;
      case 'vip': return <VipSection />;
      case 'tournaments': return <TournamentsSection />;
      case 'referral': return <ReferralSection toast={toast} />;
      case 'notifications': return <NotificationsSection toast={toast} />;
      case 'support': return <SupportSection toast={toast} />;
      default: return <Dashboard go={go} />;
    }
  };

  return (
    <CabinetDataContext.Provider value={data}>
    <div className="flex justify-center w-full flex-1 px-1 pt-3 pb-6">
      <div className="w-full max-w-[1408px] flex gap-3">
          {/* Sidebar nav */}
          <aside className={`${mobileNav ? 'block' : 'hidden'} lg:block w-full lg:w-[240px] shrink-0`}>
            <div className="bg-black border border-white/20 rounded-xl p-3 lg:sticky lg:top-3">
              <nav className="flex flex-col gap-1 max-h-[calc(100vh-120px)] overflow-y-auto">
                {navConfig.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => go(n.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-bold tracking-wider transition-colors text-left ${
                      section === n.id ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <n.icon size={16} strokeWidth={2} className="shrink-0" />
                    <span className="uppercase tracking-widest">{n.label}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-3 pt-3 border-t border-white/10">
                <LanguageSwitcher />
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-black border border-white/15 rounded-xl p-5 md:p-6">
              {renderSection()}
            </div>
          </main>
        </div>

      <ToastContainer toasts={toasts} />
    </div>
    </CabinetDataContext.Provider>
  );
}
