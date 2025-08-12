import React from 'react';
import { CalendarIcon } from 'lucide-react';
interface HeaderProps {
  currentTime: Date;
}
const Header: React.FC<HeaderProps> = ({
  currentTime
}) => {
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
  return <div className="w-full">
      <div className="bg-[#005ea2] text-white p-4 flex justify-between items-center">
        <div className="text-3xl font-bold">{formattedTime}</div>
        <div className="text-2xl font-bold">{formattedDate}</div>
      </div>
      <div className="border-b border-gray-300 py-4 px-6 flex items-center">
        <CalendarIcon className="h-12 w-12 text-[#005ea2] mr-4" />
        <h1 className="text-4xl font-bold uppercase">Room Radar</h1>
      </div>
    </div>;
};
export default Header;