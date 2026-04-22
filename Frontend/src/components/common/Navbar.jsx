import { useLocation } from 'react-router-dom';

const routeLabels = {
  '/': 'Overview',
  '/live': 'Live Feed',
  '/sentiment': 'Sentiment Graph',
  '/thoughts': 'People Thoughts',
  '/alerts': 'Alert Center',
  '/forecast': 'Forecast Studio',
  '/compare': 'Brand Compare',
};

function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between rounded-[28px] border border-white/10 bg-black/30 px-5 py-4 backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-orange-200/60">Signal Scope</p>
        <h1 className="text-xl font-semibold text-white">{routeLabels[location.pathname] ?? 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:block">
          Monitoring brand pulse across Reddit, YouTube, X, and TikTok
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-slate-950">
          SS
        </div>
      </div>
    </header>
  );
}

export default Navbar;