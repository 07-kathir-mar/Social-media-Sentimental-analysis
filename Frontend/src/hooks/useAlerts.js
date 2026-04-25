import { useEffect, useState } from 'react';
import { getAlerts } from '../services/api';

function useAlerts(brand) {
  const [alerts, setAlerts] = useState({ current: [], history: [] });
  const [loading, setLoading] = useState(true);

  async function fetchAlerts() {
    try {
      const response = await getAlerts(brand);
      setAlerts({
        current: Array.isArray(response?.current) ? response.current : [],
        history: Array.isArray(response?.history) ? response.history : [],
      });
    } catch {
      setAlerts({ current: [], history: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [brand]);

  return {
    alerts,
    loading,
  };
}

export default useAlerts;
