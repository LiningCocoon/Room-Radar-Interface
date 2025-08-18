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
interface SimplifiedMeetingCardProps {
  meeting: Meeting;
  currentTime: Date;
  duration?: number;
  showDurationBadge?: boolean;
  startPosition?: 'top' | 'bottom';
  militaryTime?: boolean;
  isYesterday?: boolean;
}
const SimplifiedMeetingCard: React.FC<SimplifiedMeetingCardProps> = ({
  meeting,
  currentTime,
  duration = 0,
  showDurationBadge = false,
  startPosition = 'top',
  militaryTime = false,
  isYesterday = false
}) => {
  // Early return with safe defaults if meeting is invalid
  if (!meeting || typeof meeting !== 'object') {
    return <div className="p-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 mb-2">
        <div className="text-lg font-bold text-gray-500">Invalid Meeting</div>
      </div>;
  }
  const isAvailable = meeting.name === 'Available';
  // Properly typed time parsing function
  const parseTime = (timeStr: string) => {
    try {
      if (!timeStr) return {
        hours: 0,
        minutes: 0
      };
      const str = String(timeStr).trim();
      if (!str) return {
        hours: 0,
        minutes: 0
      };
      // Handle military time (HH:MM format)
      if (str.match(/^\d{1,2}:\d{2}$/)) {
        const [h, m] = str.split(':');
        return {
          hours: Math.max(0, Math.min(23, parseInt(h) || 0)),
          minutes: Math.max(0, Math.min(59, parseInt(m) || 0))
        };
      }
      // Handle AM/PM format
      const ampmMatch = str.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
      if (ampmMatch) {
        let hours = parseInt(ampmMatch[1]) || 0;
        const minutes = parseInt(ampmMatch[2]) || 0;
        const period = (ampmMatch[3] || '').toUpperCase();
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        return {
          hours: Math.max(0, Math.min(23, hours)),
          minutes: Math.max(0, Math.min(59, minutes))
        };
      }
      return {
        hours: 0,
        minutes: 0
      };
    } catch (error) {
      return {
        hours: 0,
        minutes: 0
      };
    }
  };
  // Properly typed time formatting function
  const formatTimeToMilitary = (timeStr: string) => {
    try {
      if (!timeStr) return '00:00';
      if (militaryTime) {
        const time = parseTime(timeStr);
        return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
      }
      return String(timeStr);
    } catch (error) {
      return '00:00';
    }
  };
  // Safe time calculations
  let startTime, endTime, currentTimeInMinutes, startTimeInMinutes, endTimeInMinutes;
  try {
    startTime = parseTime(meeting.startTime);
    endTime = meeting.endTime ? parseTime(meeting.endTime) : null;
    const currentHour = currentTime ? currentTime.getHours() : 0;
    const currentMinute = currentTime ? currentTime.getMinutes() : 0;
    currentTimeInMinutes = currentHour * 60 + currentMinute;
    startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    endTimeInMinutes = endTime ? endTime.hours * 60 + endTime.minutes : startTimeInMinutes + 60;
  } catch (error) {
    // Fallback values
    startTime = {
      hours: 0,
      minutes: 0
    };
    endTime = null;
    currentTimeInMinutes = 0;
    startTimeInMinutes = 0;
    endTimeInMinutes = 60;
  }
  // Safe status determination
  let status = 'upcoming';
  try {
    if (isYesterday) {
      status = 'past';
    } else if (isAvailable) {
      status = currentTimeInMinutes > startTimeInMinutes + 60 ? 'past' : 'available';
    } else if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
      status = 'active';
    } else if (currentTimeInMinutes >= endTimeInMinutes) {
      status = 'past';
    }
  } catch (error) {
    status = 'upcoming';
  }
  // Safe calculations for styling logic
  let isStartingSoon = false;
  let shouldBeSmaller = false;
  try {
    isStartingSoon = startTimeInMinutes > currentTimeInMinutes && startTimeInMinutes - currentTimeInMinutes <= 15;
    const currentHour = currentTime ? currentTime.getHours() : 0;
    const isPastNoon = currentHour >= 12;
    const isMorningMeeting = startTime.hours < 12;
    shouldBeSmaller = isPastNoon && isMorningMeeting && !isAvailable;
  } catch (error) {
    // Use safe defaults
  }
  // Determine if this is a past meeting
  const isPastMeeting = status === 'past' || isYesterday;
  // Base styling
  let cardClasses = 'rounded-lg border text-left transition-all duration-300 mb-2 relative p-2';
  // Apply styling based on status
  if (isAvailable) {
    if (isPastMeeting) {
      cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
    } else {
      cardClasses += ' border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600 opacity-75';
    }
  } else if (meeting.isHighProfile && !isPastMeeting) {
    cardClasses += ' border-[#9b2c2c] bg-[#bc4b4b] dark:bg-[#8b3a3a] dark:border-[#9b2c2c] shadow-lg border-2';
  } else if (status === 'active' && !isYesterday) {
    cardClasses += ' border-[#005ea2] bg-[#e6f3ff] dark:bg-[#0a2e4f] dark:border-[#2c79c7] shadow-lg border-2';
  } else if (isPastMeeting) {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  } else if (meeting.avSupport && isStartingSoon && !isYesterday) {
    cardClasses += ' border-[#fa9441] bg-[#ffbc78] dark:bg-[#ffbc78]/20 dark:border-[#fa9441] border-2';
  } else {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  }
  // Text color logic
  let textColorClass = 'text-black dark:text-white';
  if (isAvailable) {
    if (isPastMeeting) {
      textColorClass = 'text-gray-500 dark:text-gray-400';
    } else {
      textColorClass = 'text-green-700 dark:text-green-400';
    }
  } else if (meeting.isHighProfile && !isPastMeeting) {
    textColorClass = 'text-white';
  } else if (status === 'active' && !isYesterday) {
    textColorClass = 'text-[#005ea2] dark:text-[#4d9eff] font-extrabold';
  } else if (isPastMeeting) {
    textColorClass = 'text-gray-500 dark:text-gray-400';
  }
  // Safe AV icon color
  const getAvIconColor = () => {
    if (isYesterday) return 'text-gray-500 dark:text-gray-400';
    if (meeting.isHighProfile && status !== 'past') return 'text-white';
    if (status === 'active') return 'text-[#005ea2] dark:text-[#4d9eff]';
    if (status === 'past') return 'text-gray-500 dark:text-gray-400';
    if (isStartingSoon) return 'text-[#fa9441] dark:text-[#fa9441]';
    return 'text-black dark:text-white';
  };
  // Updated font sizes:
  // Current and future meeting fonts increased by 10%
  const regularTitleSize = shouldBeSmaller ? 'text-[1.65rem]' // 10% larger than text-2xl (1.5rem)
  : 'text-[2.0625rem]'; // 10% larger than text-3xl (1.875rem)
  const regularTimeSize = shouldBeSmaller ? 'text-[1.375rem]' // 10% larger than text-xl (1.25rem)
  : 'text-[1.65rem]'; // 10% larger than text-2xl (1.5rem)
  // Past meeting fonts now 22% smaller than regular sizes (was 10% smaller)
  const pastTitleSize = shouldBeSmaller ? 'text-[1.287rem]' // 22% smaller than 1.65rem
  : 'text-[1.609rem]'; // 22% smaller than 2.0625rem
  const pastTimeSize = shouldBeSmaller ? 'text-[1.0725rem]' // 22% smaller than 1.375rem
  : 'text-[1.287rem]'; // 22% smaller than 1.65rem
  // Choose appropriate text sizes based on meeting status
  const titleSize = isPastMeeting ? pastTitleSize : regularTitleSize;
  const timeSize = isPastMeeting ? pastTimeSize : regularTimeSize;
  const avIconSize = isPastMeeting ? 28 : 34;
  // Safely typed chair name logic
  const getChairName = (): string | null => {
    try {
      if (!meeting || !meeting.room || !meeting.name) return null;
      if (meeting.room === 'JFK' || meeting.room === 'Executive') {
        const names = ['Carlos Salazar', 'Devon Black', 'Nick Trees', 'Patty Smith'];
        const index = Math.abs(startTimeInMinutes || 0) % 4;
        return names[index] || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  };
  const chairName = getChairName();
  const showChair = chairName && !isAvailable && status === 'upcoming' && !isYesterday;
  return <div className={`${cardClasses} ${isPastMeeting ? 'opacity-35' : ''}`} style={!isAvailable && duration > 1 ? {
    minHeight: `${Math.min(duration * 80, 320)}px`
  } : {}}>
      {/* VIP Star Icon */}
      {meeting.isHighProfile && !isPastMeeting && <div className="absolute top-1 right-1">
          <StarIcon size={24} className="text-white animate-pulse" aria-label="VIP meeting" />
        </div>}
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-6">
          <h3 className={`${titleSize} font-bold leading-tight ${textColorClass}`}>
            {meeting.name || 'Unknown Meeting'}
          </h3>
          {(!isAvailable || isAvailable && !isPastMeeting) && <p className={`${timeSize} mt-0.5 ${meeting.isHighProfile && !isPastMeeting ? 'text-white dark:text-white dark:opacity-90' : 'dark:text-gray-200'}`}>
              {!isAvailable ? `${formatTimeToMilitary(meeting.startTime)}${meeting.endTime ? ` - ${formatTimeToMilitary(meeting.endTime)}` : ''}` : formatTimeToMilitary(meeting.startTime)}
            </p>}
          {showChair && <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-lg font-medium shadow-sm">
              {chairName}
            </div>}
          {showDurationBadge && !isAvailable && !isYesterday && <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-lg font-medium">
              <ClockIcon size={16} className="mr-1" />
              {duration} hour{duration !== 1 ? 's' : ''}
            </div>}
        </div>
      </div>
      {meeting.avSupport && !isAvailable && <div className="absolute bottom-1 right-1">
          <AVSupportIcon size={avIconSize} className={getAvIconColor()} />
        </div>}
    </div>;
};
export default SimplifiedMeetingCard;