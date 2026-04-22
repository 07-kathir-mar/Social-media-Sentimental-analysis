import GlassCard from '../ui/GlassCard';

function AlertCard({ alert, subtle = false, hover = false, plain = false }) {
  const cardClass = plain
    ? 'bg-white/[0.045]'
    : subtle
      ? 'bg-white/[0.03]'
      : 'bg-gradient-to-br from-red-500/10 via-orange-400/10 to-yellow-300/5';

  return (
    <GlassCard hover={hover} className={`relative overflow-hidden ${cardClass}`}>
      {!subtle && !plain ? <div className="absolute inset-x-6 top-0 h-px bg-brand-gradient opacity-80" /> : null}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">{alert.level}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{alert.title}</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {alert.timestamp}
          </span>
        </div>
        <p className="text-sm leading-7 text-slate-300">{alert.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          {alert.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1 text-xs text-orange-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export default AlertCard;