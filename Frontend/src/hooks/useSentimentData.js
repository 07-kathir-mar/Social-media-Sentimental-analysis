import { useEffect, useState } from 'react';
import {
  aggregateSentiment,
  getSentimentGraph,
  processComments,
} from '../services/api';

function formatGraphPoint(item, index) {
  const rawTimestamp = item.timestamp ?? item.time;
  const rawScore = item.normalized_score ?? item.score;
  const timestamp = new Date(rawTimestamp);

  return {
    index,
    timestamp: rawTimestamp,
    time: timestamp.toLocaleString(),
    shortLabel: timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      hour12: true,
    }),
    score: Math.round((Number(rawScore) + 1) * 50),
    explanation: item.explanation || '',
    topics: [],
  };
}

function useSentimentData(brand = 'Nike') {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function refreshData() {
    setLoading(true);
    setError(null);

    try {
      await processComments(brand);
      await aggregateSentiment(brand);
      const response = await getSentimentGraph(brand);
      console.log('API response:', response);

      const nextGraphData = Array.isArray(response.data)
        ? response.data.map(formatGraphPoint)
        : [];
      console.log('Formatted graphData:', nextGraphData);

      setGraphData(nextGraphData);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load sentiment data.');
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSentimentData() {
      await refreshData();

      if (!isMounted) {
        return;
      }
    }

    loadSentimentData();

    return () => {
      isMounted = false;
    };
  }, [brand]);

  useEffect(() => {
    function handleRefresh() {
      refreshData();
    }

    window.addEventListener('refresh-sentiment', handleRefresh);

    return () => {
      window.removeEventListener('refresh-sentiment', handleRefresh);
    };
  }, [brand]);

  return {
    graphData,
    loading,
    error,
    refreshData,
  };
}

export default useSentimentData;
