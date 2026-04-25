import { useEffect, useState } from 'react';
import { getForecast, getForecastSimulation } from '../services/api';

function normalizeGraph(graph = []) {
  return graph.map((entry, index) => ({
    id: entry.id || `forecast-${index + 1}`,
    day: entry.day || new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate:
      entry.fullDate ||
      new Date(entry.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    prediction: Number(entry.score) || 0,
  }));
}

function useForecast(brand) {
  const [forecast, setForecast] = useState({ graph: [], explanation: { title: '', summary: '', drivers: [] } });
  const [simulation, setSimulation] = useState({ graph: [], explanation: { title: '', summary: '', drivers: [] } });
  const [loading, setLoading] = useState(true);
  const [simulationLoading, setSimulationLoading] = useState(false);

  useEffect(() => {
    if (!brand) return;

    let cancelled = false;

    async function fetchForecast() {
      setLoading(true);
      try {
        const response = await getForecast(brand);
        if (!cancelled) {
          setForecast({
            graph: normalizeGraph(response?.graph),
            explanation: response?.explanation || { title: '', summary: '', drivers: [] },
          });
        }
      } catch {
        if (!cancelled) {
          setForecast({
            graph: [],
            explanation: { title: 'Forecast unavailable', summary: 'Unable to load forecast data.', drivers: [] },
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSimulation({ graph: [], explanation: { title: '', summary: '', drivers: [] } });
        }
      }
    }

    fetchForecast();

    return () => {
      cancelled = true;
    };
  }, [brand]);

  async function runSimulation(scenario) {
    setSimulationLoading(true);
    try {
      const response = await getForecastSimulation(brand, scenario);
      setSimulation({
        graph: normalizeGraph(response?.graph),
        explanation: response?.explanation || { title: '', summary: '', drivers: [] },
      });
    } catch {
      setSimulation({
        graph: [],
        explanation: { title: 'Simulation unavailable', summary: 'Unable to run forecast simulation.', drivers: [] },
      });
    } finally {
      setSimulationLoading(false);
    }
  }

  return {
    forecast,
    simulation,
    loading,
    simulationLoading,
    runSimulation,
  };
}

export default useForecast;
