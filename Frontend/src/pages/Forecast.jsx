import { useEffect, useMemo, useState } from 'react';
import ForecastChart from '../components/charts/ForecastChart';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import SectionTitle from '../components/ui/SectionTitle';
import useMockData from '../hooks/useMockData';

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

function ExplanationPanel({ point, title }) {
  if (!point) {
    return null;
  }

  return (
    <GlassCard hover={false} className="bg-white/[0.045]">
      <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">{title}</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{point.headline}</h3>
      <p className="mt-3 text-sm text-orange-100/80">
        {point.fullDate} | {point.sentiment} | Driver: {point.driver}
      </p>
      <p className="mt-4 text-sm leading-7 text-slate-300">{point.summary}</p>
      <div className="mt-6 rounded-[24px] border border-orange-300/20 bg-orange-300/10 p-4 text-sm text-orange-100">
        Projected delta: {point.delta}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {point.topics?.map((topic) => (
          <div key={`${point.id}-${topic.topic}`} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">{topic.topic}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-orange-200/70">
              {topic.sentiment} | {topic.impact}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{topic.summary}</p>
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
  const { forecastPredictions, simulateScenario } = useMockData();
  const [activeTab, setActiveTab] = useState('prediction');
  const [scenario, setScenario] = useState('');
  const [hasRunSimulation, setHasRunSimulation] = useState(false);

  const simulation = useMemo(
    () => simulateScenario(scenario || 'baseline forecast scenario'),
    [scenario, simulateScenario],
  );

  const [selectedPredictionDay, setSelectedPredictionDay] = useState(forecastPredictions[0] || null);
  const [selectedSimulationDay, setSelectedSimulationDay] = useState(simulation.impact[0] || null);

  useEffect(() => {
    setSelectedPredictionDay(forecastPredictions[0] || null);
  }, [forecastPredictions]);

  useEffect(() => {
    setSelectedSimulationDay(simulation.impact[0] || null);
  }, [simulation]);

  const showRunSimulation = scenario.trim().length > 0;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-6 overflow-hidden pt-2">
      <SectionTitle
        eyebrow="Forecast"
        title="Monthly forecast"
        description="Use the tabs to switch between the future prediction view and the what-if simulation flow."
      />

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
                <ForecastChart
                  data={forecastPredictions}
                  selectedDay={selectedPredictionDay}
                  onSelectDay={setSelectedPredictionDay}
                />
                <div className="mt-5">
                  <DaySelector
                    data={forecastPredictions}
                    selectedDay={selectedPredictionDay}
                    onSelectDay={setSelectedPredictionDay}
                  />
                </div>
              </GlassCard>
              <ExplanationPanel point={selectedPredictionDay} title="Prediction explanation" />
            </>
          ) : (
            <>
              <GlassCard hover={false} className="relative z-0 bg-white/[0.045]">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">What-if condition</p>
                <h3 className="mt-4 text-2xl font-semibold text-white">Enter the simulation description</h3>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                  Add the scenario first. After filling the description, the run simulation button will appear.
                </p>
                <textarea
                  rows="6"
                  value={scenario}
                  onChange={(event) => {
                    setScenario(event.target.value);
                    setHasRunSimulation(false);
                  }}
                  className="mt-6 w-full rounded-[28px] border border-white/10 bg-black/30 px-5 py-5 text-sm leading-7 text-white outline-none transition duration-300 focus:border-orange-300/40"
                  placeholder="Describe the what-if condition..."
                />

                {showRunSimulation ? (
                  <div className="mt-6 flex justify-end">
                    <GradientButton className="min-w-[220px]" onClick={() => setHasRunSimulation(true)}>
                      Run simulation
                    </GradientButton>
                  </div>
                ) : null}
              </GlassCard>

              {hasRunSimulation ? (
                <>
                  <GlassCard hover={false} className="relative z-0">
                    <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">Scenario summary</p>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{scenario}</p>
                    <div className="mt-4 rounded-[24px] border border-orange-300/20 bg-orange-300/10 p-4 text-sm text-orange-100">
                      Overall scenario impact: {simulation.delta}
                    </div>
                  </GlassCard>

                  <GlassCard hover={false} className="relative z-0 overflow-hidden">
                    <ForecastChart
                      data={simulation.impact}
                      selectedDay={selectedSimulationDay}
                      onSelectDay={setSelectedSimulationDay}
                    />
                    <div className="mt-5">
                      <DaySelector
                        data={simulation.impact}
                        selectedDay={selectedSimulationDay}
                        onSelectDay={setSelectedSimulationDay}
                      />
                    </div>
                  </GlassCard>
                  <ExplanationPanel point={selectedSimulationDay} title="Simulation explanation" />
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Forecast;
