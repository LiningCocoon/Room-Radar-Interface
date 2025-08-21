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
  // Format time to 4-digit military format without colon
  const formatToMilitaryTime = (timeStr: string) => {
    // Convert AM/PM format to military time
    let hours = 0;
    let minutes = 0;
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const timePart = timeStr.replace(/[APM]/g, '').trim();
      const [h, m] = timePart.split(':');
      hours = parseInt(h);
      minutes = m ? parseInt(m) : 0;
      if (timeStr.includes('PM') && hours !== 12) {
        hours += 12;
      } else if (timeStr.includes('AM') && hours === 12) {
        hours = 0;
      }
    } else {
      const parts = timeStr.split(':');
      hours = parseInt(parts[0]);
      minutes = parts.length > 1 ? parseInt(parts[1]) : 0;
    }
    return `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
  };
  return <div className="col-span-1 flex items-center justify-center">
      <div className={`${condensed ? 'text-lg' : 'text-xl'} font-bold text-gray-700 dark:text-gray-300`}>
        {formatToMilitaryTime(time)}
      </div>
    </div>;
};
export default TimeSlot;