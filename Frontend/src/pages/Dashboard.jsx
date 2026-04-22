import { Link } from 'react-router-dom';
import SentimentChart from '../components/charts/SentimentChart';
import AlertCard from '../components/alerts/AlertCard';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import SectionTitle from '../components/ui/SectionTitle';
import useMockData from '../hooks/useMockData';
import { toneClass } from '../utils/helpers';

function Dashboard() {
  const { dashboardSummary, sentimentTimeline, selectedPoint, setSelectedPoint, alerts } = useMockData();

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Command Center"
        title="Track the conversation before it becomes the headline."
        description="A premium control room for monitoring sentiment, spotting operational risk, and understanding what audiences feel right now."
        action={
          <Link to="/live">
            <GradientButton>Open live monitoring</GradientButton>
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {dashboardSummary.map((item) => (
          <GlassCard key={item.label} className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.05]" />
            </div>
            <p className={`mt-6 text-sm font-medium ${toneClass(item.tone)}`}>{item.change} vs last window</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_420px]">
        <GlassCard>
          <SectionTitle
            eyebrow="Sentiment pulse"
            title="Momentum across the day"
            description="Tap any point in the curve to inspect why sentiment moved."
          />
          <div className="mt-6">
            <SentimentChart
              data={sentimentTimeline}
              onPointSelect={setSelectedPoint}
              activePointLabel={selectedPoint?.time}
            />
          </div>
        </GlassCard>

        <div className="space-y-6">
          <AlertCard alert={alerts.current[0]} plain />
          <GlassCard className="bg-white/[0.045]">
            <p className="text-xs uppercase tracking-[0.28em] text-orange-200/70">Selected explanation</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{selectedPoint?.driver}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">{selectedPoint?.explanation}</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;