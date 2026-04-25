import { useState } from 'react';
import SentimentChart from '../components/charts/SentimentChart';
import { useBrand } from '../context/BrandContext';
import useCustomAnalysis from '../hooks/useCustomAnalysis';
import { useZones } from '../hooks/useZones';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import SectionTitle from '../components/ui/SectionTitle';

const tabs = [
  { id: 'custom', label: 'Custom Analysis' },
  { id: 'zones', label: 'Sentiment Zones' },
];

function formatForInput(value) {
  return new Date(value).toISOString().slice(0, 16);
}

function PeopleThoughts() {
  const { brand, setBrand } = useBrand();
  const [activeTab, setActiveTab] = useState('custom');
  const defaultEnd = formatForInput(Date.now());
  const defaultStart = formatForInput(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [appliedRange, setAppliedRange] = useState({
    start: defaultStart,
    end: defaultEnd,
  });

  const { analysis, loading: analysisLoading } = useCustomAnalysis(
    brand,
    appliedRange.start,
    appliedRange.end,
  );
  const { zones, loading: zonesLoading } = useZones(brand);

  const handleApply = () => {
    setAppliedRange({ start: startTime, end: endTime });
  };

  const handleReset = () => {
    const defaults = { start: defaultStart, end: defaultEnd };
    setStartTime(defaults.start);
    setEndTime(defaults.end);
    setAppliedRange(defaults);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden pt-2">
      <div className="flex flex-col gap-4 px-2 md:flex-row md:items-end md:justify-between">
        <SectionTitle eyebrow="Audience reasoning" title="Understand what people think and why" />
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Brand</span>
          <select
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
          >
            <option value="Nike" className="bg-slate-950">Nike</option>
            <option value="Adidas" className="bg-slate-950">Adidas</option>
          </select>
        </div>
      </div>

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
                {analysisLoading ? (
                  <p className="text-sm text-slate-300">Loading custom analysis...</p>
                ) : analysis.graph.length === 0 ? (
                  <p className="text-sm text-slate-300">No sentiment data found for this time range.</p>
                ) : (
                  <SentimentChart data={analysis.graph} interactive={false} height="360px" />
                )}
              </GlassCard>

              <GlassCard hover={false} className="bg-gradient-to-br from-white/[0.045] via-orange-400/4 to-red-500/3 px-7 py-7">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-orange-200/70">Combined explanation</p>
                    <h3 className="text-2xl font-semibold text-white">
                      {appliedRange.start} to {appliedRange.end}
                    </h3>
                    <p className="max-w-4xl text-sm leading-7 text-slate-300">
                      {analysis.explanation.summary}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-orange-300/12 bg-orange-300/8 px-4 py-3 text-sm text-orange-100">
                    Trend: {analysis.explanation.trend}
                  </div>
                </div>
              </GlassCard>
            </div>
          ) : (
            <div className="space-y-4">
              {zonesLoading ? (
                <GlassCard hover={false} className="bg-white/[0.045] px-7 py-7">
                  <p className="text-sm text-slate-300">Loading sentimental zones...</p>
                </GlassCard>
              ) : zones.length === 0 ? (
                <GlassCard hover={false} className="bg-white/[0.045] px-7 py-7">
                  <p className="text-sm text-slate-300">No sentimental zones are stored for this brand yet.</p>
                </GlassCard>
              ) : (
                zones.map((zone, index) => (
                  <GlassCard key={`${zone.start_time}-${index}`} hover={false} className="bg-white/[0.045] px-7 py-7">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.28em] text-orange-200/70">
                          {new Date(zone.start_time).toLocaleString()} to {new Date(zone.end_time).toLocaleString()}
                        </p>
                        <h3 className="text-2xl font-semibold text-white">{zone.zone_type} Zone</h3>
                        <p className="max-w-3xl text-sm leading-7 text-slate-300">{zone.summary}</p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                        Avg score: {Number(zone.avg_score).toFixed(2)}
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PeopleThoughts;
