import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import SideWall from './components/AlternativeView';
import MainWall from './components/SimplifiedView';
import OpsMUI from './components/OpsMUI';
import { ThemeProvider } from './components/ThemeContext';
// Conditional Header component
const ConditionalHeader = ({
  currentTime,
  isYesterday,
  onToggleDay
}) => {
  const location = useLocation();
  if (location.pathname === '/main-wall' || location.pathname === '/ops-mui') {
    return null;
  }
  return <Header currentTime={currentTime} isYesterday={isYesterday} onToggleDay={onToggleDay} />;
};
export function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isYesterday, setIsYesterday] = useState(false);
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
          <Routes>
            <Route path="/" element={<Navigate to="/main-wall" replace />} />
            <Route path="/main-wall" element={<MainWall currentTime={currentTime} isYesterday={isYesterday} />} />
            <Route path="/side-wall" element={<SideWall currentTime={currentTime} isYesterday={isYesterday} />} />
            <Route path="/ops-mui" element={<OpsMUI currentTime={currentTime} isYesterday={isYesterday} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>;
}