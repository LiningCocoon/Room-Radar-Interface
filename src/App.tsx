import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import AlternativeView from './components/AlternativeView';
import SimplifiedView from './components/SimplifiedView';
import PastMeetingsView from './components/PastMeetingsView';
import { ThemeProvider } from './components/ThemeContext';
export function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
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
          <Routes>
            {/* Redirect from root to simplified view */}
            <Route path="/" element={<Navigate to="/simplified" replace />} />
            <Route path="/simplified" element={<SimplifiedView currentTime={currentTime} />} />
            <Route path="/alternative" element={<AlternativeView currentTime={currentTime} />} />
            <Route path="/past-meetings" element={<PastMeetingsView currentTime={currentTime} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>;
}