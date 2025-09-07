import React, { useMemo } from 'react';
import { ClockIcon } from 'lucide-react';
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
  futureScale?: number;
}
// Helper function to determine text strategy based on name length
const getTextStrategy = (nameLength: number) => {
  if (nameLength <= 15) {
    return {
      fontSize: 'text-[2.2rem]',
      lineHeight: 'leading-tight',
      maxLines: 1,
      strategy: 'single-line-large'
    };
  } else if (nameLength <= 25) {
    return {
      fontSize: 'text-[1.925rem]',
      lineHeight: 'leading-tight',
      maxLines: 2,
      strategy: 'two-line-medium'
    };
  } else {
    return {
      fontSize: 'text-[1.65rem]',
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
// Updated function to determine VIP title based on meeting name and room
// Limited to only CEO, VP, DCOS options
const getVipTitle = (meeting: Meeting) => {
  if (!meeting) return 'VP';
  // Executive room meetings
  if (meeting.room === 'Executive') {
    if (meeting.name.includes('Board')) return 'CEO';
    if (meeting.name.includes('Leadership')) return 'CEO';
    if (meeting.name.includes('Emergency')) return 'DCOS';
    return 'VP';
  }
  // JFK room meetings
  if (meeting.room === 'JFK') {
    if (meeting.name.includes('Strategy')) return 'DCOS';
    if (meeting.name.includes('Stakeholder')) return 'VP';
    return 'VP';
  }
  // Default for all other rooms
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
  futureScale = 1.0
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
    cardClasses += ' border-[#04c585] bg-[#538200] dark:bg-[#538200] dark:border-[#04c585] shadow-lg border-3 border-opacity-45 dark:border-opacity-45 bg-opacity-45 dark:bg-opacity-45';
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
    textColorClass = 'text-white dark:text-white font-extrabold';
  } else if (isPastMeeting) {
    textColorClass = 'text-gray-500 dark:text-gray-400';
  }
  // Calculate text strategy based on meeting name length
  const textStrategy = useMemo(() => {
    return getTextStrategy(meeting.name?.length || 0);
  }, [meeting.name]);
  // Adjust font size for future meetings based on scaling factor
  const adjustedFontSize = futureScale !== 1.0 ? (() => {
    const sizeMatch = textStrategy.fontSize.match(/text-\[(\d+(?:\.\d+)?)rem\]/);
    if (sizeMatch) {
      const currentSize = parseFloat(sizeMatch[1]);
      const newSize = (currentSize * futureScale).toFixed(3);
      return `text-[${newSize}rem]`;
    }
    return textStrategy.fontSize;
  })() : textStrategy.fontSize;
  // Format meeting name with possible truncation
  const formattedName = useMemo(() => {
    return formatMeetingName(meeting.name || 'Unknown Meeting');
  }, [meeting.name]);
  // Chairperson display size and color
  const chairpersonSize = isPastMeeting ? 'text-[1.15rem]' : 'text-[1.35rem]';
  const chairpersonColor = meeting.isHighProfile && !isPastMeeting ? 'text-white dark:text-white dark:opacity-90' : isPastMeeting ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300';
  // Show chairperson for all meetings (not just important ones)
  const showChairperson = meeting.chairperson && !isAvailable;
  // Determine if this is a scaled future meeting
  const isScaledFuture = futureScale !== 1.0;
  return <div className={`${cardClasses} ${isPastMeeting ? 'opacity-35' : isScaledFuture ? 'opacity-75' : ''} ${expandable ? 'overflow-visible' : 'h-full'}`} style={{
    ...(absolutePositioned ? {
      position: 'relative',
      overflow: expandable ? 'visible' : 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transform: isScaledFuture ? `scale(${0.95 + (futureScale - 1.0) * 0.5})` : 'scale(1)',
      transformOrigin: 'center top',
      ...(status === 'active' && !isYesterday ? {
        borderWidth: '3px'
      } : {})
    } : duration > 1 && !isAvailable ? {
      minHeight: `${Math.min(duration * 120, 400)}px`,
      position: 'relative',
      zIndex: duration > 1 ? 10 : 1,
      transform: isScaledFuture ? `scale(${0.95 + (futureScale - 1.0) * 0.5})` : 'scale(1)',
      transformOrigin: 'center top',
      ...(status === 'active' && !isYesterday ? {
        borderWidth: '3px'
      } : {})
    } : {
      transform: isScaledFuture ? `scale(${0.95 + (futureScale - 1.0) * 0.5})` : 'scale(1)',
      transformOrigin: 'center top',
      ...(status === 'active' && !isYesterday ? {
        borderWidth: '3px'
      } : {})
    }),
    minHeight: '120px',
    maxHeight: '180px',
    transition: 'transform 0.2s ease, opacity 0.2s ease'
  }}>
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
          {(!isAvailable || isAvailable && !isPastMeeting) && <p className={`text-[1.45rem] mt-1 mb-2 meeting-card-time ${meeting.isHighProfile && !isPastMeeting || status === 'active' && !isYesterday ? 'text-white dark:text-white dark:opacity-90' : 'dark:text-gray-200'} ${futureScale > 1.0 ? 'text-[1.3rem]' : ''}`}>
              {!isAvailable ? `${formatTimeToMilitary(meeting.startTime)}${meeting.endTime ? ` - ${formatTimeToMilitary(meeting.endTime)}` : ''}` : formatTimeToMilitary(meeting.startTime)}
            </p>}
        </div>
      </div>

      {/* Computer icon for A/V support - limited to 3 specific meetings */}
      {meeting.avSupport && !isAvailable && (meeting.name.includes('Client Presentation') || meeting.name.includes('Board Review') || meeting.name.includes('Emergency Response')) && <div className="absolute bottom-2 right-2 group">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={futureScale > 1.0 ? 18 : 20} height={futureScale > 1.0 ? 18 : 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${meeting.isHighProfile && !isPastMeeting ? 'text-white' : isPastMeeting ? 'text-gray-500 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {/* Computer monitor */}
              <rect x="3" y="3" width="18" height="12" rx="2" ry="2" />
              {/* Computer stand */}
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="15" x2="12" y2="21" />
            </svg>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
              A/V Support
              <div className="absolute top-full right-2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>}
    </div>;
};
export default SimplifiedMeetingCard;