import { useEffect, useState } from 'react';
import ForecastChart from '../components/charts/ForecastChart';
import { useBrand } from '../context/BrandContext';
import useForecast from '../hooks/useForecast';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import SectionTitle from '../components/ui/SectionTitle';

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-300 ${
        active
          ? 'bg-brand-gradient text-slate-950 shadow-lg shadow-orange-500/20'
          : 'border border-white/10 bg-white/5 text-slate-300 hover:border-orange-300/30 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function ExplanationPanel({ explanation, selectedDay, title }) {
  if (!explanation?.title) {
    return null;
  }

  return (
    <GlassCard hover={false} className="bg-white/[0.045]">
      <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">{title}</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{explanation.title}</h3>
      {selectedDay ? (
        <p className="mt-3 text-sm text-orange-100/80">
          Selected day: {selectedDay.fullDate} | Score: {selectedDay.prediction}
        </p>
      ) : null}
      <p className="mt-4 text-sm leading-7 text-slate-300">{explanation.summary}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {explanation.drivers?.map((driver) => (
          <div key={driver.name} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">{driver.name}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-orange-200/70">{driver.impact}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{driver.desc}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function DaySelector({ data, selectedDay, onSelectDay }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-2">
        {data.map((entry) => {
          const active = entry.id === selectedDay?.id;

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelectDay(entry)}
              className={`rounded-full px-4 py-2 text-sm transition duration-300 ${
                active
                  ? 'bg-brand-gradient font-semibold text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:border-orange-300/30 hover:text-white'
              }`}
            >
              {entry.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Forecast() {
  const { brand, setBrand } = useBrand();
  const { forecast, simulation, loading, simulationLoading, runSimulation } = useForecast(brand);
  const [activeTab, setActiveTab] = useState('prediction');
  const [scenario, setScenario] = useState('delivery_improved');
  const [selectedPredictionDay, setSelectedPredictionDay] = useState(null);
  const [selectedSimulationDay, setSelectedSimulationDay] = useState(null);

  useEffect(() => {
    setSelectedPredictionDay(forecast.graph[0] || null);
  }, [forecast]);

  useEffect(() => {
    setSelectedSimulationDay(simulation.graph[0] || null);
  }, [simulation]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-6 overflow-hidden pt-2">
      <div className="flex flex-col gap-4 px-2 md:flex-row md:items-end md:justify-between">
        <SectionTitle
          eyebrow="Forecast"
          title="Monthly forecast"
          description="Use prediction and what-if views to project the next 14 days from sentiment_12h data."
        />
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Brand</span>
          <select
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
          >
            <option value="Nike" className="bg-slate-950">Nike</option>
            <option value="Adidas" className="bg-slate-950">Adidas</option>
          </select>
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto px-2 py-3 pr-3">
        <div className="space-y-6 pb-4">
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-[24px] bg-app/90 py-2 backdrop-blur-sm">
            <TabButton active={activeTab === 'prediction'} onClick={() => setActiveTab('prediction')}>
              Prediction
            </TabButton>
            <TabButton active={activeTab === 'what-if'} onClick={() => setActiveTab('what-if')}>
              What If
            </TabButton>
          </div>

          {activeTab === 'prediction' ? (
            <>
              <GlassCard hover={false} className="relative z-0 overflow-hidden">
                {loading ? (
                  <p className="text-sm text-slate-300">Loading forecast...</p>
                ) : forecast.graph.length === 0 ? (
                  <p className="text-sm text-slate-300">No forecast data available for this brand.</p>
                ) : (
                  <>
                    <ForecastChart
                      data={forecast.graph}
                      selectedDay={selectedPredictionDay}
                      onSelectDay={setSelectedPredictionDay}
                    />
                    <div className="mt-5">
                      <DaySelector
                        data={forecast.graph}
                        selectedDay={selectedPredictionDay}
                        onSelectDay={setSelectedPredictionDay}
                      />
                    </div>
                  </>
                )}
              </GlassCard>
              <ExplanationPanel
                explanation={forecast.explanation}
                selectedDay={selectedPredictionDay}
                title="Prediction explanation"
              />
            </>
          ) : (
            <>
              <GlassCard hover={false} className="relative z-0 bg-white/[0.045]">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">What-if condition</p>
                <h3 className="mt-4 text-2xl font-semibold text-white">Run a deterministic simulation</h3>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                  Use a scenario name such as <code>delivery_improved</code> to apply a deterministic shift and refresh the forecast line.
                </p>
                <input
                  value={scenario}
                  onChange={(event) => setScenario(event.target.value)}
                  className="mt-6 w-full rounded-[28px] border border-white/10 bg-black/30 px-5 py-4 text-sm leading-7 text-white outline-none transition duration-300 focus:border-orange-300/40"
                  placeholder="delivery_improved"
                />
                <div className="mt-6 flex justify-end">
                  <GradientButton
                    className="min-w-[220px]"
                    onClick={() => runSimulation(scenario || 'delivery_improved')}
                  >
                    {simulationLoading ? 'Running...' : 'Run simulation'}
                  </GradientButton>
                </div>
              </GlassCard>

              <GlassCard hover={false} className="relative z-0 overflow-hidden">
                {simulationLoading ? (
                  <p className="text-sm text-slate-300">Running simulation...</p>
                ) : simulation.graph.length === 0 ? (
                  <p className="text-sm text-slate-300">Run the simulation to see the updated forecast.</p>
                ) : (
                  <>
                    <ForecastChart
                      data={simulation.graph}
                      selectedDay={selectedSimulationDay}
                      onSelectDay={setSelectedSimulationDay}
                    />
                    <div className="mt-5">
                      <DaySelector
                        data={simulation.graph}
                        selectedDay={selectedSimulationDay}
                        onSelectDay={setSelectedSimulationDay}
                      />
                    </div>
                  </>
                )}
              </GlassCard>
              <ExplanationPanel
                explanation={simulation.explanation}
                selectedDay={selectedSimulationDay}
                title="Simulation explanation"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Forecast;
