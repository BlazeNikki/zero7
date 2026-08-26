import { useState, useMemo, useRef, useEffect } from 'react';
import {
  LifeBuoy, ChevronLeft, Search, MessageCircle, Mail, Send, MessageSquare,
  Paperclip, X, ChevronDown, Check, Clock, Headphones, FileText, ExternalLink,
  AlertCircle, CheckCircle2, Plus, ArrowLeft,
} from 'lucide-react';
import {
  myTickets as initialTickets, faqItems, faqCategories, ticketCategories,
  ticketStatusLabels, ticketStatusStyles, ticketCategoryLabels,
  usefulLinks,
  type Ticket, type TicketStatus, type TicketCategory, type TicketMessage,
} from './data';
import { useWallet } from '@/lib/wallet';

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase border rounded px-2 py-1 leading-none ${ticketStatusStyles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {ticketStatusLabels[status]}
    </span>
  );
}

/* ── Online chat ── */
type ChatMessage = { id: string; author: 'user' | 'operator'; text: string; time: string };

const seedChat: ChatMessage[] = [
  { id: 'c1', author: 'operator', text: 'Здравствуйте! Меня зовут Анна, я оператор поддержки ZERO7. Чем могу помочь?', time: '14:30' },
  { id: 'c2', author: 'user', text: 'Здравствуйте! Не могу вывести средства, пишет «Верификация требуется»', time: '14:31' },
  { id: 'c3', author: 'operator', text: 'Для вывода средств нужна верификация аккаунта. Пожалуйста, загрузите фото документа в разделе «Верификация» личного кабинета.', time: '14:32' },
];

function OnlineChat({ onClose, open }: { onClose: () => void; open: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedChat);
  const [input, setInput] = useState('');
  const [operatorTyping, setOperatorTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wallet = useWallet();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, operatorTyping]);

  const send = () => {
    if (!input.trim()) return;
    if (!wallet.requireWallet()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const msg: ChatMessage = { id: `u${Date.now()}`, author: 'user', text: input.trim(), time };
    setMessages((m) => [...m, msg]);
    setInput('');
    setOperatorTyping(true);
    setTimeout(() => {
      setOperatorTyping(false);
      setMessages((m) => [...m, {
        id: `o${Date.now()}`,
        author: 'operator',
        text: 'Спасибо за обращение! Ваш вопрос передан специалисту. Ожидайте, мы разбираемся.',
        time,
      }]);
    }, 2200);
  };

  return (
    <div
      className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full h-full md:w-[400px] md:h-[600px] md:max-h-[85vh] bg-black border border-white/20 md:rounded-2xl flex flex-col origin-bottom-right transition-all duration-300 ease-out ${
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
      }`}
    >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/15 shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Headphones size={18} className="text-emerald-400" strokeWidth={2} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black text-[14px] tracking-tight">Онлайн-чат</h3>
            <p className="text-emerald-400 text-[11px] font-semibold">Оператор онлайн</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.author === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.author === 'user' ? 'bg-white text-black' : 'bg-white/10 text-white border border-white/15'}`}>
                <p className="text-[13px] leading-relaxed">{m.text}</p>
                <span className={`text-[10px] mt-1 block ${m.author === 'user' ? 'text-black/40' : 'text-white/30'}`}>{m.time}</span>
              </div>
            </div>
          ))}
          {operatorTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/15 shrink-0">
          <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl px-3 py-2">
            <button className="text-white/30 hover:text-white transition-colors shrink-0">
              <Paperclip size={18} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Введите сообщение..."
              className="bg-transparent text-white text-[13px] placeholder:text-white/25 outline-none flex-1"
            />
            <button onClick={send} disabled={!input.trim()} className="text-white/30 hover:text-white transition-colors disabled:opacity-30 shrink-0">
              <Send size={18} />
            </button>
          </div>
        </div>
    </div>
  );
}

