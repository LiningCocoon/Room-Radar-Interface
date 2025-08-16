import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import AlternativeView from './components/AlternativeView';
import SimplifiedView from './components/SimplifiedView';
import PastMeetingsView from './components/PastMeetingsView';
import ProportionalMeetingView from './components/ProportionalMeetingView';
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
// Conditional Header component that doesn't show on SimplifiedView
const ConditionalHeader = ({
  currentTime,
  isYesterday,
  onToggleDay
}) => {
  const location = useLocation();
  // Don't render the header on the simplified view
  if (location.pathname === '/simplified') {
    return null;
  }
  return <Header currentTime={currentTime} isYesterday={isYesterday} onToggleDay={onToggleDay} />;
};
export function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isYesterday, setIsYesterday] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const toggleDay = () => {
    setIsYesterday(!isYesterday);
  };
  return <ThemeProvider>
      <Router>
        <div className="flex flex-col w-full min-h-screen bg-white dark:bg-gray-900 dark:text-white">
          <ConditionalHeader currentTime={currentTime} isYesterday={isYesterday} onToggleDay={toggleDay} />
          <MobileRedirect />
          <Routes>
            {/* Redirect from root to the appropriate view based on device */}
            <Route path="/" element={<Navigate to={isMobile ? '/alternative' : '/simplified'} replace />} />
            <Route path="/simplified" element={<SimplifiedView currentTime={currentTime} isYesterday={isYesterday} />} />
            <Route path="/proportional" element={<ProportionalMeetingView currentTime={currentTime} isYesterday={isYesterday} />} />
            <Route path="/alternative" element={<AlternativeView currentTime={currentTime} isYesterday={isYesterday} />} />
            <Route path="/past-meetings" element={<PastMeetingsView currentTime={currentTime} isYesterday={isYesterday} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>;
}