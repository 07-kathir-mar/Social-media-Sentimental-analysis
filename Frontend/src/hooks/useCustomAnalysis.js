import { useEffect, useState } from 'react';
import { getCustomAnalysis } from '../services/api';

function useCustomAnalysis(brand, fromTime, toTime) {
  const [analysis, setAnalysis] = useState({
    graph: [],
    explanation: {
      summary: '',
      trend: 'stable',
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!brand || !fromTime || !toTime) {
      return;
    }

    let cancelled = false;

    async function fetchAnalysis() {
      setLoading(true);
      try {
        const data = await getCustomAnalysis(brand, fromTime, toTime);
        if (!cancelled) {
          setAnalysis({
            graph: Array.isArray(data.graph) ? data.graph : [],
            explanation: data.explanation || { summary: '', trend: 'stable' },
          });
        }
      } catch {
        if (!cancelled) {
          setAnalysis({
            graph: [],
            explanation: {
              summary: 'Unable to load analysis for the selected period.',
              trend: 'stable',
            },
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAnalysis();

    return () => {
      cancelled = true;
    };
  }, [brand, fromTime, toTime]);

  return { analysis, loading };
}

export default useCustomAnalysis;
