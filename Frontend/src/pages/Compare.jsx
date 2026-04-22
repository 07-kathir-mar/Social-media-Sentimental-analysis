import { useMemo, useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import SectionTitle from '../components/ui/SectionTitle';
import useMockData from '../hooks/useMockData';
import { formatPercent } from '../utils/helpers';

function Compare() {
  const { compareBrand } = useMockData();
  const [brandName, setBrandName] = useState('Nova Pulse');

  const comparison = useMemo(() => compareBrand(brandName), [brandName, compareBrand]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden pt-2">
      <SectionTitle eyebrow="Brand compare" title="Benchmark your brand against a competitor" />

      <div className="flex-1 overflow-y-auto px-2 py-3 pr-3">
        <div className="space-y-6 pb-4">
          <GlassCard hover={false}>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px]">
              <input
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                className="w-full rounded-[22px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition duration-300 focus:border-orange-300/40"
                placeholder="Enter second brand"
              />
              <GradientButton className="w-full">Update comparison</GradientButton>
            </div>
          </GlassCard>

          <div className="grid gap-6 xl:grid-cols-2">
            {[comparison.primary, comparison.secondary].map((brand) => (
              <GlassCard key={brand.brand} hover={false}>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">{brand.brand}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-400">Positive</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatPercent(brand.positive)}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-400">Negative</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatPercent(brand.negative)}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-400">Neutral</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatPercent(brand.neutral)}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <GlassCard hover={false}>
              <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Insights</p>
              <div className="mt-5 space-y-3">
                {comparison.insights.map((insight) => (
                  <div key={insight} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
                    {insight}
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Improvement suggestions</p>
              <div className="mt-5 space-y-3">
                {comparison.suggestions.map((suggestion) => (
                  <div key={suggestion} className="rounded-[22px] border border-orange-300/20 bg-orange-300/10 p-4 text-sm leading-7 text-orange-100">
                    {suggestion}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Compare;