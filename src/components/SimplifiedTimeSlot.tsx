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
  // Parse time more precisely to match MeetingCard logic
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
  const slotTime = parseTime(time);
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  // Convert times to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const slotTimeInMinutes = slotTime.hours * 60 + slotTime.minutes;
  // Determine if this time slot should be highlighted
  const isActive = currentTimeInMinutes >= slotTimeInMinutes && currentTimeInMinutes < slotTimeInMinutes + 60;
  // Special case: if it's before 8AM, highlight the first time slot (8AM)
  const isFirstTimeSlot = slotTime.hours === 8;
  const isBeforeWorkday = currentHour < 8;
  // Check if current time is past noon (12PM)
  const isPastNoon = currentHour >= 12;
  // Check if this is a morning time slot (before noon)
  const isMorningSlot = slotTime.hours < 12;
  // Determine if this slot should be smaller based on time of day
  // If it's past noon and this is a morning slot, make it 30% smaller
  const shouldBeSmaller = isPastNoon && isMorningSlot && !isActive;
  // SIGNIFICANTLY LARGER text sizes for better readability from afar
  let timeClasses = `font-bold rounded-lg transition-all duration-300 dark:text-white`;
  // Apply size based on time of day logic
  if (shouldBeSmaller) {
    // Morning slots after noon: make them smaller but still large enough
    timeClasses += ` text-4xl py-1 px-1.5`;
  } else {
    // Regular time slots: very large and bold
    timeClasses += ` text-5xl py-1 px-2`;
  }
  // USWDS-inspired colors for active slots with enhanced dark mode visibility
  if (isActive) {
    timeClasses += ` border-b-4 border-blue-400 text-[#60a5fa] dark:text-[#60a5fa] bg-blue-900/10 dark:bg-blue-900/30 px-3 py-2 rounded-lg`;
  } else if (isBeforeWorkday && isFirstTimeSlot) {
    timeClasses += ` border-b-4 border-blue-400 text-[#60a5fa] dark:text-[#60a5fa] bg-blue-900/10 dark:bg-blue-900/30 px-3 py-2 rounded-lg`;
  }
  return <div className="col-span-1 flex items-start justify-center pt-2">
      <div className={`${timeClasses}`}>{time}</div>
    </div>;
};
export default SimplifiedTimeSlot;