import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AlertCard from '../components/alerts/AlertCard';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import SectionTitle from '../components/ui/SectionTitle';
import { useBrand } from '../context/BrandContext';
import useAlerts from '../hooks/useAlerts';
import useCustomAnalysis from '../hooks/useCustomAnalysis';
import useForecast from '../hooks/useForecast';
import useLiveComments from '../hooks/useLiveComments';
import useSentimentData from '../hooks/useSentimentData';
import { useZones } from '../hooks/useZones';

function buildIsoRange(daysBack) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - daysBack);
  return {
    fromTime: start.toISOString(),
    toTime: end.toISOString(),
  };
}

function SummaryCard({ eyebrow, title, body, linkTo, linkLabel, metric }) {
  return (
    <GlassCard className="flex h-full flex-col justify-between bg-white/[0.045]" hover={false}>
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-orange-200/70">{eyebrow}</p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {metric ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              {metric}
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">{body}</p>
      </div>
      <div className="mt-6">
        <Link to={linkTo} className="text-sm font-medium text-orange-200 transition hover:text-white">
          {linkLabel}
        </Link>
      </div>
    </GlassCard>
  );
}

function Dashboard() {
  const { brand } = useBrand();
  const { fromTime, toTime } = useMemo(() => buildIsoRange(7), []);
  const { graphData, loading: sentimentLoading } = useSentimentData(brand);
  const { alerts, loading: alertsLoading } = useAlerts(brand);
  const { analysis, loading: thoughtsLoading } = useCustomAnalysis(brand, fromTime, toTime);
  const { zones, loading: zonesLoading } = useZones(brand);
  const { forecast, loading: forecastLoading } = useForecast(brand);
  const { comments, loading: liveLoading } = useLiveComments(brand);

  const latestSentiment = graphData.length > 0 ? graphData[graphData.length - 1] : null;
  const primaryAlert = alerts.current[0] || alerts.history[0] || null;
  const latestZone = zones.length > 0 ? zones[0] : null;
  const latestForecast = forecast.graph.length > 0 ? forecast.graph[forecast.graph.length - 1] : null;
  const latestComment = comments.length > 0 ? comments[0] : null;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Dashboard"
        title="Module summary"
        description={`A clean overview of ${brand} across Sentiment, Alerts, Thoughts, Forecast, and Live Feed.`}
        action={
          <Link to="/live">
            <GradientButton>Open live feed</GradientButton>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="bg-white/[0.045]" hover={false}>
          <p className="text-sm text-slate-400">Sentiment score</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {sentimentLoading ? '...' : latestSentiment ? `${latestSentiment.score}/100` : 'No data'}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {latestSentiment?.explanation || 'Latest sentiment summary will appear here once data is available.'}
          </p>
        </GlassCard>

        <GlassCard className="bg-white/[0.045]" hover={false}>
          <p className="text-sm text-slate-400">Current alerts</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {alertsLoading ? '...' : alerts.current.length}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {primaryAlert?.title || 'No active alerts found for this brand.'}
          </p>
        </GlassCard>

        <GlassCard className="bg-white/[0.045]" hover={false}>
          <p className="text-sm text-slate-400">Sentiment zones</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {zonesLoading ? '...' : zones.length}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {latestZone?.summary || 'Zone summaries will appear here when thought patterns are available.'}
          </p>
        </GlassCard>

        <GlassCard className="bg-white/[0.045]" hover={false}>
          <p className="text-sm text-slate-400">Live comments</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {liveLoading ? '...' : comments.length}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {latestComment?.comment || 'Recent processed comments will appear here.'}
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SummaryCard
          eyebrow="Sentiment"
          title="Latest graph summary"
          metric={latestSentiment ? latestSentiment.shortLabel : ''}
          body={
            latestSentiment
              ? latestSentiment.explanation || 'Latest sentiment point is available, but no explanation text was returned.'
              : 'No sentiment graph data is available for this brand right now.'
          }
          linkTo="/sentiment"
          linkLabel="Open Sentiment"
        />

        <SummaryCard
          eyebrow="Thoughts"
          title={`Trend: ${analysis.explanation?.trend || 'stable'}`}
          metric={thoughtsLoading ? 'Loading' : `${analysis.graph.length} points`}
          body={
            analysis.explanation?.summary ||
            'Custom analysis summary for the recent time range will appear here once loaded.'
          }
          linkTo="/thoughts"
          linkLabel="Open Thoughts"
        />

        <SummaryCard
          eyebrow="Forecast"
          title={forecast.explanation?.title || 'Forecast unavailable'}
          metric={forecastLoading ? 'Loading' : latestForecast ? `${latestForecast.prediction}%` : ''}
          body={
            forecast.explanation?.summary ||
            'The future prediction summary will appear here when enough sentiment history is available.'
          }
          linkTo="/forecast"
          linkLabel="Open Forecast"
        />

        <SummaryCard
          eyebrow="Live Feed"
          title={latestComment ? `${latestComment.platform} mention` : 'Live feed snapshot'}
          metric={latestComment?.sentiment || ''}
          body={
            latestComment?.comment ||
            'Recent brand mentions will appear here once processed comments are available.'
          }
          linkTo="/live"
          linkLabel="Open Live Feed"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div>
          <SectionTitle
            eyebrow="Alerts"
            title="Current alert snapshot"
            description="A quick look at the latest alert coming from the alert tab."
          />
          <div className="mt-4">
            {primaryAlert ? (
              <AlertCard alert={primaryAlert} plain />
            ) : (
              <GlassCard className="bg-white/[0.045]" hover={false}>
                <p className="text-sm leading-7 text-slate-300">No alert card is available for this brand yet.</p>
              </GlassCard>
            )}
          </div>
        </div>

        <SummaryCard
          eyebrow="Thoughts Zones"
          title={latestZone ? `${latestZone.zone_type} zone` : 'No zone summary'}
          metric={latestZone?.avg_score !== undefined ? Number(latestZone.avg_score).toFixed(2) : ''}
          body={
            latestZone?.summary ||
            'The latest sentimental zone summary will appear here after zone data is available.'
          }
          linkTo="/thoughts"
          linkLabel="Open Thought Zones"
        />
      </div>
    </div>
  );
}

export default Dashboard;
