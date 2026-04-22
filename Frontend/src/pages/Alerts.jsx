import AlertCard from '../components/alerts/AlertCard';
import GlassCard from '../components/ui/GlassCard';
import SectionTitle from '../components/ui/SectionTitle';
import useMockData from '../hooks/useMockData';

function Alerts() {
  const { alerts } = useMockData();

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden pt-2">
      <SectionTitle eyebrow="Alert system" title="Surface risks, viral moments, and their history" />

      <div className="flex-1 overflow-y-auto px-2 py-3 pr-3">
        <div className="space-y-6 pb-4">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {alerts.current.map((alert) => (
                <AlertCard key={alert.id} alert={alert} hover={false} />
              ))}
            </div>

            <GlassCard hover={false}>
              <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Viral content</p>
              <div className="mt-5 space-y-4">
                {alerts.viral.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <span className="rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-slate-950">
                        {item.impact}
                      </span>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-500">{item.platform}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <GlassCard hover={false}>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Alert history</p>
            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {alerts.history.map((alert) => (
                <AlertCard key={alert.id} alert={alert} subtle hover={false} />
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Alerts;