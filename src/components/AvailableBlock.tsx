import React from 'react';
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
  // Parse time strings to get hours and minutes
  const parseTime = (timeStr: string) => {
    // For military time format (24-hour)
    if (militaryTime || timeStr.includes(':') && !timeStr.includes('AM') && !timeStr.includes('PM')) {
      const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
      return {
        hours,
        minutes: minutes || 0
      };
    }
    // For AM/PM format
    const [time, period] = timeStr.split(/(?=[AP]M)/);
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    const isPM = period === 'PM' && hours !== 12;
    return {
      hours: isPM ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours,
      minutes: minutes || 0
    };
  };
  // Format time to military format if needed
  const formatTimeToMilitary = (timeStr: string) => {
    if (militaryTime && (timeStr.includes('AM') || timeStr.includes('PM'))) {
      const time = parseTime(timeStr);
      return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    }
    return timeStr;
  };
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  // Convert to minutes for comparison
  const startTimeInMinutes = start.hours * 60 + start.minutes;
  const endTimeInMinutes = end.hours * 60 + end.minutes;
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  // Determine if this available block is in the past
  const isPast = isYesterday || currentTimeInMinutes >= endTimeInMinutes;
  // Base styling
  let blockClasses = 'absolute rounded-lg border text-left transition-all duration-300';
  // Apply styling based on past/future status
  if (isPast) {
    blockClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 opacity-35';
  } else {
    blockClasses += ' border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600 opacity-75';
  }
  // Determine text and padding based on height - 30% larger text
  const getTextAndPadding = () => {
    if (height < 40) {
      return {
        showText: false,
        padding: 'p-1.5',
        textClass: 'hidden'
      };
    } else if (height < 60) {
      return {
        showText: true,
        padding: 'p-2',
        textClass: 'text-sm font-medium' // Increased from text-xs
      };
    } else {
      return {
        showText: true,
        padding: 'p-2.5',
        textClass: 'text-base font-medium' // Increased from text-sm
      };
    }
  };
  const {
    showText,
    padding,
    textClass
  } = getTextAndPadding();
  return <div className={`${blockClasses} ${padding}`} style={{
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`
  }}>
      {showText && <>
          <div className={`${textClass} ${isPast ? 'text-gray-500 dark:text-gray-400' : 'text-green-700 dark:text-green-400'}`}>
            Available
          </div>
          <div className={`${textClass} mt-0.5 ${isPast ? 'text-gray-500 dark:text-gray-400' : 'text-green-700 dark:text-green-400'}`}>
            {formatTimeToMilitary(startTime)} - {formatTimeToMilitary(endTime)}
          </div>
        </>}
    </div>;
};
export default AvailableBlock;