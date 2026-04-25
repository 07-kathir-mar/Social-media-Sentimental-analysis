import GlassCard from '../ui/GlassCard';

const typeStyles = {
  critical: {
    card: 'bg-gradient-to-br from-red-500/14 via-orange-400/10 to-red-300/5',
    badge: 'border-red-300/20 bg-red-500/10 text-red-100',
    tag: 'border-red-300/20 bg-red-500/10 text-red-100',
  },
  high: {
    card: 'bg-gradient-to-br from-orange-500/14 via-orange-400/10 to-yellow-300/5',
    badge: 'border-orange-300/20 bg-orange-400/10 text-orange-100',
    tag: 'border-orange-300/20 bg-orange-300/10 text-orange-100',
  },
  medium: {
    card: 'bg-gradient-to-br from-yellow-500/10 via-yellow-400/8 to-white/5',
    badge: 'border-yellow-300/20 bg-yellow-400/10 text-yellow-100',
    tag: 'border-yellow-300/20 bg-yellow-300/10 text-yellow-100',
  },
  low: {
    card: 'bg-gradient-to-br from-slate-400/10 via-white/5 to-white/[0.03]',
    badge: 'border-white/10 bg-white/5 text-slate-200',
    tag: 'border-white/10 bg-white/[0.03] text-slate-200',
  },
};

function formatAlertTime(value) {
  if (!value) return 'Unknown time';
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    value = parsed;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hrs ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleString();
}

function AlertCard({ alert, subtle = false, hover = false, plain = false }) {
  const level = String(alert.type || alert.level || 'low').toLowerCase();
  const palette = typeStyles[level] || typeStyles.low;
  const cardClass = plain
    ? 'bg-white/[0.045]'
    : subtle
      ? 'bg-white/[0.03]'
      : palette.card;

  return (
    <GlassCard hover={hover} className={`relative overflow-hidden ${cardClass}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] ${palette.badge}`}>
              {level}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">{alert.title}</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {formatAlertTime(alert.created_at || alert.timestamp)}
          </span>
        </div>
        <p className="text-sm leading-7 text-slate-300">{alert.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          {(alert.tags || []).map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-3 py-1 text-xs ${palette.tag}`}
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
