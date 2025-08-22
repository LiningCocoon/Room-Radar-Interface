import React, { useMemo } from 'react';
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
  isFarFuture?: boolean;
}
// Helper function to determine text strategy based on name length
const getTextStrategy = (nameLength: number) => {
  if (nameLength <= 15) {
    return {
      fontSize: 'text-[2rem]',
      lineHeight: 'leading-tight',
      maxLines: 1,
      strategy: 'single-line-large'
    };
  } else if (nameLength <= 25) {
    return {
      fontSize: 'text-[1.75rem]',
      lineHeight: 'leading-tight',
      maxLines: 2,
      strategy: 'two-line-medium'
    };
  } else {
    return {
      fontSize: 'text-[1.5rem]',
      lineHeight: 'leading-snug',
      maxLines: 2,
      strategy: 'two-line-compact'
    };
  }
};
// Intelligent truncation function
const formatMeetingName = (name: string) => {
  if (name.length <= 30) {
    return {
      text: name,
      truncated: false
    };
  } else {
    // Truncate at word boundaries
    const words = name.split(' ');
    let truncated = '';
    for (const word of words) {
      if ((truncated + word + '...').length <= 33) {
        truncated += word + ' ';
      } else break;
    }
    return {
      text: truncated.trim() + '...',
      truncated: true
    };
  }
};
// Add a function to determine VIP title based on meeting name and room
const getVipTitle = (meeting: Meeting) => {
  if (!meeting) return 'VIP';
  // Executive room meetings
  if (meeting.room === 'Executive') {
    if (meeting.name.includes('Board')) return 'CEO';
    if (meeting.name.includes('Review')) return 'CTO'; // Map to VP instead
    if (meeting.name.includes('Planning')) return 'COO';
    if (meeting.name.includes('Client')) return 'VP';
    if (meeting.name.includes('Emergency')) return 'COS';
    if (meeting.name.includes('Investor')) return 'VP';
    return 'VP';
  }
  // JFK room meetings
  if (meeting.room === 'JFK') {
    if (meeting.name.includes('Leadership')) return 'VP';
    if (meeting.name.includes('Strategy')) return 'COS';
    if (meeting.name.includes('Team')) return 'VP';
    if (meeting.name.includes('Stakeholder')) return 'VP';
    return 'VP';
  }
  // Small room or Breakout rooms
  if (meeting.room === 'Small' || meeting.room.includes('Breakout')) {
    if (meeting.name.includes('Design')) return 'VP';
    if (meeting.name.includes('Product')) return 'VP';
    if (meeting.name.includes('Budget')) return 'VP';
    return 'VP';
  }
  return 'VP';
};
const SimplifiedMeetingCard: React.FC<SimplifiedMeetingCardProps> = ({
  meeting,
  currentTime,
  duration = 0,
  showDurationBadge = false,
  startPosition = 'top',
  militaryTime = false,
  isYesterday = false,
  absolutePositioned = false,
  expandable = false,
  isFarFuture = false
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
      if (!timeStr) return '0000';
      if (militaryTime) {
        const time = parseTime(timeStr);
        return `${String(time.hours).padStart(2, '0')}${String(time.minutes).padStart(2, '0')}`;
      }
      return String(timeStr);
    } catch (error) {
      return '0000';
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
  let cardClasses = 'rounded-lg border text-left transition-all duration-300 relative p-3 meeting-card-content';
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
  // Calculate text strategy based on meeting name length
  const textStrategy = useMemo(() => {
    return getTextStrategy(meeting.name?.length || 0);
  }, [meeting.name]);
  // Adjust font size for far future meetings
  const adjustedFontSize = isFarFuture ? `${textStrategy.fontSize.replace(/\d+(\.\d+)?rem/, match => {
    const size = parseFloat(match);
    return `${(size * 0.9).toFixed(2)}rem`;
  })}` : textStrategy.fontSize;
  // Format meeting name with possible truncation
  const formattedName = useMemo(() => {
    return formatMeetingName(meeting.name || 'Unknown Meeting');
  }, [meeting.name]);
  // Chairperson display size and color
  const chairpersonSize = isPastMeeting ? 'text-[1.15rem]' : 'text-[1.35rem]';
  const chairpersonColor = meeting.isHighProfile && !isPastMeeting ? 'text-white dark:text-white dark:opacity-90' : isPastMeeting ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300';
  // Get the exact minute part of the meeting start time for display
  const getMinuteDisplay = () => {
    const minutes = parseTime(meeting.startTime).minutes;
    return minutes === 0 ? ':00' : `:${minutes}`;
  };
  // Show chairperson for all meetings (not just important ones)
  const showChairperson = meeting.chairperson && !isAvailable;
  // AV icon size
  const avIconSize = isPastMeeting ? 28 : 34;
  return <div className={`${cardClasses} ${isPastMeeting ? 'opacity-35' : isFarFuture ? 'opacity-75' : ''} ${expandable ? 'overflow-visible' : 'h-full'}`} style={{
    ...(absolutePositioned ? {
      position: 'relative',
      overflow: expandable ? 'visible' : 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transform: isFarFuture ? 'scale(0.95)' : 'scale(1)',
      transformOrigin: 'center top'
    } : duration > 1 && !isAvailable ? {
      minHeight: `${Math.min(duration * 120, 400)}px`,
      position: 'relative',
      zIndex: duration > 1 ? 10 : 1,
      transform: isFarFuture ? 'scale(0.95)' : 'scale(1)',
      transformOrigin: 'center top'
    } : {
      transform: isFarFuture ? 'scale(0.95)' : 'scale(1)',
      transformOrigin: 'center top'
    }),
    minHeight: '120px',
    maxHeight: '180px',
    transition: 'transform 0.2s ease, opacity 0.2s ease'
  }}>
      {/* Replace VIP Star Icon with text badge */}
      {meeting.isHighProfile && !isPastMeeting && <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded-md shadow-sm" style={{
        fontSize: isFarFuture ? '0.65rem' : '0.75rem'
      }}>
            {getVipTitle(meeting)}
          </span>
        </div>}

      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 pr-6">
          <h3 className={`${adjustedFontSize} ${textStrategy.lineHeight} font-bold ${textColorClass} meeting-card-title break-words hyphens-auto overflow-hidden`} style={{
          display: '-webkit-box',
          WebkitLineClamp: textStrategy.maxLines,
          WebkitBoxOrient: 'vertical'
        }} title={meeting.name || 'Unknown Meeting'} // Tooltip for accessibility
        >
            {formattedName.text}
          </h3>
          {/* Chairperson information display - no "Chair:" prefix */}
          {showChairperson && <div className={`mt-2 mb-2 ${chairpersonSize} font-medium ${chairpersonColor} truncate`}>
              {meeting.chairperson}
            </div>}
          {(!isAvailable || isAvailable && !isPastMeeting) && <p className={`text-[1.45rem] mt-1 mb-2 meeting-card-time ${meeting.isHighProfile && !isPastMeeting ? 'text-white dark:text-white dark:opacity-90' : 'dark:text-gray-200'} ${isFarFuture ? 'text-[1.3rem]' : ''}`}>
              {!isAvailable ? `${formatTimeToMilitary(meeting.startTime)}${meeting.endTime ? ` - ${formatTimeToMilitary(meeting.endTime)}` : ''}` : formatTimeToMilitary(meeting.startTime)}
            </p>}
        </div>
      </div>

      {meeting.avSupport && !isAvailable && <div className="absolute bottom-2 right-2">
          <AVSupportIcon size={isPastMeeting ? 24 : isFarFuture ? 26 : 28} className={getAvIconColor()} />
        </div>}
    </div>;
};
export default SimplifiedMeetingCard;