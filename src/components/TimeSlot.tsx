import React from 'react';
interface TimeSlotProps {
  time: string;
  currentTime: Date;
  condensed?: boolean;
}
const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  currentTime,
  condensed = false
}) => {
  // Parse the time to check if it's the current hour
  const timeHour = parseInt(time.split(':')[0]);
  const currentHour = currentTime.getHours();
  const isCurrentHour = timeHour === currentHour;
  return <div className="col-span-1 flex items-center justify-center">
      <div className={`${condensed ? 'text-lg' : 'text-xl'} font-bold ${isCurrentHour ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {time}
      </div>
    </div>;
};
export default TimeSlot;