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
  // Parse time more precisely to match MeetingCard logic
  const parseTime = (timeStr: string) => {
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
  // Convert times to minutes for easier comparison (matching MeetingCard logic)
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const slotTimeInMinutes = slotTime.hours * 60 + slotTime.minutes;
  // Determine if this time slot should be highlighted
  // A time slot is active if current time is within the hour window of the slot
  const isActive = currentTimeInMinutes >= slotTimeInMinutes && currentTimeInMinutes < slotTimeInMinutes + 60;
  // Special case: if it's before 8AM, highlight the first time slot (8AM)
  const isFirstTimeSlot = slotTime.hours === 8 && time.includes('AM');
  const isBeforeWorkday = currentHour < 8;
  // Check if this is an after-hours time slot (6PM or later or before 9AM)
  const isAfterHours = slotTime.hours >= 18 || slotTime.hours < 9; // 6PM or later, or before 9AM
  // Never condense current hour or after-hours time slots
  const isCondensed = condensed && !isAfterHours && !isActive;
  // Styling based on active status and condensed state
  let timeClasses = `font-bold rounded-lg transition-all duration-300 ${isCondensed ? 'text-xl py-2 px-3' : 'text-4xl py-4 px-6'}`;
  if (isActive || isBeforeWorkday && isFirstTimeSlot) {
    timeClasses += ' border-b-4 border-[#005ea2] text-[#005ea2]';
  }
  // Highlight after-hours time slots
  if (isAfterHours) {
    timeClasses += ' text-orange-600 font-extrabold';
  }
  return <div className="col-span-1 flex items-center justify-center">
      <div className={timeClasses}>{time}</div>
    </div>;
};
export default TimeSlot;