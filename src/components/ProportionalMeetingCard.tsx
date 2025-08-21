import React from 'react';
import { StarIcon, ClockIcon } from 'lucide-react';
import AVSupportIcon from './AVSupportIcon';
interface Meeting {
  name: string;
  startTime: string;
  endTime: string;
  room: string;
  status?: 'active' | 'upcoming' | 'past' | 'available';
  avSupport?: boolean;
  isHighProfile?: boolean;
}
interface ProportionalMeetingCardProps {
  meeting: Meeting;
  currentTime: Date;
  top: number;
  left: number;
  width: number;
  height: number;
  duration?: number;
  militaryTime?: boolean;
  isYesterday?: boolean;
}
const ProportionalMeetingCard: React.FC<ProportionalMeetingCardProps> = ({
  meeting,
  currentTime,
  top,
  left,
  width,
  height,
  duration = 0,
  militaryTime = false,
  isYesterday = false
}) => {
  // Parse meeting times
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
  // Format time to 4-digit military format without colon
  const formatToMilitaryTime = (timeStr: string) => {
    const parsedTime = parseTime(timeStr);
    const hours = parsedTime.hours.toString().padStart(2, '0');
    const minutes = parsedTime.minutes.toString().padStart(2, '0');
    return `${hours}${minutes}`;
  };
  const startTime = parseTime(meeting.startTime);
  const endTime = meeting.endTime ? parseTime(meeting.endTime) : null;
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  // Convert times to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
  const endTimeInMinutes = endTime ? endTime.hours * 60 + endTime.minutes : startTimeInMinutes + 60;
  // Determine status
  let status = 'upcoming';
  if (isYesterday) {
    status = 'past';
  } else if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
    status = 'active';
  } else if (currentTimeInMinutes >= endTimeInMinutes) {
    status = 'past';
  }
  // Check if meeting is starting soon
  const isStartingSoon = startTimeInMinutes > currentTimeInMinutes && startTimeInMinutes - currentTimeInMinutes <= 15;
  // Base styling
  let cardClasses = 'rounded-lg border text-left transition-all duration-300 p-2 absolute';
  // Apply styling based on status
  if (meeting.isHighProfile && status !== 'past' && !isYesterday) {
    cardClasses += ' border-[#b50909] bg-[#d83933] dark:bg-[#b50909] dark:border-[#b50909] shadow-lg border-2';
  } else if (status === 'active' && !isYesterday) {
    cardClasses += ' border-[#005ea2] bg-[#e6f3ff] dark:bg-[#0a2e4f] dark:border-[#2c79c7] shadow-lg border-2';
  } else if (status === 'past' || isYesterday) {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  } else if (meeting.avSupport && isStartingSoon && !isYesterday) {
    cardClasses += ' border-[#fa9441] bg-[#ffbc78] dark:bg-[#ffbc78]/20 dark:border-[#fa9441] border-2';
  } else {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  }
  // Text color
  let textColorClass = 'text-black dark:text-white';
  if (meeting.isHighProfile && status !== 'past' && !isYesterday) {
    textColorClass = 'text-white';
  } else if (status === 'active' && !isYesterday) {
    textColorClass = 'text-[#005ea2] dark:text-[#4d9eff] font-extrabold';
  } else if (status === 'past' || isYesterday) {
    textColorClass = 'text-gray-500 dark:text-gray-400';
  }
  // Get AV icon color
  const getAvIconColor = () => {
    if (isYesterday) return 'text-gray-500 dark:text-gray-400';
    if (meeting.isHighProfile && status !== 'past') return 'text-white';
    if (status === 'active') return 'text-[#005ea2] dark:text-[#4d9eff]';
    if (status === 'past') return 'text-gray-500 dark:text-gray-400';
    if (isStartingSoon) return 'text-[#fa9441] dark:text-[#fa9441]';
    return 'text-black dark:text-white';
  };
  return <div className={`${cardClasses} ${status === 'past' || isYesterday ? 'opacity-50' : ''}`} style={{
    top,
    left,
    width,
    height
  }}>
      {/* VIP Star Icon */}
      {meeting.isHighProfile && status !== 'past' && !isYesterday && <div className="absolute top-1 right-1">
          <StarIcon size={16} className="text-white animate-pulse" aria-label="VIP meeting" />
        </div>}
      <div className="flex justify-between items-start h-full">
        <div className="flex-1 pr-4">
          <h3 className={`text-sm font-bold leading-tight ${textColorClass}`}>
            {meeting.name}
          </h3>
          <p className={`text-xs mt-1 ${meeting.isHighProfile && status !== 'past' && !isYesterday ? 'text-white' : 'dark:text-gray-200'}`}>
            {formatToMilitaryTime(meeting.startTime)} -{' '}
            {formatToMilitaryTime(meeting.endTime)}
          </p>
          {duration >= 2 && !isYesterday && <div className="mt-1 inline-flex items-center px-1 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium">
              <ClockIcon size={10} className="mr-1" />
              {duration}h
            </div>}
        </div>
      </div>
      {/* A/V Support Icon */}
      {meeting.avSupport && <div className="absolute bottom-1 right-1">
          <AVSupportIcon size={16} className={getAvIconColor()} />
        </div>}
    </div>;
};
export default ProportionalMeetingCard;