import React from 'react';
interface SimplifiedTimeSlotProps {
  time: string;
  currentTime: Date;
  militaryTime?: boolean;
}
const SimplifiedTimeSlot: React.FC<SimplifiedTimeSlotProps> = ({
  time,
  currentTime,
  militaryTime = false
}) => {
  // Parse the time to check if it's the current hour
  const timeHour = parseInt(time.split(':')[0]);
  const currentHour = currentTime.getHours();
  const isCurrentHour = timeHour === currentHour;
  // Determine if this timeslot is in the past, current, or future
  const isPastHour = timeHour < currentHour;
  const isFutureHour = timeHour > currentHour;
  // Set the text size based on whether the timeslot is past, current, or future
  // Current and future timeslots are enlarged by 15%
  const textSizeClass = isPastHour ? 'text-3xl' : 'text-[3.45rem]'; // 3xl * 1.15 = ~3.45rem
  return <div className="col-span-1 flex items-center justify-center p-2">
      <div className={`${textSizeClass} font-bold ${isCurrentHour ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {time}
      </div>
    </div>;
};
export default SimplifiedTimeSlot;