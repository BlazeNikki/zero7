import { Shield, HelpCircle, Gift, Trophy, Users, Mail, MessageCircle, Send } from 'lucide-react';

const columns = [
  {
    title: 'КАЗИНО',
    links: ['Слоты', 'Live казино', 'Настольные игры', 'Новинки', 'Популярные'],
  },
  {
    title: 'АКЦИИ',
    links: ['Бонусы', 'Турниры', 'Кэшбэк', 'VIP программа', 'Рефералы'],
  },
  {
    title: 'ИНФОРМАЦИЯ',
    links: ['О нас', 'Правила', 'Бонусная политика', 'FAQ', 'Блог'],
  },
  {
    title: 'ПОДДЕРЖКА',
    links: ['Помощь 24/7', 'Способы оплаты', 'Верификация', 'Ответственная игра', 'Контакты'],
  },
];

const socials = [
  { icon: Send, label: 'Telegram' },
  { icon: MessageCircle, label: 'Live chat' },
  { icon: Mail, label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="shrink-0 mt-1">
      <div className="bg-black border border-white/15 rounded-2xl px-5 md:px-8 py-7 md:py-9">
        {/* Top: logo + description + socials */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-7 border-b border-white/10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-white font-black text-xl tracking-[0.18em]">ZERO7</span>
              <span className="text-[9px] text-white/40 font-bold tracking-[0.2em] border border-white/15 rounded-[3px] px-1.5 py-[3px] leading-none">
                EST. 2024
              </span>
            </div>
            <p className="text-white/40 text-[13px] leading-relaxed">
              Онлайн-казино с моментальными выплатами, 3000+ играми и круглосуточной поддержкой. Играйте ответственно.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
              >
                <s.icon size={18} strokeWidth={2} />
              </a>
            ))}
          </div>
        </div>

        {/* Middle: link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-7 border-b border-white/10">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-black text-[12px] tracking-[0.2em] mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/35 hover:text-white text-[13px] font-medium transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Features strip */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 py-6 border-b border-white/10">
          {[
            { icon: Shield, label: 'Лицензия Curaçao 8048/JAZ' },
            { icon: HelpCircle, label: 'Поддержка 24/7' },
            { icon: Gift, label: 'Бонусы каждый день' },
            { icon: Trophy, label: 'Еженедельные турниры' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2.5">
              <f.icon size={16} className="text-white/30 shrink-0" strokeWidth={2} />
              <span className="text-white/40 text-[12px] font-semibold tracking-wide">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-b border-white/10">
          <span className="text-white/30 text-[11px] font-bold tracking-[0.2em]">СПОСОБЫ ОПЛАТЫ</span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {['VISA', 'MC', 'MIR', 'SBP', 'BTC', 'ETH', 'USDT'].map((m) => (
              <span
                key={m}
                className="text-white/50 text-[11px] font-black tracking-wider border border-white/15 rounded-md px-3 py-1.5"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Responsible gaming */}
        <div className="flex items-center gap-3 py-5">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center shrink-0">
            <Users size={18} className="text-white/30" strokeWidth={2} />
          </div>
          <p className="text-white/30 text-[11px] leading-relaxed">
            Игра может вызывать зависимость. Только для лиц старше 18 лет. Если вы чувствуете, что игра
            становится проблемой, обратитесь за помощью на горячую линию ответственной игры.
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-white/10">
          <p className="text-white/25 text-[11px] font-medium tracking-wide">
            © 2024 ZERO7. Все права защищены.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-white/25 hover:text-white/50 text-[11px] font-medium transition-colors">Политика конфиденциальности</a>
            <a href="#" className="text-white/25 hover:text-white/50 text-[11px] font-medium transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
