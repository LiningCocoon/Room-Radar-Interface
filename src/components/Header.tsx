import React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
interface HeaderProps {
  currentTime: Date;
}
const Header: React.FC<HeaderProps> = ({
  currentTime
}) => {
  const location = useLocation();
  const isAlternativeView = location.pathname === '/alternative';
  const {
    isDarkMode,
    toggleDarkMode
  } = useTheme();
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  // Room headers
  const rooms = ['FDR', 'Executive', 'Breakout 1', 'Breakout 2'];
  return <div className="w-full sticky top-0 z-[10000]">
      <div className="bg-[#1a2235] dark:bg-gray-800 text-white p-3">
        {/* Desktop layout */}
        <div className="hidden sm:flex sm:flex-row sm:items-center relative">
          <div className="text-3xl font-bold">{formattedTime}</div>
          <div className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
            {formattedDate}
          </div>
          <div className="absolute right-3 flex items-center">
            <button onClick={toggleDarkMode} className="p-1 rounded-full hover:bg-[#004b81] dark:hover:bg-gray-700 transition-colors mr-2" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-300" /> : <MoonIcon className="h-6 w-6 text-white" />}
            </button>
            <h1 className="text-xl font-bold text-white">ROOM RADAR</h1>
          </div>
        </div>
        {/* Mobile layout - precisely matching the attached image */}
        <div className="sm:hidden flex flex-col relative pb-2">
          {/* ROOM RADAR title */}
          <h1 className="text-5xl font-bold text-white mb-2">ROOM RADAR</h1>
          {/* Date below title */}
          <div className="text-2xl font-normal text-white">{formattedDate}</div>
          {/* Custom sun icon in bottom right */}
          <div className="absolute bottom-1 right-1">
            <button onClick={toggleDarkMode} className="flex items-center justify-center rounded-full p-1" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDarkMode ? <div className="w-10 h-10 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-yellow-300 rounded-full"></div>
                    <div className="absolute inset-0">
                      {/* Sun rays */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-yellow-300"></div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1 h-3 bg-yellow-300"></div>
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 h-1 w-3 bg-yellow-300"></div>
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 h-1 w-3 bg-yellow-300"></div>
                      {/* Diagonal rays */}
                      <div className="absolute top-1 left-1 transform -translate-x-1/2 -translate-y-1/2 w-1 h-2 bg-yellow-300 rotate-45"></div>
                      <div className="absolute top-1 right-1 transform translate-x-1/2 -translate-y-1/2 w-1 h-2 bg-yellow-300 -rotate-45"></div>
                      <div className="absolute bottom-1 left-1 transform -translate-x-1/2 translate-y-1/2 w-1 h-2 bg-yellow-300 -rotate-45"></div>
                      <div className="absolute bottom-1 right-1 transform translate-x-1/2 translate-y-1/2 w-1 h-2 bg-yellow-300 rotate-45"></div>
                    </div>
                  </div>
                </div> : <MoonIcon className="h-8 w-8 text-white" />}
            </button>
          </div>
        </div>
      </div>
      {/* Only render room headers when NOT on the alternative view */}
      {!isAlternativeView && <div className="border-b border-gray-300 px-3 bg-white dark:bg-gray-900 dark:border-gray-700" data-id="element-61" style={{
      margin: '0px',
      height: '0px',
      overflow: 'hidden',
      padding: '0px'
    }}></div>}
    </div>;
};
export default Header;