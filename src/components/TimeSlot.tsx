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
  // Check if this is an early morning time slot (before 9AM)
  const isEarlyMorning = slotTime.hours < 9; // Before 9AM
  // Check if this is a late evening time slot (6PM or later)
  const isLateEvening = slotTime.hours >= 18; // 6PM or later
  // Never condense current hour or early/late time slots
  const isCondensed = condensed && !isEarlyMorning && !isLateEvening && !isActive;
  // Styling based on active status and condensed state
  // Increased text size by 30% and reduced padding by 20%
  let timeClasses = `font-bold rounded-lg transition-all duration-300 ${isCondensed ? 'text-2xl py-0.8 px-1.6' // 30% larger and 20% less padding
  : 'text-4xl py-1.6 px-2.4' // 30% larger and 20% less padding
  }`;
  // USWDS-inspired colors
  const activeColor = '#005ea2'; // USWDS blue-60v
  if (isActive) {
    timeClasses += ` border-b-4 border-[#005ea2] text-[#005ea2]`;
  } else if (isBeforeWorkday && isFirstTimeSlot) {
    timeClasses += ` border-b-4 border-[#005ea2] text-[#005ea2]`;
  }
  return <div className="col-span-1 flex items-center">
      <div className="w-full flex justify-center">
        <div className={`${timeClasses} mx-auto px-1`}>{time}</div>
      </div>
    </div>;
};
export default TimeSlot;