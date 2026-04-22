const topicLibrary = [
  {
    name: 'Delivery',
    positive: 'On-time arrivals and clearer ETAs improved confidence in the buying experience.',
    neutral: 'Delivery conversations stayed mixed, with buyers mainly asking for clearer status updates.',
    negative: 'Late delivery reports and weak tracking visibility pushed frustration higher in the period.',
  },
  {
    name: 'Packaging',
    positive: 'Packaging quality felt premium and carefully protected, which lifted unboxing sentiment.',
    neutral: 'Packaging drew light discussion with no strong emotional swing.',
    negative: 'Damaged outer boxes and poor presentation reduced premium perception.',
  },
  {
    name: 'Product Quality',
    positive: 'Users praised build quality, consistency, and day-to-day reliability.',
    neutral: 'Product quality mentions stayed balanced, with people comparing expectations to reality.',
    negative: 'Performance inconsistencies and quality complaints created trust friction.',
  },
  {
    name: 'Support',
    positive: 'Fast support replies and helpful follow-ups reassured uncertain buyers.',
    neutral: 'Support discussion focused on process and wait times without a strong emotional shift.',
    negative: 'Slow answers and unresolved cases raised concern across threads.',
  },
  {
    name: 'Pricing',
    positive: 'The value-for-money discussion improved as people compared features against competitors.',
    neutral: 'Pricing stayed in debate mode, with audiences split on whether it was fair.',
    negative: 'Price sensitivity increased and users questioned whether the offer justified the cost.',
  },
  {
    name: 'Shipment Timing',
    positive: 'Faster-than-expected shipment timing helped calm earlier anxiety.',
    neutral: 'Shipment timing stayed mostly informational, with users checking status and dispatch windows.',
    negative: 'Shipment timing delays directly dragged sentiment down in this window.',
  },
  {
    name: 'Creator Reviews',
    positive: 'Creator coverage brought clearer product context and lifted recommendation intent.',
    neutral: 'Creator reactions were visible but not strong enough to move opinion sharply.',
    negative: 'Mixed creator takes amplified uncertainty rather than confidence.',
  },
  {
    name: 'Feature Set',
    positive: 'Specific feature wins gave audiences more reasons to switch or upgrade.',
    neutral: 'Feature discussion centered on comparisons and trade-offs rather than excitement.',
    negative: 'Missing features became a repeated complaint and hurt perceived completeness.',
  },
];

function getTone(score) {
  if (score >= 68) return 'Positive';
  if (score <= 46) return 'Negative';
  return 'Neutral';
}

function buildTopicSummary(topic, score, offset) {
  const tone = getTone(score);
  const summary =
    tone === 'Positive' ? topic.positive : tone === 'Negative' ? topic.negative : topic.neutral;

  return {
    topic: topic.name,
    sentiment: tone,
    summary,
    impact:
      tone === 'Positive'
        ? `+${6 + (offset % 4)} pts`
        : tone === 'Negative'
          ? `-${5 + (offset % 4)} pts`
          : `${offset % 2 === 0 ? '+' : '-'}1 pt`,
  };
}

