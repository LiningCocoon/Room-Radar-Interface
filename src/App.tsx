import React, { useEffect, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import Header from './components/Header';
import MeetingGrid from './components/MeetingGrid';
export function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <div className="flex flex-col w-full min-h-screen bg-white">
      <Header currentTime={currentTime} />
      <MeetingGrid currentTime={currentTime} />
    </div>;
}