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
  chairperson?: string | null;
}
interface SimplifiedMeetingCardProps {
  meeting: Meeting;
  currentTime: Date;
  duration?: number;
  showDurationBadge?: boolean;
  startPosition?: 'top' | 'bottom';
  militaryTime?: boolean;
  isYesterday?: boolean;
  absolutePositioned?: boolean;
  expandable?: boolean;
}
const SimplifiedMeetingCard: React.FC<SimplifiedMeetingCardProps> = ({
  meeting,
  currentTime,
  duration = 0,
  showDurationBadge = false,
  startPosition = 'top',
  militaryTime = false,
  isYesterday = false,
  absolutePositioned = false,
  expandable = false
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
  // Base styling - updated to ensure full background coverage
  let cardClasses = 'rounded-lg border text-left transition-all duration-300 relative overflow-hidden';
  // Don't add mb-2 margin if absolutely positioned
  if (!absolutePositioned) {
    cardClasses += ' mb-2';
  }
  // Apply styling based on status
  if (isAvailable) {
    if (isPastMeeting) {
      cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
    } else {
      // Make available cards more subtle
      cardClasses += ' border-dashed border-green-300 bg-green-50/50 dark:bg-green-900/10 dark:border-green-700/50 opacity-60';
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
      // Make available text more subtle
      textColorClass = 'text-green-700/80 dark:text-green-500/80';
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
  // Current and future meeting fonts increased by 3% (was 10%)
  const regularTitleSize = shouldBeSmaller ? 'text-[1.5435rem]' // 3% larger than text-2xl (1.5rem)
  : 'text-[1.93125rem]'; // 3% larger than text-3xl (1.875rem)
  const regularTimeSize = shouldBeSmaller ? 'text-[1.2875rem]' // 3% larger than text-xl (1.25rem)
  : 'text-[1.545rem]'; // 3% larger than text-2xl (1.5rem)
  // Past meeting fonts now 22% smaller than regular sizes (was 10% smaller)
  const pastTitleSize = shouldBeSmaller ? 'text-[1.287rem]' // 22% smaller than 1.65rem
  : 'text-[1.609rem]'; // 22% smaller than 2.0625rem
  const pastTimeSize = shouldBeSmaller ? 'text-[1.0725rem]' // 22% smaller than 1.375rem
  : 'text-[1.287rem]'; // 22% smaller than 1.65rem
  // Choose appropriate text sizes based on meeting status
  const titleSize = isPastMeeting ? pastTitleSize : regularTitleSize;
  const timeSize = isPastMeeting ? pastTimeSize : regularTimeSize;
  const avIconSize = isPastMeeting ? 28 : 34;
  // Chairperson display size and color
  const chairpersonSize = isPastMeeting ? 'text-[1.15rem]' : 'text-[1.35rem]';
  const chairpersonColor = meeting.isHighProfile && !isPastMeeting ? 'text-white dark:text-white dark:opacity-90' : isPastMeeting ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300';
  // Show chairperson for all meetings (not just important ones)
  const showChairperson = meeting.chairperson && !isAvailable;
  return <div className={`${cardClasses} ${isPastMeeting ? 'opacity-35' : ''} ${expandable ? 'overflow-visible' : 'h-full'} meeting-card-full-height`} style={{
    height: '100%',
    width: '100%',
    minHeight: '60px',
    display: 'flex',
    flexDirection: 'column'
  }}>
      {/* VIP Star Icon - positioned absolutely */}
      {meeting.isHighProfile && !isPastMeeting && <div className="absolute top-2 right-2 z-10">
          <StarIcon size={24} className="text-white animate-pulse" aria-label="VIP meeting" />
        </div>}

      {/* Main content area with flex layout for proper distribution */}
      <div className="flex flex-col justify-between h-full p-3">
        {/* Top section - Meeting title and chairperson */}
        <div className="flex-1 min-h-0">
          <h3 className={`${titleSize} font-bold leading-tight ${textColorClass} mb-1`}>
            {meeting.name || 'Unknown Meeting'}
          </h3>
          {/* Chairperson information */}
          {showChairperson && <div className={`mb-2 ${chairpersonSize} font-medium ${chairpersonColor}`}>
              {meeting.chairperson}
            </div>}
        </div>

        {/* Bottom section - Time information and AV support icon */}
        <div className="mt-auto flex justify-between items-end">
          {/* Time information */}
          {(!isAvailable || isAvailable && !isPastMeeting) && <p className={`${timeSize} ${meeting.isHighProfile && !isPastMeeting ? 'text-white dark:text-white dark:opacity-90' : 'dark:text-gray-200'}`}>
              {!isAvailable ? `${formatTimeToMilitary(meeting.startTime)}${meeting.endTime ? ` - ${formatTimeToMilitary(meeting.endTime)}` : ''}` : formatTimeToMilitary(meeting.startTime)}
            </p>}

          {/* AV Support Icon */}
          {meeting.avSupport && !isAvailable && <div>
              <AVSupportIcon size={avIconSize} className={getAvIconColor()} />
            </div>}
        </div>
      </div>
    </div>;
};
export default SimplifiedMeetingCard;