import { useState } from 'react';
import SentimentChart from '../components/charts/SentimentChart';
import GlassCard from '../components/ui/GlassCard';
import SectionTitle from '../components/ui/SectionTitle';
import useMockData from '../hooks/useMockData';

const subtleSentimentHover =
  'hover:border-white/10 hover:shadow-[0_0_0_1px_rgba(251,146,60,0.02),0_3px_8px_rgba(251,146,60,0.015),0_6px_14px_rgba(239,68,68,0.01)]';

const topicToneClasses = {
  Positive: 'border-emerald-300/15 bg-emerald-400/8 text-emerald-100',
  Neutral: 'border-white/10 bg-white/[0.03] text-slate-200',
  Negative: 'border-red-300/15 bg-red-400/8 text-red-100',
};

function Sentiment() {
  const { sentimentYearTimeline } = useMockData();
  const [selectedPoint, setSelectedPoint] = useState(sentimentYearTimeline[0]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden pt-2">
      <SectionTitle eyebrow="Sentiment graph" title="Time-based sentiment tracking" />

      <div className="flex-1 overflow-y-auto px-2 py-3 pr-3">
        <div className="space-y-5 pb-4">
          <GlassCard
            className="bg-white/[0.045] px-7 py-7"
            hoverClassName={subtleSentimentHover}
            hoverMotion={{ y: -1, scale: 1.001 }}
          >
            <SentimentChart data={sentimentYearTimeline} onPointSelect={setSelectedPoint} />
          </GlassCard>

          <GlassCard
            className="bg-gradient-to-br from-white/[0.045] via-orange-400/4 to-red-500/3 px-7 py-7"
            hoverClassName={subtleSentimentHover}
            hoverMotion={{ y: -1, scale: 1.001 }}
          >
            <p className="text-xs uppercase tracking-[0.28em] text-orange-200/70">Explanation</p>
            <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold leading-tight text-white">{selectedPoint?.time}</h3>
                <p className="max-w-3xl text-sm leading-7 text-slate-300">{selectedPoint?.explanation}</p>
              </div>
              <div className="rounded-[24px] border border-orange-300/12 bg-orange-300/8 px-4 py-3 text-sm text-orange-100">
                Average sentiment: {selectedPoint?.score}/100
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {selectedPoint?.topics?.map((topic) => (
                <div
                  key={`${selectedPoint.index}-${topic.topic}`}
                  className={`rounded-[26px] border p-5 backdrop-blur-md ${topicToneClasses[topic.sentiment]}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-lg font-semibold">{topic.topic}</h4>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-inherit">
                      {topic.sentiment}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-inherit/90">{topic.summary}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.24em] text-inherit/70">Impact {topic.impact}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Sentiment;
