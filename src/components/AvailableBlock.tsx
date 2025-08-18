import React from 'react';
import { DoorOpenIcon } from 'lucide-react';
interface AvailableBlockProps {
  startTime: string;
  endTime: string;
  room: string;
  top: number;
  left: number;
  width: number;
  height: number;
  currentTime: Date;
  isYesterday?: boolean;
  militaryTime?: boolean;
}
const AvailableBlock: React.FC<AvailableBlockProps> = ({
  startTime,
  endTime,
  room,
  top,
  left,
  width,
  height,
  currentTime,
  isYesterday = false,
  militaryTime = false
}) => {
  // Parse time function
  const parseTime = (timeStr: string) => {
    if (militaryTime && timeStr.includes(':') && !timeStr.includes('M')) {
      const [h, m] = timeStr.split(':');
      return {
        hours: parseInt(h) || 0,
        minutes: parseInt(m) || 0
      };
    }
    const [time, period] = timeStr.split(/(?=[AP]M)/);
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    const isPM = period === 'PM' && hours !== 12;
    return {
      hours: isPM ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours,
      minutes: minutes || 0
    };
  };
  // Format time for display
  const formatTime = (timeStr: string) => {
    if (militaryTime) {
      const time = parseTime(timeStr);
      return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    }
    return timeStr;
  };
  // Determine if this block is in the past
  const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const blockStartTime = parseTime(startTime);
  const blockStartInMinutes = blockStartTime.hours * 60 + blockStartTime.minutes;
  const isPast = isYesterday || currentTimeInMinutes > blockStartInMinutes;
  // Base styling
  let blockClasses = 'rounded-lg border-dashed border-2 text-left transition-all duration-300 p-2 absolute flex flex-col justify-center items-center';
  if (isPast) {
    blockClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 opacity-50';
  } else {
    blockClasses += ' border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600 opacity-75';
  }
  const textColorClass = isPast ? 'text-gray-500 dark:text-gray-400' : 'text-green-700 dark:text-green-400';
  return <div className={blockClasses} style={{
    top,
    left,
    width,
    height
  }}>
      {!isPast && <DoorOpenIcon className={`h-6 w-6 ${textColorClass} mb-1`} />}
      <div className={`text-xs font-bold text-center ${textColorClass}`}>
        Available
      </div>
      <div className={`text-xs text-center ${textColorClass}`}>
        {formatTime(startTime)} - {formatTime(endTime)}
      </div>
    </div>;
};
export default AvailableBlock;