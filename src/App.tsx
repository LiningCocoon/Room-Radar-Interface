import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import AlternativeView from './components/AlternativeView';
import SimplifiedView from './components/SimplifiedView';
import PastMeetingsView from './components/PastMeetingsView';
import { ThemeProvider } from './components/ThemeContext';
// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}
// Mobile redirect component
const MobileRedirect = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  useEffect(() => {
    if (isMobile) {
      navigate('/alternative', {
        replace: true
      });
    }
  }, [isMobile, navigate]);
  return null;
};
export function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isMobile = useIsMobile();
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <ThemeProvider>
      <Router>
        <div className="flex flex-col w-full min-h-screen bg-white dark:bg-gray-900 dark:text-white">
          <Header currentTime={currentTime} />
          <MobileRedirect />
          <Routes>
            {/* Redirect from root to the appropriate view based on device */}
            <Route path="/" element={<Navigate to={isMobile ? '/alternative' : '/simplified'} replace />} />
            <Route path="/simplified" element={<SimplifiedView currentTime={currentTime} />} />
            <Route path="/alternative" element={<AlternativeView currentTime={currentTime} />} />
            <Route path="/past-meetings" element={<PastMeetingsView currentTime={currentTime} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>;
}