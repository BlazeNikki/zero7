import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-black border border-white/15 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ icon: Icon, children }: { icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
        <Icon size={17} className="text-white/70" strokeWidth={2} />
      </div>
      <h2 className="text-white font-black text-[16px] tracking-[0.15em]">{children}</h2>
    </div>
  );
}

export function ProgressBar({ value, accent = 'bg-white' }: { value: number; accent?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${accent}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  used: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  expired: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  not_uploaded: 'bg-white/10 text-white/40 border-white/20',
  win: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  loss: 'bg-red-500/15 text-red-400 border-red-500/30',
  open: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  answered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  closed: 'bg-white/10 text-white/40 border-white/20',
};

const badgeLabels: Record<string, string> = {
  active: 'Активен', used: 'Использован', expired: 'Истёк', cancelled: 'Отменён',
  completed: 'Выполнен', pending: 'В обработке', rejected: 'Отклонён',
  approved: 'Подтверждён', not_uploaded: 'Не загружен',
  win: 'Выигрыш', loss: 'Проигрыш',
  open: 'Открыт', answered: 'Отвечен', closed: 'Закрыт',
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase border rounded px-2 py-1 leading-none ${badgeStyles[status] ?? badgeStyles.not_uploaded}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {badgeLabels[status] ?? status}
    </span>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }: { children: ReactNode; variant?: 'primary' | 'ghost' | 'danger' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-white text-black hover:bg-white/90 active:bg-white/80',
    ghost: 'border border-white/25 text-white hover:bg-white/10',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25',
  };
  return (
    <button className={`font-bold text-[12px] tracking-[0.15em] rounded-md py-2.5 px-4 transition-colors ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <span className="block text-white/40 text-[11px] font-bold tracking-wider mb-2 uppercase">{label}</span>}
      <input
        className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-[13px] placeholder:text-white/25 outline-none focus:border-white/40 transition-colors"
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, ...props }: { label?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && <span className="block text-white/40 text-[11px] font-bold tracking-wider mb-2 uppercase">{label}</span>}
      <select
        className="w-full bg-white/5 border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-[13px] outline-none focus:border-white/40 transition-colors appearance-none cursor-pointer"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-white/10">
            {headers.map((h) => (
              <th key={h} className="text-left text-white/40 text-[10px] font-bold tracking-wider uppercase py-3 px-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`py-3 px-3 text-[13px] ${className}`}>{children}</td>;
}

export function FilterTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`text-[11px] font-bold tracking-wider uppercase rounded-md px-3 py-1.5 transition-colors border ${
            active === t ? 'bg-white text-black border-white' : 'text-white/40 border-white/15 hover:text-white hover:border-white/30'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 rounded-lg border border-white/15 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        ‹
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-colors flex items-center justify-center ${
            p === page ? 'bg-white text-black' : 'border border-white/15 text-white/50 hover:text-white hover:border-white/30'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page === total}
        className="w-8 h-8 rounded-lg border border-white/15 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        ›
      </button>
    </div>
  );
}
