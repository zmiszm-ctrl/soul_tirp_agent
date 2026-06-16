import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorBoundary from '@/components/ErrorBoundary';

const HomePage = lazy(() => import('@/pages/HomePage'));
const SelectPage = lazy(() => import('@/pages/SelectPage'));
const LoadingPage = lazy(() => import('@/pages/LoadingPage'));
const InvitationPage = lazy(() => import('@/pages/InvitationPage'));
const DetailPage = lazy(() => import('@/pages/DetailPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-[100svh] bg-bg-primary flex items-center justify-center">
      <div className="w-6 h-6 rounded-full bg-text-primary/20 animate-pulse-soft" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/select" element={<PageTransition><SelectPage /></PageTransition>} />
        <Route path="/loading" element={<PageTransition><LoadingPage /></PageTransition>} />
        <Route path="/invitation" element={<PageTransition><InvitationPage /></PageTransition>} />
        <Route path="/detail" element={<PageTransition><DetailPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatedRoutes />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App
