export function formatCompactNumber(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value) {
  return `${value}%`;
}

export function formatRelativeTime(input) {
  const timestamp = new Date(input).getTime();
  const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }

  const hours = Math.round(diffMinutes / 60);
  return `${hours} hrs ago`;
}

export function sentimentBadgeClass(sentiment) {
  const tones = {
    Positive: 'bg-emerald-400/10 text-emerald-200 border border-emerald-300/20',
    Negative: 'bg-red-400/10 text-red-200 border border-red-300/20',
    Neutral: 'bg-slate-400/10 text-slate-200 border border-slate-300/20',
  };

  return tones[sentiment] ?? tones.Neutral;
}

export function toneClass(tone) {
  const tones = {
    positive: 'text-emerald-300',
    negative: 'text-red-300',
    neutral: 'text-slate-300',
  };

  return tones[tone] ?? tones.neutral;
}

export function summarizeRange(data, start, end) {
  const startTime = start ? new Date(start).getTime() : null;
  const endTime = end ? new Date(end).getTime() : null;

  const enriched = data.map((entry, index) => {
    const hour = 8 + index;
    const timestamp = new Date(`2026-04-11T${String(hour).padStart(2, '0')}:00:00`).getTime();
    return { ...entry, timestamp };
  });

  const filtered = enriched.filter((entry) => {
    if (startTime && entry.timestamp < startTime) return false;
    if (endTime && entry.timestamp > endTime) return false;
    return true;
  });

  const sample = filtered.length ? filtered : enriched;
  const average = Math.round(sample.reduce((sum, entry) => sum + entry.score, 0) / sample.length);
  const dominant =
    average >= 72 ? 'Positive momentum' : average >= 60 ? 'Balanced but healthy' : 'Watch for softness';

  return {
    average,
    dominant,
    reasoning:
      average >= 72
        ? 'Conversation is being carried by advocates, creators, and favorable comparison posts.'
        : average >= 60
          ? 'Brand perception remains favorable, though it is sensitive to operational concerns.'
          : 'Negative narratives are gaining enough traction to dilute otherwise positive discussion.',
  };
}