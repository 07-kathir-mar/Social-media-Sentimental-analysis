import { useEffect, useState } from 'react';
import { getComments } from '../services/api';

function mapComment(item, index) {
  const capturedAt = item.created_at || item.timestamp;

  return {
    id: `${capturedAt}-${index}`,
    platform: item.platform || 'twitter',
    sentiment: item.sentiment || 'Neutral',
    strength: item.strength ?? 0,
    likes: 0,
    timestamp: capturedAt,
    comment: item.text || '',
    brand: item.brand || '',
  };
}

function useLiveComments(brand = 'Nike') {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchComments() {
    setLoading(true);
    try {
      const response = await getComments(brand);
      const nextComments = Array.isArray(response)
        ? response.map(mapComment)
        : [];
      setComments(nextComments);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();

    const interval = setInterval(fetchComments, 5000);

    return () => clearInterval(interval);
  }, [brand]);

  return { comments, fetchComments, loading };
}

export default useLiveComments;
