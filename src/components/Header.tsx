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
  return <div className="w-full">
      <div className="bg-[#005ea2] dark:bg-gray-800 text-white p-2 flex flex-col sm:flex-row sm:items-center relative">
        <div className="text-2xl sm:text-3xl font-bold">{formattedTime}</div>
        <div className="text-xl sm:text-2xl font-bold mt-1 sm:mt-0 sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
          {formattedDate}
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
          <button onClick={toggleDarkMode} className="p-1 rounded-full hover:bg-[#004b81] dark:hover:bg-gray-700 transition-colors mr-2" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-300" /> : <MoonIcon className="h-6 w-6 text-white" />}
          </button>
          <h1 className="text-xl font-bold text-white">ROOM RADAR</h1>
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