/* ── Create ticket form ── */
function CreateTicketForm({ onClose, onCreated }: { onClose: () => void; onCreated: (ticket: Ticket) => void }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('deposit');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const wallet = useWallet();

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) return;
    if (!wallet.requireWallet()) return;
    const num = `#${Math.floor(4850 + Math.random() * 500)}`;
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const ticket: Ticket = {
      id: `t${Date.now()}`,
      number: num,
      subject: subject.trim(),
      category,
      createdAt: dateStr,
      lastReply: dateStr,
      status: 'new',
      messages: [{ id: 'm1', author: 'user', text: description.trim(), timestamp: dateStr }],
    };
    setSubmitted(num);
    setTimeout(() => onCreated(ticket), 1800);
  };

  if (submitted) {
    return (
      <div className="bg-black border border-white/15 rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-400" strokeWidth={2} />
        </div>
        <h3 className="text-white font-black text-[18px] tracking-tight">Обращение создано</h3>
        <p className="text-white/40 text-[13px] mt-2">Номер вашего обращения:</p>
        <p className="text-amber-400 font-black text-[24px] tracking-tight mt-1">{submitted}</p>
        <p className="text-white/30 text-[12px] mt-3">Мы свяжемся с вами в ближайшее время</p>
      </div>
    );
  }

  return (
    <div className="bg-black border border-white/15 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-black text-[14px] tracking-[0.15em]">СОЗДАТЬ ОБРАЩЕНИЕ</h3>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Тема обращения</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Кратко опишите проблему"
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-[13px] placeholder:text-white/25 outline-none focus:border-white/40 transition-colors"
          />
        </label>
        <label className="block">
          <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Категория</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-white/40 transition-colors appearance-none cursor-pointer"
          >
            {ticketCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Описание проблемы</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите проблему подробно..."
            rows={5}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-[13px] placeholder:text-white/25 outline-none focus:border-white/40 transition-colors resize-none"
          />
        </label>
        <div>
          <span className="block text-white/40 text-[10px] font-bold tracking-wider mb-2 uppercase">Прикрепить файлы</span>
          <button
            onClick={() => setFiles((f) => [...f, `file_${f.length + 1}.png`])}
            className="flex items-center gap-2 border border-dashed border-white/20 rounded-lg px-4 py-3 text-white/40 hover:text-white hover:border-white/40 transition-colors w-full text-[12px] font-semibold"
          >
            <Paperclip size={15} /> Нажмите, чтобы прикрепить файл
          </button>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {files.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/15 rounded-md px-2.5 py-1.5 text-[11px] text-white/60">
                  <FileText size={12} /> {f}
                  <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-white/30 hover:text-white ml-1">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!subject.trim() || !description.trim()}
          className="bg-white text-black font-black text-[12px] tracking-[0.2em] rounded-md py-3 hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ОТПРАВИТЬ
        </button>
      </div>
    </div>
  );
}

/* ── Ticket list ── */
function TicketList({ tickets, onOpen, onCreate }: { tickets: Ticket[]; onOpen: (t: Ticket) => void; onCreate: () => void }) {
  if (tickets.length === 0) {
    return (
      <div className="bg-black border border-white/15 rounded-xl p-12 text-center">
        <LifeBuoy size={40} className="text-white/15 mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-white/40 text-[14px] font-semibold">У вас пока нет обращений в службу поддержки.</p>
        <button onClick={onCreate} className="mt-5 bg-white text-black font-black text-[12px] tracking-[0.2em] rounded-md px-6 py-3 hover:bg-white/90 transition-colors inline-flex items-center gap-2">
          <Plus size={15} strokeWidth={2.5} /> СОЗДАТЬ ОБРАЩЕНИЕ
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-[14px] tracking-[0.15em]">МОИ ОБРАЩЕНИЯ</h3>
        <button onClick={onCreate} className="flex items-center gap-1.5 bg-white/5 border border-white/15 text-white/70 hover:text-white hover:border-white/30 rounded-md px-3 py-2 text-[11px] font-bold tracking-wider transition-colors">
          <Plus size={14} strokeWidth={2.5} /> НОВОЕ
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {tickets.map((t) => (
          <button
            key={t.id}
            onClick={() => onOpen(t)}
            className="bg-black border border-white/15 rounded-xl p-4 flex items-center gap-4 text-left hover:border-white/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400 font-black text-[13px] tracking-tight">{t.number}</span>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-white font-semibold text-[13px] truncate">{t.subject}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30">
                <span>{ticketCategoryLabels[t.category]}</span>
                <span>·</span>
                <span>Создано: {t.createdAt}</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Посл. ответ: {t.lastReply}</span>
              </div>
            </div>
            <ChevronDown size={18} className="text-white/20 -rotate-90 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Ticket detail ── */
function TicketDetail({ ticket, onBack, onReply }: { ticket: Ticket; onBack: () => void; onReply: (text: string) => void }) {
  const [reply, setReply] = useState('');
  const wallet = useWallet();

  const send = () => {
    if (!reply.trim()) return;
    if (!wallet.requireWallet()) return;
    onReply(reply.trim());
    setReply('');
  };

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors w-fit">
        <ChevronLeft size={20} strokeWidth={2.5} />
        <span className="text-[12px] font-bold tracking-widest">К ОБРАЩЕНИЯМ</span>
      </button>

      <div className="bg-black border border-white/15 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 font-black text-[16px] tracking-tight">{ticket.number}</span>
              <StatusBadge status={ticket.status} />
            </div>
            <h3 className="text-white font-bold text-[15px]">{ticket.subject}</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/30">
          <span>Категория: {ticketCategoryLabels[ticket.category]}</span>
          <span>·</span>
          <span>Создано: {ticket.createdAt}</span>
          <span>·</span>
          <span>Посл. ответ: {ticket.lastReply}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-black border border-white/15 rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-2">ПЕРЕПИСКА</h3>
        <div className="flex flex-col gap-3">
          {ticket.messages.map((m: TicketMessage) => (
            <div key={m.id} className={`flex ${m.author === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.author === 'user' ? 'bg-white text-black' : 'bg-white/10 text-white border border-white/15'}`}>
                <p className="text-[13px] leading-relaxed">{m.text}</p>
                <span className={`text-[10px] mt-1 block ${m.author === 'user' ? 'text-black/40' : 'text-white/30'}`}>{m.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Reply input */}
        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
          <div className="mt-3 flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl px-3 py-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ваш ответ..."
              className="bg-transparent text-white text-[13px] placeholder:text-white/25 outline-none flex-1"
            />
            <button onClick={send} disabled={!reply.trim()} className="text-white/30 hover:text-white transition-colors disabled:opacity-30 shrink-0">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── FAQ ── */
function FaqSection({ search }: { search: string }) {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = faqItems;
    if (activeCategory !== 'Все') items = items.filter((f) => f.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }
    return items;
  }, [activeCategory, search]);

  const cats = ['Все', ...faqCategories];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-white font-black text-[14px] tracking-[0.15em]">ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ</h3>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`text-[11px] font-bold tracking-wider uppercase rounded-md px-3 py-1.5 transition-colors border ${
              activeCategory === c ? 'bg-white text-black border-white' : 'text-white/40 border-white/15 hover:text-white hover:border-white/30'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Accordion */}
      {filtered.length > 0 ? (
        <div className="bg-black border border-white/15 rounded-xl divide-y divide-white/10">
          {filtered.map((f) => (
            <div key={f.id}>
              <button
                onClick={() => setOpenId(openId === f.id ? null : f.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-white/70 text-[13px] font-semibold pr-3">{f.question}</span>
                <ChevronDown size={16} className={`text-white/30 transition-transform shrink-0 ${openId === f.id ? 'rotate-180' : ''}`} />
              </button>
              {openId === f.id && (
                <p className="px-4 pb-4 text-white/40 text-[12px] leading-relaxed">{f.answer}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black border border-white/15 rounded-xl p-8 text-center">
          <Search size={32} className="text-white/15 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-white/40 text-[13px] font-semibold">По вашему запросу ничего не найдено.</p>
        </div>
      )}
    </div>
  );
}

/* ── Main page ── */
export default function Support() {
  const [search, setSearch] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [openTicket, setOpenTicket] = useState<Ticket | null>(null);

  const handleCreated = (ticket: Ticket) => {
    setTickets((t) => [ticket, ...t]);
    setShowCreateForm(false);
  };

  const handleReply = (text: string) => {
    if (!openTicket) return;
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updated: Ticket = {
      ...openTicket,
      lastReply: dateStr,
      status: 'waiting_user',
      messages: [...openTicket.messages, { id: `m${Date.now()}`, author: 'user', text, timestamp: dateStr }],
    };
    setOpenTicket(updated);
    setTickets((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div className="flex justify-center w-full flex-1 px-1 pt-3 pb-6">
      <div className="w-full max-w-[1100px] flex flex-col gap-5">
          {/* Hero block */}
          <div className="relative h-[180px] md:h-[220px] rounded-xl overflow-hidden border border-white/20 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-black to-black" />
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,210,63,0.3), transparent 60%)' }} />
            <div className="relative h-full flex flex-col justify-center px-5 md:px-10">
              <div className="flex items-center gap-2 mb-2">
                <LifeBuoy size={22} className="text-amber-400" strokeWidth={2} />
                <h1 className="text-white font-black text-[22px] md:text-[32px] tracking-tight">Служба поддержки</h1>
              </div>
              <p className="text-white/50 text-[13px] md:text-[15px] max-w-[500px] leading-relaxed">
                Мы готовы помочь вам с любым вопросом — от пополнения счёта до технических проблем.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-[12px] font-bold tracking-wider uppercase">Поддержка 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-[12px] font-semibold">
                  <Clock size={14} />
                  <span>Среднее время ответа: ~2 минуты</span>
                </div>
              </div>
            </div>
          </div>

          {/* My tickets / Create form / Ticket detail */}
          {showCreateForm ? (
            <CreateTicketForm onClose={() => setShowCreateForm(false)} onCreated={handleCreated} />
          ) : openTicket ? (
            <TicketDetail ticket={openTicket} onBack={() => setOpenTicket(null)} onReply={handleReply} />
          ) : (
            <TicketList tickets={tickets} onOpen={(t) => setOpenTicket(t)} onCreate={() => setShowCreateForm(true)} />
          )}

          {/* Search */}
          <div className="flex items-center bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5">
            <Search size={16} className="text-white/30 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по вопросам и статьям..."
              className="bg-transparent text-white text-[13px] placeholder:text-white/25 outline-none flex-1 ml-3"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-white/30 hover:text-white transition-colors">
                <X size={15} />
              </button>
            )}
          </div>

          {/* FAQ */}
          <FaqSection search={search} />

          {/* Contact info + useful links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black border border-white/15 rounded-xl p-5">
              <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">КОНТАКТНАЯ ИНФОРМАЦИЯ</h3>
              <div className="flex flex-col gap-3 text-[12px]">
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-white/30 shrink-0" />
                  <span className="text-white/30">Email:</span>
                  <span className="text-white/70 font-semibold">support@zero7.com</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-white/30 shrink-0" />
                  <span className="text-white/30">Время работы:</span>
                  <span className="text-white/70 font-semibold">Круглосуточно, 24/7</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Send size={14} className="text-white/30 shrink-0" />
                  <span className="text-white/30">Telegram:</span>
                  <span className="text-white/70 font-semibold">@zero7_support</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={14} className="text-white/30 shrink-0" />
                  <span className="text-white/30">WhatsApp:</span>
                  <span className="text-white/70 font-semibold">+7 900 000-00-00</span>
                </div>
              </div>
            </div>
            <div className="bg-black border border-white/15 rounded-xl p-5">
              <h3 className="text-white font-black text-[13px] tracking-[0.15em] mb-4">ПОЛЕЗНЫЕ ССЛЫЛКИ</h3>
              <div className="flex flex-col gap-2">
                {usefulLinks.map((l) => (
                  <a key={l.label} href={l.href} className="flex items-center justify-between text-white/50 hover:text-white text-[12px] font-semibold py-1.5 transition-colors group">
                    <span>{l.label}</span>
                    <ExternalLink size={13} className="text-white/20 group-hover:text-white/50 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Floating chat button */}
      <button
        onClick={() => setShowChat(true)}
        className={`fixed bottom-5 right-5 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-black/50 hover:scale-110 active:scale-95 transition-all duration-300 ${
          showChat ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        aria-label="Открыть чат"
      >
        <MessageCircle size={24} strokeWidth={2} />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black" />
      </button>

      {/* Online chat panel */}
      {showChat && <OnlineChat onClose={() => setShowChat(false)} open={showChat} />}
    </div>
  );
}
