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
      <div className="bg-[#1a2235] dark:bg-gray-800 text-white py-3 px-5 relative">
        {/* Desktop layout */}
        <div className="hidden sm:flex sm:flex-row sm:items-center relative">
          <div className="text-2xl font-bold">{formattedTime}</div>
          <div className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
            {formattedDate}
          </div>
          <div className="absolute right-3 flex items-center">
            <button onClick={toggleDarkMode} className="p-1 rounded-full hover:bg-[#004b81] dark:hover:bg-gray-700 transition-colors mr-2" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-300" /> : <MoonIcon className="h-6 w-6 text-white" />}
            </button>
            <h1 className="text-2xl font-bold text-white">ROOM RADAR</h1>
          </div>
        </div>
        {/* Mobile layout - with 25% smaller text */}
        <div className="sm:hidden flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              {/* ROOM RADAR title with 25% smaller text */}
              <h1 className="text-[1.65rem] font-bold text-white leading-tight">
                ROOM RADAR
              </h1>
              {/* Date with 25% smaller text */}
              <div className="text-[0.975rem] font-normal text-white mt-0">
                {formattedDate}
              </div>
            </div>
            {/* Sun/Moon icon positioned in top right - keeping the same size */}
            <button onClick={toggleDarkMode} className="p-0" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-300" /> : <MoonIcon className="h-6 w-6 text-white" />}
            </button>
          </div>
        </div>
      </div>
      {/* Only render room headers when NOT on the alternative view */}
      {!isAlternativeView && <div className="border-b border-gray-300 px-3 bg-white dark:bg-gray-900 dark:border-gray-700" data-id="element-61" style={{
      margin: '0px',
      height: '0px',
      overflow: 'hidden',
      padding: '0 0 0 0'
    }}></div>}
    </div>;
};
export default Header;