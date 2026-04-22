import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './layout/MainLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveFeed = lazy(() => import('./pages/LiveFeed'));
const Sentiment = lazy(() => import('./pages/Sentiment'));
const PeopleThoughts = lazy(() => import('./pages/PeopleThoughts'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Forecast = lazy(() => import('./pages/Forecast'));
const Compare = lazy(() => import('./pages/Compare'));

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-app text-sm uppercase tracking-[0.3em] text-orange-200/70">
          Loading signal view
        </div>
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/live" element={<LiveFeed />} />
          <Route path="/sentiment" element={<Sentiment />} />
          <Route path="/thoughts" element={<PeopleThoughts />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/compare" element={<Compare />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
