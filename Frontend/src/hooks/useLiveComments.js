import { useEffect, useState } from 'react';
import { getComments } from '../services/api';

function mapComment(item, index) {
  const capturedAt = item.created_at || item.timestamp;
  const strength = Number(item.strength ?? 0);
  const normalizedStrength = Math.max(0, Math.abs(strength));
  const textLength = String(item.text || '').length;
  const platformBase = item.platform === 'instagram' ? 160 : item.platform === 'reddit' ? 95 : 120;
  const likes = Math.max(
    12,
    Math.round(platformBase + normalizedStrength * 28 + (textLength % 47) + index * 9),
  );

  return {
    id: `${capturedAt}-${index}`,
    platform: item.platform || 'twitter',
    sentiment: item.sentiment || 'Neutral',
    strength,
    likes,
    timestamp: capturedAt,
    comment: item.text || '',
    brand: item.brand || '',
  };
}

function useLiveComments(brand = 'Nike') {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchComments(showLoader = false) {
    if (showLoader) {
      setLoading(true);
    }
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
    fetchComments(true);
  }, [brand]);

  return { comments, fetchComments, loading };
}

export default useLiveComments;
