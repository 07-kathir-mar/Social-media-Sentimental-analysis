import ForecastChart from '../components/charts/ForecastChart';
import { useBrand } from '../context/BrandContext';
import useForecast from '../hooks/useForecast';
import GlassCard from '../components/ui/GlassCard';
import SectionTitle from '../components/ui/SectionTitle';

function ExplanationPanel({ explanation, title }) {
  if (!explanation?.title) {
    return null;
  }

  return (
    <GlassCard hover={false} className="bg-white/[0.045]">
      <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">{title}</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{explanation.title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-300">{explanation.summary}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {explanation.drivers?.map((driver) => (
          <div key={driver.name} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">{driver.name}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-orange-200/70">{driver.impact}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{driver.desc}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function Forecast() {
  const { brand } = useBrand();
  const { forecast, loading } = useForecast(brand);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-6 overflow-hidden pt-2">
      <div className="flex flex-col gap-4 px-2 md:flex-row md:items-end md:justify-between">
        <SectionTitle
          eyebrow="Forecast"
          title="Monthly forecast"
          description={`Project the next 30 days from the learned ${brand} sentiment_12h trend.`}
        />
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto px-2 py-3 pr-3">
        <div className="space-y-6 pb-4">
          <GlassCard hover={false} className="relative z-0 overflow-hidden">
            {loading ? (
              <p className="text-sm text-slate-300">Loading forecast...</p>
            ) : forecast.graph.length === 0 ? (
              <p className="text-sm text-slate-300">No forecast data available for this brand.</p>
            ) : (
              <ForecastChart data={forecast.graph} />
            )}
          </GlassCard>
          <ExplanationPanel explanation={forecast.explanation} title="Prediction explanation" />
        </div>
      </div>
    </div>
  );
}

export default Forecast;
