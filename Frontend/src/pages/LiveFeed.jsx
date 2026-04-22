import LiveFeedItem from '../components/feed/LiveFeedItem';
import SectionTitle from '../components/ui/SectionTitle';
import useMockData from '../hooks/useMockData';

function LiveFeed() {
  const { liveFeed } = useMockData();

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden pt-2">
      <SectionTitle eyebrow="Realtime stream" title="Live conversation feed" />

      <div className="flex-1 overflow-y-auto pl-3 pr-4 py-3">
        <div className="space-y-4 pb-4">
          {liveFeed.map((item, index) => (
            <LiveFeedItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LiveFeed;