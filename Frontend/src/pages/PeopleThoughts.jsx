import { useMemo, useState } from 'react';
import SentimentChart from '../components/charts/SentimentChart';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import SectionTitle from '../components/ui/SectionTitle';
import useMockData from '../hooks/useMockData';

const tabs = [
  { id: 'custom', label: 'Custom Analysis' },
  { id: 'zones', label: 'Sentiment Zones' },
];

function toneFromAverage(value) {
  if (value >= 68) return 'Positive momentum';
  if (value <= 46) return 'Negative pressure';
  return 'Balanced sentiment';
}

function buildRangeNarrative(entries) {
  if (!entries.length) {
    return 'No records were found for this timeline. Adjust the range and run the analysis again.';
  }

  const average = Math.round(entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length);
  const strongestPositive = [...entries].sort((a, b) => b.score - a.score)[0];
  const softest = [...entries].sort((a, b) => a.score - b.score)[0];

  return `Across this selected timeline, the overall sentiment averaged ${average}/100 and stayed in a ${toneFromAverage(average).toLowerCase()} state. The strongest positive window appeared around ${strongestPositive.time}, while the softest period appeared around ${softest.time}. In general, audiences reacted most strongly to product quality, delivery experience, and support consistency across the selected range.`;
}

function PeopleThoughts() {
  const { sentimentYearTimeline, thoughtSentimentZones } = useMockData();
  const [activeTab, setActiveTab] = useState('custom');
  const [startTime, setStartTime] = useState('2026-02-01T00:00');
  const [endTime, setEndTime] = useState('2026-04-30T12:00');
  const [appliedRange, setAppliedRange] = useState({
    start: '2026-02-01T00:00',
    end: '2026-04-30T12:00',
  });

  const filteredTimeline = useMemo(() => {
    const start = new Date(appliedRange.start).getTime();
    const end = new Date(appliedRange.end).getTime();

    return sentimentYearTimeline.filter((entry) => {
      const current = new Date(entry.timestamp).getTime();
      return current >= start && current <= end;
    });
  }, [appliedRange, sentimentYearTimeline]);

  const summary = useMemo(() => {
    if (!filteredTimeline.length) {
      return {
        average: 0,
        label: 'No data',
        narrative: 'No records were found for the selected timeline.',
      };
    }

    const average = Math.round(filteredTimeline.reduce((sum, entry) => sum + entry.score, 0) / filteredTimeline.length);
    return {
      average,
      label: toneFromAverage(average),
      narrative: buildRangeNarrative(filteredTimeline),
    };
  }, [filteredTimeline]);

  const handleApply = () => {
    setAppliedRange({ start: startTime, end: endTime });
  };

  const handleReset = () => {
    const defaults = { start: '2026-02-01T00:00', end: '2026-04-30T12:00' };
    setStartTime(defaults.start);
    setEndTime(defaults.end);
    setAppliedRange(defaults);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden pt-2">
      <SectionTitle eyebrow="Audience reasoning" title="Understand what people think and why" />

      <div className="flex-1 overflow-y-auto px-2 py-3 pr-3">
        <div className="space-y-5 pb-4">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-3 text-sm font-medium transition duration-300 ${
                  activeTab === tab.id
                    ? 'bg-brand-gradient text-slate-950'
                    : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'custom' ? (
            <div className="space-y-5">
              <GlassCard hover={false} className="bg-white/[0.045] px-7 py-7">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px_160px] xl:items-end">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">From time</span>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      className="w-full rounded-[20px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition duration-300 focus:border-orange-300/25"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">To time</span>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      className="w-full rounded-[20px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition duration-300 focus:border-orange-300/25"
                    />
                  </label>
                  <GradientButton className="w-full" onClick={handleApply}>
                    Enter
                  </GradientButton>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-200 transition duration-300 hover:bg-white/[0.05]"
                  >
                    Restart
                  </button>
                </div>
              </GlassCard>

              <GlassCard hover={false} className="bg-white/[0.045] px-7 py-7">
                <SentimentChart data={filteredTimeline} interactive={false} height="360px" />
              </GlassCard>

              <GlassCard hover={false} className="bg-gradient-to-br from-white/[0.045] via-orange-400/4 to-red-500/3 px-7 py-7">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-orange-200/70">Timeline explanation</p>
                    <h3 className="text-2xl font-semibold text-white">
                      {appliedRange.start} to {appliedRange.end}
                    </h3>
                    <p className="max-w-4xl text-sm leading-7 text-slate-300">{summary.narrative}</p>
                  </div>
                  <div className="rounded-[24px] border border-orange-300/12 bg-orange-300/8 px-4 py-3 text-sm text-orange-100">
                    Average sentiment: {summary.average}/100
                  </div>
                </div>
              </GlassCard>
            </div>
          ) : (
            <div className="space-y-4">
              {thoughtSentimentZones.map((zone) => (
                <GlassCard key={zone.id} hover={false} className="bg-white/[0.045] px-7 py-7">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.28em] text-orange-200/70">{zone.range}</p>
                      <h3 className="text-2xl font-semibold text-white">{zone.sentiment}</h3>
                      <p className="max-w-3xl text-sm leading-7 text-slate-300">{zone.summary}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 xl:max-w-[320px] xl:justify-end">
                      {zone.drivers.map((driver) => (
                        <span
                          key={driver}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
                        >
                          {driver}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PeopleThoughts;