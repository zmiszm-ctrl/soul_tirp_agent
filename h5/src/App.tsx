import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from '@/pages/HomePage';
import SelectPage from '@/pages/SelectPage';
import LoadingPage from '@/pages/LoadingPage';
import InvitationPage from '@/pages/InvitationPage';
import DetailPage from '@/pages/DetailPage';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';

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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/select"
          element={
            <PageTransition>
              <SelectPage />
            </PageTransition>
          }
        />
        <Route
          path="/loading"
          element={
            <PageTransition>
              <LoadingPage />
            </PageTransition>
          }
        />
        <Route
          path="/invitation"
          element={
            <PageTransition>
              <InvitationPage />
            </PageTransition>
          }
        />
        <Route
          path="/detail"
          element={
            <PageTransition>
              <DetailPage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/profile"
          element={
            <PageTransition>
              <ProfilePage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App
