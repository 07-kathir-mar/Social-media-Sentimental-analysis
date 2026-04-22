import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { formatCompactNumber, formatRelativeTime, sentimentBadgeClass } from '../../utils/helpers';

function LiveFeedItem({ item, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <GlassCard className="border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl" hover={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                {item.platform}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${sentimentBadgeClass(item.sentiment)}`}>
                {item.sentiment}
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-100">{item.comment}</p>
          </div>

          <div className="flex min-w-[180px] flex-row gap-6 md:flex-col md:items-end md:text-right">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Engagement</p>
              <p className="mt-1 text-lg font-semibold text-white">{formatCompactNumber(item.likes)} likes</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Captured</p>
              <p className="mt-1 text-sm text-slate-300">{formatRelativeTime(item.timestamp)}</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default LiveFeedItem;