import { useState, useEffect } from 'react';
import { Users, Smile, ArrowUp, MessageCircle, X } from 'lucide-react';
import { fetchItems, insertItem } from '@/lib/directus';
import { useWallet } from '@/lib/wallet';

type Msg = {
  id: string;
  user: string;
  vip: number;
  time: string;
  text: string;
  img: string;
};

const avatarImages = [
  'https://images.pexels.com/photos/29261090/pexels-photo-29261090.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/34977996/pexels-photo-34977996.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/7594228/pexels-photo-7594228.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
  'https://images.pexels.com/photos/269630/pexels-photo-269630.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop',
];

const defaultAvatar = 'https://images.pexels.com/photos/29261090/pexels-photo-29261090.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop&fp-x=0.5';

export default function RightSidebar() {
  const wallet = useWallet();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchItems<Record<string, unknown>>('chat_messages', { 'sort': 'created_at' }).then((data) => {
      if (!data) return;
      setMessages(data.map((r, i) => ({
        id: r.id as string,
        user: r.username as string,
        vip: r.vip as number,
        time: r.time as string,
        text: r.text as string,
        img: avatarImages[i % avatarImages.length],
      })));
    }).catch(() => {});
  }, []);

  const send = () => {
    if (!text.trim()) return;
    if (!wallet.requireWallet()) return;
    const username = wallet.displayAddress ?? wallet.address ?? 'GUEST';
    const newMsg: Msg = {
      id: `local${Date.now()}`,
      user: username,
      vip: 7,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      text: text.trim(),
      img: defaultAvatar,
    };
    setMessages((prev) => [...prev, newMsg]);
    insertItem('chat_messages', {
      id: `local${Date.now()}`,
      username,
      vip: 7,
      time: newMsg.time,
      text: text.trim(),
      hue: 200,
    }).catch((e) => console.error(e));
    setText('');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-black/50 hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Открыть чат"
      >
        <MessageCircle size={24} strokeWidth={2} />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black" />
      </button>
    );
  }

  return (
    <aside className="fixed bottom-5 right-5 z-[60] w-[calc(100vw-2.5rem)] h-[60vh] md:w-[400px] md:h-[600px] md:max-h-[85vh] flex flex-col bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/15 shrink-0">
        <h3 className="text-white font-black text-[13px] tracking-[0.2em]">ЧАТ</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/40">
            <Users size={14} strokeWidth={2.2} />
            <span className="text-[12px] font-bold tabular-nums">384</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3.5">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2.5">
            <img
              src={msg.img}
              alt={msg.user}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white text-[12px] font-bold truncate">{msg.user}</span>
                <span className="text-[9px] text-white/40 font-bold tracking-wider border border-white/15 rounded-[3px] px-1.5 py-[3px] leading-none shrink-0">
                  VIP {msg.vip}
                </span>
                <span className="text-white/25 text-[10px] ml-auto shrink-0 tabular-nums">{msg.time}</span>
              </div>
              <p className="text-white/70 text-[12px] leading-snug mt-1 break-words">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/15 shrink-0">
        <div className="flex items-center bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 focus-within:border-white/40 transition-colors">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Напишите сообщение…"
            className="flex-1 bg-transparent text-white text-[13px] placeholder:text-white/25 outline-none min-w-0"
          />
          <button className="text-white/30 hover:text-white transition-colors mr-2">
            <Smile size={18} strokeWidth={2} />
          </button>
          <button
            onClick={send}
            className="w-7 h-7 rounded-md bg-white flex items-center justify-center hover:bg-white/90 transition-colors shrink-0"
          >
            <ArrowUp size={16} className="text-black" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
