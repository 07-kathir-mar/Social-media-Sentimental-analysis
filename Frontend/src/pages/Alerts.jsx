import AlertCard from '../components/alerts/AlertCard';
import { useBrand } from '../context/BrandContext';
import useAlerts from '../hooks/useAlerts';
import GlassCard from '../components/ui/GlassCard';
import SectionTitle from '../components/ui/SectionTitle';

function Alerts() {
  const { brand, setBrand } = useBrand();
  const { alerts, loading } = useAlerts(brand);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden pt-2">
      <div className="flex flex-col gap-4 px-2 md:flex-row md:items-end md:justify-between">
        <SectionTitle eyebrow="Alert system" title="Surface risks and their recent history" />
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
        <div className="space-y-6 pb-4">
          <GlassCard hover={false}>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Current alerts</p>
            <div className="mt-5 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-300">Loading alerts...</p>
              ) : alerts.current.length === 0 ? (
                <p className="text-sm text-slate-300">No live alerts detected for this brand.</p>
              ) : (
                alerts.current.map((alert, index) => (
                  <AlertCard key={`${alert.created_at}-${index}`} alert={alert} hover={false} />
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Alert history</p>
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {loading ? (
                <p className="text-sm text-slate-300">Loading alert history...</p>
              ) : alerts.history.length === 0 ? (
                <p className="text-sm text-slate-300">No recent alert history for this brand.</p>
              ) : (
                alerts.history.map((alert, index) => (
                  <AlertCard key={`${alert.created_at}-${index}`} alert={alert} subtle hover={false} />
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