function generateSentimentYearTimeline() {
  const start = new Date('2026-01-01T00:00:00');
  const data = [];

  for (let index = 0; index < 730; index += 1) {
    const timestamp = new Date(start.getTime() + index * 12 * 60 * 60 * 1000);
    const seasonal = Math.sin(index / 19) * 11;
    const cycle = Math.cos(index / 7) * 6;
    const drift = Math.sin(index / 53) * 4;
    const rawScore = 58 + seasonal + cycle + drift;
    const score = Math.max(28, Math.min(88, Math.round(rawScore)));
    const rangeStart = timestamp.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', hour12: true });
    const rangeEnd = new Date(timestamp.getTime() + 12 * 60 * 60 * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      hour12: true,
    });
    const monthLabel = timestamp.toLocaleString('en-US', { month: 'short' });
    const periodLabel = `${rangeStart} - ${rangeEnd}`;

    const primaryTopic = topicLibrary[index % topicLibrary.length];
    const secondaryTopic = topicLibrary[(index + 3) % topicLibrary.length];
    const tertiaryTopic = topicLibrary[(index + 5) % topicLibrary.length];

    data.push({
      index,
      time: periodLabel,
      shortLabel: `${monthLabel} ${timestamp.getDate()} ${timestamp.getHours() === 0 ? 'AM' : 'PM'}`,
      monthLabel,
      score,
      timestamp: timestamp.toISOString(),
      explanation:
        score >= 68
          ? 'This 12-hour window leaned positive because praise clusters outweighed complaints across major discussion themes.'
          : score <= 46
            ? 'This 12-hour window turned softer because operational concerns and unmet expectations were mentioned more often.'
            : 'This 12-hour window stayed balanced, with positive reactions and concerns nearly offsetting each other.',
      topics: [
        buildTopicSummary(primaryTopic, score, index),
        buildTopicSummary(secondaryTopic, score + ((index % 3) - 1) * 6, index + 1),
        buildTopicSummary(tertiaryTopic, score + ((index % 5) - 2) * 4, index + 2),
      ],
    });
  }

  return data;
}

export const dashboardSummary = [
  { label: 'Total posts', value: '18.4K', change: '+12.6%', tone: 'positive' },
  { label: 'Positive', value: '64%', change: '+4.2%', tone: 'positive' },
  { label: 'Negative', value: '18%', change: '-2.1%', tone: 'negative' },
  { label: 'Neutral', value: '18%', change: '+0.8%', tone: 'neutral' },
];

export const sentimentTimeline = [
  {
    time: '08:00',
    score: 58,
    explanation: 'Morning chatter opens cautiously positive as early reviews highlight reliability.',
    driver: 'Review creators',
  },
  {
    time: '09:00',
    score: 62,
    explanation: 'Support team response times improve and positive thread replies accelerate.',
    driver: 'Support interactions',
  },
  {
    time: '10:00',
    score: 67,
    explanation: 'Feature demo clips spread on YouTube Shorts, lifting excitement and saves.',
    driver: 'Short-form demos',
  },
  {
    time: '11:00',
    score: 71,
    explanation: 'Reddit comments reinforce product quality with detailed ownership stories.',
    driver: 'Community advocacy',
  },
  {
    time: '12:00',
    score: 76,
    explanation: 'Midday sentiment peaks after influencer mentions trigger a burst of optimistic discussion.',
    driver: 'Influencer amplification',
  },
  {
    time: '13:00',
    score: 69,
    explanation: 'A delayed shipping thread creates friction and temporarily raises negative keywords.',
    driver: 'Logistics complaints',
  },
  {
    time: '14:00',
    score: 73,
    explanation: 'Brand replies and FAQs soften the complaint cycle and stabilize tone.',
    driver: 'Rapid response',
  },
  {
    time: '15:00',
    score: 79,
    explanation: 'Comparison posts lean in favor of the brand because of perceived value and design.',
    driver: 'Competitive comparisons',
  },
];

export const sentimentYearTimeline = generateSentimentYearTimeline();

