import { useState, useEffect, type ReactNode } from 'react';
import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import CenterColumn from '@/components/CenterColumn';
import RightSidebar from '@/components/RightSidebar';
import Footer from '@/components/Footer';
import Cabinet from '@/cabinet/Cabinet';
import Tournaments from '@/tournaments/Tournaments';
import Promotions from '@/promotions/Promotions';
import Support from '@/support/Support';
import GamePage from '@/game/GamePage';
import CrashPage from '@/game/crash/CrashPage';
import MinesPage from '@/game/mines/MinesPage';
import PlinkoPage from '@/game/plinko/PlinkoPage';

type View = 'home' | 'cabinet' | 'tournaments' | 'promotions' | 'support' | 'game' | 'crash' | 'mines' | 'plinko';

const viewToPath: Record<View, string> = {
  home: '/',
  cabinet: '/cabinet',
  tournaments: '/tournaments',
  promotions: '/promotions',
  support: '/support',
  game: '/game',
  crash: '/crash',
  mines: '/mines',
  plinko: '/plinko',
};

const pathToView = (path: string): { view: View; gameId?: string } => {
  const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (segments.length === 0) return { view: 'home' };
  const first = segments[0];
  switch (first) {
    case 'cabinet': return { view: 'cabinet' };
    case 'tournaments': return { view: 'tournaments' };
    case 'promotions': return { view: 'promotions' };
    case 'support': return { view: 'support' };
    case 'crash': return { view: 'crash' };
    case 'mines': return { view: 'mines' };
    case 'plinko': return { view: 'plinko' };
    case 'game':
      if (segments[1]) return { view: 'game', gameId: segments[1] };
      return { view: 'game' };
    default: return { view: 'home' };
  }
};

const buildPath = (view: View, gameId?: string): string => {
  if (view === 'home') return '/';
  if (view === 'game' && gameId) return `/game/${gameId}`;
  return viewToPath[view];
};

function PageTransition({ view, children, className }: { view: string; children: ReactNode; className?: string }) {
  return (
    <div key={view} className={`animate-page-enter ${className ?? ''}`}>
      {children}
    </div>
  );
}

function App() {
  const initial = pathToView(window.location.pathname);
  const [view, setView] = useState<View>(initial.view);
  const [gameId, setGameId] = useState<string>(initial.gameId ?? 'g1');

  const navigate = (nextView: View, nextGameId?: string) => {
    const path = buildPath(nextView, nextGameId);
    if (path !== window.location.pathname) {
      window.history.pushState({ view: nextView, gameId: nextGameId }, '', path);
    }
    setView(nextView);
    if (nextGameId) setGameId(nextGameId);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPop = () => {
      const state = pathToView(window.location.pathname);
      setView(state.view);
      if (state.gameId) setGameId(state.gameId);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openGame = (id: string) => {
    if (id === 'g6') {
      navigate('crash');
    } else if (id === 'g5') {
      navigate('mines');
    } else if (id === 'g7') {
      navigate('plinko');
    } else {
      navigate('game', id);
    }
  };

  const header = (
    <Header
      activeView={view}
      onHome={() => navigate('home')}
      onOpenCabinet={() => navigate('cabinet')}
      onOpenTournaments={() => navigate('tournaments')}
      onOpenPromotions={() => navigate('promotions')}
      onOpenSupport={() => navigate('support')}
      onOpenGame={openGame}
    />
  );

  const footer = (
    <div className="flex justify-center w-full shrink-0 pb-4">
      <div className="w-full max-w-[1408px] px-1">
        <Footer />
      </div>
    </div>
  );

  if (view === 'game' || view === 'crash' || view === 'mines' || view === 'plinko') {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white overflow-x-clip">
        <div className="flex justify-center w-full shrink-0 sticky top-0 z-50 bg-black">
          <div className="w-full max-w-[1408px] px-1">
            {header}
          </div>
        </div>
        <PageTransition view={view}>
          {view === 'crash' ? (
            <CrashPage onHome={() => navigate('home')} />
          ) : view === 'mines' ? (
            <MinesPage onHome={() => navigate('home')} />
          ) : view === 'plinko' ? (
            <PlinkoPage onHome={() => navigate('home')} />
          ) : (
            <GamePage gameId={gameId} onHome={() => navigate('home')} onOpenGame={openGame} onOpenCabinet={() => navigate('cabinet')} />
          )}
        </PageTransition>
        {footer}
      </div>
    );
  }

  if (view === 'cabinet') {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white overflow-x-clip">
        <div className="flex justify-center w-full shrink-0 sticky top-0 z-50 bg-black">
          <div className="w-full max-w-[1408px] px-1">
            {header}
          </div>
        </div>
        <PageTransition view={view}>
          <Cabinet />
        </PageTransition>
        {footer}
      </div>
    );
  }

  if (view === 'tournaments') {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white overflow-x-clip">
        <div className="flex justify-center w-full shrink-0 sticky top-0 z-50 bg-black">
          <div className="w-full max-w-[1408px] px-1">
            {header}
          </div>
        </div>
        <PageTransition view={view}>
          <Tournaments />
        </PageTransition>
        {footer}
      </div>
    );
  }

  if (view === 'promotions') {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white overflow-x-clip">
        <div className="flex justify-center w-full shrink-0 sticky top-0 z-50 bg-black">
          <div className="w-full max-w-[1408px] px-1">
            {header}
          </div>
        </div>
        <PageTransition view={view}>
          <Promotions />
        </PageTransition>
        {footer}
      </div>
    );
  }

  if (view === 'support') {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white overflow-x-clip">
        <div className="flex justify-center w-full shrink-0 sticky top-0 z-50 bg-black">
          <div className="w-full max-w-[1408px] px-1">
            {header}
          </div>
        </div>
        <PageTransition view={view}>
          <Support />
        </PageTransition>
        {footer}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-x-clip">
      <div className="flex justify-center w-full shrink-0 sticky top-0 z-50 bg-black">
        <div className="w-full max-w-[1408px] px-1">
          {header}
        </div>
      </div>
      <main className="flex-none flex justify-center">
        <div className="w-full max-w-[1408px] grid grid-cols-1 lg:grid-cols-[286px_minmax(0,1fr)] gap-3 px-1 pt-2 pb-6 lg:pb-3 lg:min-h-screen items-start">
          {/* Left sidebar: second on mobile, first column on desktop */}
          <div className="order-2 lg:order-1 flex flex-col gap-3 lg:overflow-y-auto lg:pb-4 lg:min-h-0 min-w-0">
            <LeftSidebar />
          </div>

          {/* Center: first on mobile, middle column on desktop */}
          <PageTransition view={view} className="order-1 lg:order-2 flex-1 min-w-0 flex flex-col">
            <CenterColumn onOpenGame={openGame} />
          </PageTransition>

        </div>
      </main>

      {/* Floating chat — above all blocks, detached from grid */}
      <RightSidebar />

      {/* Footer — below content, same max-width and padding */}
      {footer}
    </div>
  );
}

export default App;
