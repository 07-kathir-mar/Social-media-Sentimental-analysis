import { useCallback, useState } from 'react';
import {
  alerts,
  brandComparisonBase,
  dashboardSummary,
  forecastPredictions,
  liveFeed,
  sentimentTimeline,
  sentimentYearTimeline,
  sentimentZones,
  thoughtSentimentZones,
} from '../services/mockData';
import { summarizeRange } from '../utils/helpers';

function useMockData() {
  const [selectedPoint, setSelectedPoint] = useState(sentimentTimeline[4]);

  const compareBrand = useCallback((brandName) => {
    const normalized = brandName?.trim() || 'Competitor Brand';
    const modifier = normalized.length % 7;

    return {
      primary: brandComparisonBase.primary,
      secondary: {
        brand: normalized,
        positive: Math.max(32, 58 - modifier * 2),
        negative: Math.min(34, 19 + modifier),
        neutral: 100 - Math.max(32, 58 - modifier * 2) - Math.min(34, 19 + modifier),
      },
      insights: [
        `${normalized} earns stronger excitement in creator reviews, but weaker customer support perception.`,
        'Your brand leads on trust and product reliability in long-form discussions.',
        'Response speed and short-form amplification are the biggest gap areas.',
      ],
      suggestions: [
        'Push reactive community management during high-velocity spikes.',
        'Package positive testimonials into short video clips for broader reach.',
        `Benchmark ${normalized}'s creator partnerships and replicate the formats that drive positive volume.`,
      ],
    };
  }, []);

  const simulateScenario = useCallback((scenario) => {
    const baseLift = Math.min(18, Math.max(6, scenario.trim().length % 20));
    const impact = forecastPredictions.map((entry, index) => ({
      ...entry,
      prediction: Math.min(98, entry.prediction + Math.max(1, baseLift - index)),
      headline:
        index < 10
          ? `${entry.driver} responds quickly to the scenario and lifts outlook on ${entry.day}.`
          : `${entry.driver} keeps supporting the scenario impact through ${entry.day}.`,
      summary: `${entry.summary} Under this what-if condition, the model assumes faster recovery, steadier positive carryover, and smaller negative rebounds.`,
      delta: `+${Math.max(1, baseLift - Math.floor(index / 5))} pts scenario lift`,
    }));

    return {
      headline: 'Scenario simulation suggests a measurable uplift in sentiment resilience.',
      summary:
        'The model assumes stronger retention of positive mentions, faster decay of negative spikes, and better carryover into forecasted days.',
      impact,
      delta: `+${baseLift.toFixed(0)} pts projected peak improvement`,
    };
  }, []);

  return {
    dashboardSummary,
    liveFeed,
    sentimentTimeline,
    sentimentYearTimeline,
    thoughtSentimentZones,
    selectedPoint,
    setSelectedPoint,
    sentimentZones,
    alerts,
    forecastPredictions,
    summarizeRange,
    compareBrand,
    simulateScenario,
  };
}

export default useMockData;
