import React, { useState } from 'react';
import { SunIcon, MoonIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
interface HeaderProps {
  currentTime: Date;
  isYesterday?: boolean;
  onToggleDay?: () => void;
}
const Header: React.FC<HeaderProps> = ({
  currentTime,
  isYesterday = false,
  onToggleDay
}) => {
  const location = useLocation();
  const isAlternativeView = location.pathname === '/alternative';
  const {
    isDarkMode,
    toggleDarkMode
  } = useTheme();
  // Format date without time
  const formattedDate = new Date(isYesterday ? currentTime.getTime() - 24 * 60 * 60 * 1000 : currentTime.getTime()).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  // If we're on the alternative view, don't render the header content
  if (isAlternativeView) {
    return null;
  }
  return <div className="w-full sticky top-0 z-[10000]">
      <div className="bg-[#1a2235] dark:bg-gray-800 text-white py-3 px-5 relative">
        {/* Desktop layout */}
        <div className="hidden sm:flex sm:flex-row sm:items-center relative">
          {/* Date moved to the left */}
          <div className="text-2xl font-bold flex items-center">
            {formattedDate}
            {/* Day toggle button - UPDATED to show only one direction */}
            {onToggleDay && <button onClick={onToggleDay} className="ml-3 py-1 px-3 rounded-full hover:bg-[#004b81] dark:hover:bg-gray-700 transition-colors flex items-center" aria-label={isYesterday ? 'View today' : 'View yesterday'}>
                {isYesterday ? <>
                    <span className="mr-1">Today</span>
                    <ChevronRightIcon className="h-5 w-5 text-white" />
                  </> : <>
                    <ChevronLeftIcon className="h-5 w-5 text-white" />
                    <span className="ml-1">Yesterday</span>
                  </>}
              </button>}
          </div>
          {/* Empty div to maintain spacing where time was */}
          <div className="flex-1"></div>
          <div className="absolute right-3 flex items-center">
            <button onClick={toggleDarkMode} className="p-1 rounded-full hover:bg-[#004b81] dark:hover:bg-gray-700 transition-colors mr-2" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDarkMode ? <SunIcon className="h-6 w-6 text-yellow-300" /> : <MoonIcon className="h-6 w-6 text-white" />}
            </button>
            <h1 className="text-2xl font-bold text-white">Room Radar</h1>
          </div>
        </div>
        {/* Mobile layout - with 25% smaller text */}
        <div className="sm:hidden flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              {/* Room Radar title with 25% smaller text - changed from all caps to title case */}
              <h1 className="text-[1.65rem] font-bold text-white leading-tight">
                Room Radar
              </h1>
              {/* Date with 25% smaller text */}
              <div className="flex items-center">
                <div className="text-[0.975rem] font-normal text-white mt-0">
                  {formattedDate}
                </div>
                {/* Day toggle button for mobile - UPDATED to show only one direction */}
                {onToggleDay && <button onClick={onToggleDay} className="ml-2 py-0.5 px-2 rounded-full hover:bg-[#004b81] dark:hover:bg-gray-700 transition-colors flex items-center" aria-label={isYesterday ? 'View today' : 'View yesterday'}>
                    {isYesterday ? <>
                        <span className="mr-1 text-xs">Today</span>
                        <ChevronRightIcon className="h-3 w-3 text-white" />
                      </> : <>
                        <ChevronLeftIcon className="h-3 w-3 text-white" />
                        <span className="ml-1 text-xs">Yesterday</span>
                      </>}
                  </button>}
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
      <div className="border-b border-gray-300 px-3 bg-white dark:bg-gray-900 dark:border-gray-700" data-id="element-164" style={{
      margin: '0px',
      height: '0px',
      overflow: 'hidden',
      padding: '0 0 0 0'
    }}></div>
    </div>;
};
export default Header;