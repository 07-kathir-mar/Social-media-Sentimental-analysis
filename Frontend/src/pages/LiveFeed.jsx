import LiveFeedItem from '../components/feed/LiveFeedItem';
import { useBrand } from '../context/BrandContext';
import SectionTitle from '../components/ui/SectionTitle';
import useLiveComments from '../hooks/useLiveComments';

function LiveFeed() {
  const { brand, setBrand } = useBrand();
  const { comments, loading } = useLiveComments(brand);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden pt-2">
      <div className="flex flex-col gap-4 px-3 md:flex-row md:items-end md:justify-between">
        <SectionTitle eyebrow="Realtime stream" title="Live conversation feed" />
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

      <div className="flex-1 overflow-y-auto pl-3 pr-4 py-3">
        <div className="space-y-4 pb-4">
          {loading ? (
            <p className="text-sm text-slate-300">Loading live comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-300">No live comments found for this brand.</p>
          ) : (
            comments.map((item, index) => (
              <LiveFeedItem key={item.id} item={item} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveFeed;