export const thoughtSentimentZones = [
  {
    id: 1,
    range: '2000 - 2003',
    sentiment: 'Low confidence period',
    summary: 'The brand launched with inconsistent product quality and weak delivery execution, so audience trust remained fragile for the first three years.',
    drivers: ['Early quality complaints', 'Delivery misses', 'Unclear product-market fit'],
  },
  {
    id: 2,
    range: '2004 - 2010',
    sentiment: 'Growth and strong approval',
    summary: 'Operational stability and stronger product quality turned discussion more positive, creating a long positive zone across multiple years.',
    drivers: ['Better packaging', 'Reliable performance', 'Positive word of mouth'],
  },
  {
    id: 3,
    range: '2011 - 2013',
    sentiment: 'Leadership disruption',
    summary: 'A leadership change and product positioning drift reduced confidence, pushing sentiment back into a negative multi-year phase.',
    drivers: ['Strategy confusion', 'Support slowdown', 'Feature dissatisfaction'],
  },
  {
    id: 4,
    range: '2014 - 2018',
    sentiment: 'Recovery and trust rebuild',
    summary: 'Customer support, product consistency, and clearer market communication helped the brand regain trust over a longer recovery arc.',
    drivers: ['Support improvements', 'Stronger reviews', 'Improved shipment timing'],
  },
  {
    id: 5,
    range: '2019 - 2022',
    sentiment: 'Stable but debated',
    summary: 'The brand held a mostly balanced reputation, with strong quality perception but recurring pricing and delivery debates.',
    drivers: ['Pricing pressure', 'Competitive comparisons', 'Mixed creator reactions'],
  },
  {
    id: 6,
    range: '2023 - 2026',
    sentiment: 'Renewed momentum',
    summary: 'Recent years show stronger advocacy again as product quality, creator validation, and support responsiveness lift overall sentiment.',
    drivers: ['Creator amplification', 'High product confidence', 'Faster support response'],
  },
];

export const liveFeed = [
  {
    id: 1,
    platform: 'Reddit',
    sentiment: 'Positive',
    likes: 1640,
    timestamp: '2026-04-11T13:55:00',
    comment:
      'I expected the launch to be overhyped, but the product actually feels polished and the support replies are surprisingly fast.',
  },
  {
    id: 2,
    platform: 'YouTube',
    sentiment: 'Positive',
    likes: 4200,
    timestamp: '2026-04-11T13:43:00',
    comment:
      'This hands-on review convinced me. The design is clean, the performance is stable, and the update roadmap sounds strong.',
  },
  {
    id: 3,
    platform: 'X',
    sentiment: 'Negative',
    likes: 890,
    timestamp: '2026-04-11T13:32:00',
    comment:
      'Love the product, but shipping delays are hurting the experience. If they fix logistics, sentiment will flip fast.',
  },
  {
    id: 4,
    platform: 'TikTok',
    sentiment: 'Neutral',
    likes: 2300,
    timestamp: '2026-04-11T13:18:00',
    comment:
      'People are debating whether the new features are enough to justify switching, but the visuals are definitely catching attention.',
  },
  {
    id: 5,
    platform: 'Reddit',
    sentiment: 'Positive',
    likes: 1180,
    timestamp: '2026-04-11T12:59:00',
    comment:
      'The customer support follow-up in the main thread was excellent. That one response changed the whole vibe of the discussion.',
  },
  {
    id: 6,
    platform: 'YouTube',
    sentiment: 'Negative',
    likes: 760,
    timestamp: '2026-04-11T12:41:00',
    comment:
      'Strong product, but the messaging is unclear. The launch trailer looked premium, yet the key differentiators still feel buried.',
  },
];

export const alerts = {
  current: [
    {
      id: 1,
      level: 'Critical',
      title: 'Shipping delay conversation is accelerating',
      description:
        'Negative mention velocity increased 28% in the last hour, concentrated in Reddit shipping threads and quote-posts on X.',
      timestamp: '5 mins ago',
      tags: ['Logistics', 'Reddit', 'High velocity'],
    },
    {
      id: 2,
      level: 'High',
      title: 'Creator review cluster going viral',
      description:
        'Positive reaction volume from YouTube creators is pulling broad awareness and driving stronger click-through momentum.',
      timestamp: '14 mins ago',
      tags: ['YouTube', 'Creators', 'Growth'],
    },
  ],
  viral: [
    {
      title: 'Hands-on review with 420K views',
      platform: 'YouTube',
      impact: 'Positive',
    },
    {
      title: 'Support reply screenshot gaining traction',
      platform: 'Reddit',
      impact: 'Positive',
    },
    {
      title: 'Shipping frustration thread resurfaces',
      platform: 'X',
      impact: 'Negative',
    },
  ],
  history: [
    {
      id: 3,
      level: 'Medium',
      title: 'Feature comparison thread cooled down',
      description: 'Negative intensity dropped after specs clarification from the brand team.',
      timestamp: '09:30',
      tags: ['Resolved', 'Comparison'],
    },
    {
      id: 4,
      level: 'Medium',
      title: 'Neutral mention spike from announcement recap',
      description: 'Long-form summary posts created visibility without strong emotional polarity.',
      timestamp: '08:45',
      tags: ['Awareness', 'Neutral'],
    },
    {
      id: 5,
      level: 'Low',
      title: 'Packaging praise trend identified',
      description: 'Visual presentation in unboxing clips lifted premium perception across creator audiences.',
      timestamp: '07:20',
      tags: ['Positive', 'TikTok'],
    },
  ],
};

