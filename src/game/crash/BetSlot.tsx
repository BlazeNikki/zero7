import type { BetSlotState, Phase } from './types';
import { formatMultiplier, formatAmount } from './engine';
import { MIN_SOL_BET, MAX_SOL_BET, SOL_PRESETS } from '@/lib/sol-bet';

export default function BetSlot({
  slot,
  state,
  phase,
  multiplier,
  betState,
  onPlace,
  onCashOut,
  onUpdate,
}: {
  slot: 0 | 1;
  state: BetSlotState;
  phase: Phase;
  multiplier: number;
  betState?: 'idle' | 'sending' | 'active' | 'error';
  onPlace: () => void;
  onCashOut: () => void;
  onUpdate: (patch: Partial<BetSlotState>) => void;
}) {
  const canPlace = phase === 'betting' && !state.placed;
  const canCashOut = phase === 'running' && state.placed && !state.cashedOut;
  const isWin = state.cashedOut && state.winAmount !== null;

  const quickAmount = (type: 'half' | 'double' | 'min' | 'max') => {
    const v = state.amount;
    if (type === 'half') onUpdate({ amount: Math.max(MIN_SOL_BET, Math.floor(v / 2 * 1000) / 1000) });
    else if (type === 'double') onUpdate({ amount: Math.min(MAX_SOL_BET, v * 2) });
    else if (type === 'min') onUpdate({ amount: MIN_SOL_BET });
    else onUpdate({ amount: MAX_SOL_BET });
  };

  return (
    <div className="flex flex-col gap-2.5 bg-[#0f0f0f] border border-white/15 rounded-xl p-3.5">
      {/* Tab + mode switch */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-white/40 text-[11px] font-black tracking-widest">BET {slot + 1}</span>
        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => onUpdate({ mode: 'manual' })}
            className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-md transition-colors ${
              state.mode === 'manual' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            СТАВКА
          </button>
          <button
            onClick={() => onUpdate({ mode: 'auto' })}
            className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-md transition-colors ${
              state.mode === 'auto' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            АВТО
          </button>
        </div>
      </div>

      {/* Amount input + quick buttons */}
      <div className="flex flex-col gap-2 min-w-0">
        <div className="w-full min-w-0 flex items-center bg-black border border-white/15 rounded-lg px-3 focus-within:border-white/40 transition-colors">
          <input
            type="number"
            value={state.amount}
            onChange={(e) => onUpdate({ amount: Math.max(0, Number(e.target.value)) })}
            disabled={state.placed}
            className="flex-1 min-w-0 w-0 bg-transparent text-white text-[16px] font-bold tabular-nums outline-none disabled:opacity-50"
            placeholder="0"
            step="0.001"
            min={MIN_SOL_BET}
            max={MAX_SOL_BET}
          />
          <span className="text-white/30 text-[12px] font-bold shrink-0 ml-1">SOL</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 w-full min-w-0">
          {(['half', 'double', 'min', 'max'] as const).map((t) => (
            <button
              key={t}
              onClick={() => quickAmount(t)}
              disabled={state.placed}
              className="min-w-0 w-full overflow-hidden text-white/50 text-[10px] font-bold px-1 py-2 rounded-lg bg-white/5 border border-white/10 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30"
            >
              {t === 'half' ? '½' : t === 'double' ? 'x2' : t === 'min' ? 'MIN' : 'MAX'}
            </button>
          ))}
        </div>
      </div>

      {/* Auto mode settings */}
      {state.mode === 'auto' && (
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-[11px] text-white/50 font-bold">
            АВТО КЭШАУТ
            <input
              type="number"
              step="0.1"
              value={state.autoCashout}
              onChange={(e) => onUpdate({ autoCashout: Math.max(1.01, Number(e.target.value)) })}
              disabled={state.placed}
              className="w-16 bg-black border border-white/15 rounded-md px-2 py-1 text-white text-[12px] tabular-nums outline-none focus:border-white/40 disabled:opacity-50"
            />
            <span className="text-white/30">x</span>
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-white/50 font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={state.autoNextRound}
              onChange={(e) => onUpdate({ autoNextRound: e.target.checked })}
              className="accent-white"
            />
            АВТО СТАВКА
          </label>
        </div>
      )}

      {/* Action button */}
      {isWin ? (
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-3">
          <div className="flex flex-col">
            <span className="text-emerald-400 text-[10px] font-bold tracking-widest">ВЫИГРЫШ</span>
            <span className="text-white font-black text-[14px] tabular-nums">{formatAmount(state.winAmount!)}</span>
          </div>
          <span className="text-emerald-400 font-black text-[16px] tabular-nums">{formatMultiplier(state.cashoutMultiplier!)}</span>
        </div>
      ) : canCashOut ? (
        <button
          onClick={onCashOut}
          className="w-full bg-emerald-500 text-black font-black text-[13px] tracking-[0.15em] rounded-lg py-3.5 hover:bg-emerald-400 active:bg-emerald-600 transition-colors animate-pulse"
        >
          ЗАБРАТЬ {formatMultiplier(multiplier)} — {formatAmount(Math.floor(state.amount * multiplier * 100) / 100)}
        </button>
      ) : state.placed && phase === 'running' ? (
        <div className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 text-center text-white/40 text-[12px] font-bold tracking-widest">
          СТАВКА ПРИНЯТА
        </div>
      ) : state.placed ? (
        <div className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 text-center text-white/40 text-[12px] font-bold tracking-widest">
          ОЖИДАНИЕ РАУНДА…
        </div>
      ) : (
        <button
          onClick={onPlace}
          disabled={!canPlace || betState === 'sending'}
          className="w-full bg-white text-black font-black text-[13px] tracking-[0.2em] rounded-lg py-3.5 hover:bg-white/90 active:bg-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {betState === 'sending' ? 'ОБРАБОТКА...' : 'СДЕЛАТЬ СТАВКУ'}
        </button>
      )}
    </div>
  );
}
