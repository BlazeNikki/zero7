import { useRef, useEffect } from 'react';
import type { Phase } from './types';
import { multiplierAt } from './engine';

type Point = { t: number; m: number };

export default function CrashGraph({
  phase,
  multiplier,
  crashPoint,
  countdown,
}: {
  phase: Phase;
  multiplier: number;
  crashPoint: number;
  countdown: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const startTimeRef = useRef(0);
  const phaseRef = useRef<Phase>(phase);
  const multRef = useRef(multiplier);
  const crashRef = useRef(crashPoint);
  const countdownRef = useRef(countdown);
  const rafRef = useRef<number>(0);
  const lastPointTimeRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; size: number }[]>([]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { multRef.current = multiplier; }, [multiplier]);
  useEffect(() => { crashRef.current = crashPoint; }, [crashPoint]);
  useEffect(() => { countdownRef.current = countdown; }, [countdown]);

  // Reset / start timing on phase transitions
  useEffect(() => {
    if (phase === 'running' && startTimeRef.current === 0) {
      startTimeRef.current = performance.now();
      pointsRef.current = [];
      lastPointTimeRef.current = 0;
    }
    if (phase === 'betting') {
      startTimeRef.current = 0;
      pointsRef.current = [];
      lastPointTimeRef.current = 0;
      particlesRef.current = [];
    }
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        const y = (h / 8) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let i = 1; i < 10; i++) {
        const x = (w / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const currentPhase = phaseRef.current;
      const currentCrash = crashRef.current;

      // Drive the curve ourselves at 60fps during running
      if (currentPhase === 'running' && startTimeRef.current > 0) {
        const elapsed = performance.now() - startTimeRef.current;
        const m = multiplierAt(elapsed);

        // Push a point every ~16ms (each frame) for a smooth curve
        if (elapsed - lastPointTimeRef.current >= 0) {
          pointsRef.current.push({ t: elapsed, m });
          lastPointTimeRef.current = elapsed;
          if (pointsRef.current.length > 1200) {
            pointsRef.current = pointsRef.current.slice(-1200);
          }
        }
      }

      // Draw curve
      if (currentPhase === 'running' || currentPhase === 'crashed' || currentPhase === 'result') {
        const pts = pointsRef.current;
        if (pts.length >= 2) {
          const maxT = Math.max(pts[pts.length - 1].t, 1000);
          const displayMult = currentPhase === 'running' ? multRef.current : currentCrash;
          const maxM = Math.max(displayMult, 2);

          const toX = (t: number) => (t / maxT) * w * 0.92 + w * 0.04;
          const toY = (m: number) => h - ((m - 1) / (maxM - 1)) * h * 0.8 - h * 0.1;

          const isCrashed = currentPhase === 'crashed' || currentPhase === 'result';
          const lineColor = isCrashed ? '#E5484D' : '#ffffff';

          // Filled area under curve
          const gradient = ctx.createLinearGradient(0, 0, 0, h);
          if (isCrashed) {
            gradient.addColorStop(0, 'rgba(229,72,77,0.15)');
            gradient.addColorStop(1, 'rgba(229,72,77,0)');
          } else {
            gradient.addColorStop(0, 'rgba(255,255,255,0.12)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
          }

          ctx.beginPath();
          ctx.moveTo(toX(pts[0].t), h);
          for (const p of pts) {
            ctx.lineTo(toX(p.t), toY(p.m));
          }
          ctx.lineTo(toX(pts[pts.length - 1].t), h);
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();

          // Line
          ctx.beginPath();
          ctx.moveTo(toX(pts[0].t), toY(pts[0].m));
          for (const p of pts) {
            ctx.lineTo(toX(p.t), toY(p.m));
          }
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 2.5;
          ctx.lineJoin = 'round';
          ctx.stroke();

          // End point glow
          const lastPt = pts[pts.length - 1];
          const endX = toX(lastPt.t);
          const endY = toY(lastPt.m);

          ctx.beginPath();
          ctx.arc(endX, endY, 6, 0, Math.PI * 2);
          ctx.fillStyle = lineColor;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(endX, endY, 12, 0, Math.PI * 2);
          ctx.fillStyle = isCrashed ? 'rgba(229,72,77,0.2)' : 'rgba(255,255,255,0.15)';
          ctx.fill();

          // Particles during running
          if (currentPhase === 'running' && Math.random() < 0.3) {
            particlesRef.current.push({
              x: endX,
              y: endY,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2 - 0.5,
              life: 1,
              size: Math.random() * 2 + 1,
            });
          }
        } else if (pts.length === 1) {
          // Draw a single starting dot so there's something visible
          const toX = (t: number) => (t / 1000) * w * 0.92 + w * 0.04;
          const toY = () => h - h * 0.1;
          ctx.beginPath();
          ctx.arc(toX(pts[0].t), toY(), 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }

      // Update & draw particles
      const newParticles: typeof particlesRef.current = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = phaseRef.current === 'crashed' || phaseRef.current === 'result'
            ? `rgba(229,72,77,${p.life})`
            : `rgba(255,255,255,${p.life * 0.6})`;
          ctx.fill();
          newParticles.push(p);
        }
      }
      particlesRef.current = newParticles;

      // Watermark "ZERO7" text
      ctx.font = 'bold 48px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ZERO7', w / 2, h / 2);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const isCrashed = phase === 'crashed' || phase === 'result';
  const displayMult = isCrashed ? crashPoint : multiplier;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Center multiplier display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {phase === 'betting' ? (
          <div className="text-center">
            <p className="text-white/40 text-[12px] font-bold tracking-[0.25em] mb-2">ПРИЁМ СТАВОК</p>
            <p className="text-white font-black text-[48px] md:text-[72px] tabular-nums tracking-tight leading-none">
              {(countdown / 1000).toFixed(0)}
              <span className="text-white/40 text-[24px] md:text-[32px]">с</span>
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p
              className={`font-black tabular-nums tracking-tight leading-none transition-colors duration-300 ${
                isCrashed ? 'text-[#E5484D]' : 'text-white'
              } text-[56px] md:text-[96px]`}
              style={{ textShadow: isCrashed ? '0 0 40px rgba(229,72,77,0.4)' : '0 0 40px rgba(255,255,255,0.15)' }}
            >
              {displayMult.toFixed(2)}x
            </p>
            {isCrashed && (
              <p className="text-[#E5484D] font-black text-[14px] md:text-[18px] tracking-[0.2em] mt-2 animate-in fade-in duration-500">
                CRASHED @ {crashPoint.toFixed(2)}x
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