export const sentimentZones = [
  {
    id: 1,
    range: '08:00 - 10:30',
    sentiment: 'Curious optimism',
    explanation: 'Audiences react positively to first impressions, focusing on perceived quality and launch polish.',
  },
  {
    id: 2,
    range: '10:30 - 12:30',
    sentiment: 'Peak advocacy',
    explanation: 'Creators and existing customers reinforce trust, pushing recommendation-heavy conversation.',
  },
  {
    id: 3,
    range: '12:30 - 14:00',
    sentiment: 'Operational friction',
    explanation: 'Shipping and fulfillment concerns produce a tighter cluster of complaint-led posts.',
  },
  {
    id: 4,
    range: '14:00 - 15:00',
    sentiment: 'Rebound confidence',
    explanation: 'Fast brand clarification shifts the narrative back to product value and responsiveness.',
  },
];

export const forecastPredictions = Array.from({ length: 30 }, (_, index) => {
  const timestamp = new Date(`2026-05-${String(index + 1).padStart(2, '0')}T00:00:00`);
  const wave = Math.sin(index / 3.1) * 6;
  const trend = index * 0.55;
  const correction = Math.cos(index / 5.2) * 3;
  const prediction = Math.max(52, Math.min(96, Math.round(68 + wave + trend + correction)));
  const tone = getTone(prediction);
  const shortDay = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekday = timestamp.toLocaleDateString('en-US', { weekday: 'short' });
  const primaryTopic = topicLibrary[index % topicLibrary.length];
  const secondaryTopic = topicLibrary[(index + 2) % topicLibrary.length];

  return {
    id: `forecast-${index + 1}`,
    day: shortDay,
    shortDay,
    weekday,
    fullDate: timestamp.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    prediction,
    sentiment: tone,
    driver: primaryTopic.name,
    headline:
      tone === 'Positive'
        ? `${primaryTopic.name} is expected to support stronger advocacy on ${shortDay}.`
        : tone === 'Negative'
          ? `${primaryTopic.name} may create pressure on perception by ${shortDay}.`
          : `${primaryTopic.name} is likely to keep conversation balanced on ${shortDay}.`,
    summary:
      tone === 'Positive'
        ? `${primaryTopic.positive} Creator and community discussion are likely to amplify the gain into the following cycle.`
        : tone === 'Negative'
          ? `${primaryTopic.negative} Without intervention, the softer tone may spill into the next few days.`
          : `${primaryTopic.neutral} The model expects small swings, but no major polarity break on that day.`,
    delta:
      tone === 'Positive'
        ? `+${4 + (index % 4)} pts vs monthly baseline`
        : tone === 'Negative'
          ? `-${3 + (index % 3)} pts vs monthly baseline`
          : `${index % 2 === 0 ? '+' : '-'}1 pt vs monthly baseline`,
    topics: [
      buildTopicSummary(primaryTopic, prediction, index),
      buildTopicSummary(secondaryTopic, prediction + ((index % 3) - 1) * 4, index + 1),
    ],
  };
});

export const brandComparisonBase = {
  primary: {
    brand: 'Signal Scope Brand',
    positive: 64,
    negative: 18,
    neutral: 18,
  },
};
