import { useEffect, useState } from 'react';
import { getThoughts } from '../services/api';

function useThoughts(brand) {
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchThoughts() {
    try {
      const response = await getThoughts(brand);
      setThoughts(Array.isArray(response) ? response : []);
    } catch {
      setThoughts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchThoughts();

    const interval = setInterval(fetchThoughts, 5000);
    return () => clearInterval(interval);
  }, [brand]);

  return {
    thoughts,
    loading,
  };
}

export default useThoughts;
