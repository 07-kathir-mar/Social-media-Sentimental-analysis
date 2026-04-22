import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

function MainLayout() {
  const location = useLocation();
  const isCompactPage =
    ['/live', '/sentiment', '/thoughts', '/alerts', '/compare'].includes(location.pathname) ||
    location.pathname.startsWith('/forecast');
  const showNavbar = !isCompactPage;

  return (
    <div className="h-screen overflow-hidden bg-app bg-mesh-gradient text-white">
      <div className="mx-auto grid h-full max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 lg:py-6 isolate">
        <div className="relative z-20">
          <div className="lg:fixed lg:top-6 lg:w-[280px] lg:max-h-[calc(100vh-3rem)]">
            <Sidebar />
          </div>
        </div>

        <div className={isCompactPage ? 'relative z-0 min-h-0 min-w-0 overflow-hidden' : 'relative z-0 min-h-0 min-w-0 space-y-6 overflow-y-auto pr-1'}>
          {showNavbar ? <Navbar /> : null}
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className={isCompactPage ? 'relative z-0 h-full min-w-0 overflow-hidden' : 'relative z-0 min-w-0 pb-6'}
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
