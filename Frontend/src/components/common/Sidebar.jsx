import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/live', label: 'Live Feed' },
  { to: '/sentiment', label: 'Sentiment' },
  { to: '/thoughts', label: 'Thoughts' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/forecast', label: 'Forecast' },
  { to: '/compare', label: 'Compare' },
];

function Sidebar() {
  return (
    <aside className="sticky top-0 z-[120] rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl pointer-events-auto">
      <div className="mb-8 space-y-3">
        <div className="inline-flex rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950">
          AI Intel
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Signal Scope</h2>
          <p className="mt-2 text-sm text-slate-400">
            Premium social listening for campaigns, launches, and brand defense.
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/' || item.to === '/forecast'}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition duration-300 ${
                isActive
                  ? 'bg-brand-gradient text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span>{item.label}</span>
            <span className="text-xs opacity-80">01</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 rounded-[28px] border border-orange-300/20 bg-orange-400/10 p-4">
        <p className="text-sm font-medium text-white">Realtime confidence</p>
        <p className="mt-2 text-xs leading-6 text-slate-300">
          Trend engine confidence is at 91.4%, with the sharpest volatility in creator-led mentions.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
