import { useEffect, useState } from 'react';
import { getSentimentalZones } from '../services/api';

export const useZones = (brand) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!brand) return;

    async function fetchZones() {
      setLoading(true);
      try {
        const data = await getSentimentalZones(brand);
        setZones(Array.isArray(data) ? data : []);
      } catch {
        setZones([]);
      } finally {
        setLoading(false);
      }
    }

    fetchZones();
  }, [brand]);

  return { zones, loading };
};
