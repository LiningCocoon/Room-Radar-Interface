import React, { Component } from 'react';
import { DoorOpenIcon, StarIcon, ClockIcon } from 'lucide-react';
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
  const isAvailable = meeting.name === 'Available';
  // Parse meeting times more precisely
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
  // Convert time to military format if needed
  const formatTimeToMilitary = (timeStr: string) => {
    if (militaryTime && (timeStr.includes('AM') || timeStr.includes('PM'))) {
      const time = parseTime(timeStr);
      return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    }
    return timeStr;
  };
  const startTime = parseTime(meeting.startTime);
  const endTime = meeting.endTime ? parseTime(meeting.endTime) : null;
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  // Convert times to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
  const endTimeInMinutes = endTime ? endTime.hours * 60 + endTime.minutes : startTimeInMinutes + 60;
  // Check if meeting is starting within 15 minutes
  const isStartingSoon = startTimeInMinutes > currentTimeInMinutes && startTimeInMinutes - currentTimeInMinutes <= 15;
  // Check if current time is past noon (12PM)
  const isPastNoon = currentHour >= 12;
  // Check if this is a morning meeting (before noon)
  const isMorningMeeting = startTime.hours < 12;
  // Determine if this meeting should be smaller based on time of day
  const shouldBeSmaller = isPastNoon && isMorningMeeting && !isAvailable;
  // Determine status based on current time with special handling for Available slots
  // If viewing yesterday, all meetings are considered past
  let status = 'upcoming';
  if (isYesterday) {
    status = 'past';
  } else if (isAvailable) {
    // For Available slots, check if this time slot is in the past
    if (currentTimeInMinutes > startTimeInMinutes + 60) {
      // Past the end of this hour slot
      status = 'past';
    } else {
      status = 'available';
    }
  } else if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
    status = 'active';
  } else if (currentTimeInMinutes >= endTimeInMinutes) {
    status = 'past';
  } else {
    status = 'upcoming';
  }
  // Base card styling with increased horizontal padding
  let cardClasses = 'rounded-lg border text-left transition-all duration-300 mb-2 relative';
  // Apply padding based on time of day logic
  if (shouldBeSmaller && status === 'past') {
    // Morning meetings after noon that are in the past: make them smaller
    cardClasses += ' p-[0.6rem]';
  } else {
    // Regular meetings: reduced horizontal padding to prevent text wrapping
    cardClasses += ' px-[0.9rem] py-[0.8rem]';
  }
  // Apply styling based on status and special conditions
  if (isAvailable) {
    if (status === 'past' || isYesterday) {
      // Past available slots: gray and muted
      cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
    } else {
      // Future available slots: subtle green
      cardClasses += ' border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600 opacity-75';
    }
  } else if (meeting.isHighProfile && status !== 'past' && !isYesterday) {
    // VIP meeting styling (not for past meetings)
    cardClasses += ' border-[#b50909] bg-[#e41d3d] dark:bg-[#c41d3d] dark:border-[#b50909] shadow-lg border-2';
  } else if (status === 'active' && !isYesterday) {
    cardClasses += ' border-[#005ea2] bg-[#e6f3ff] dark:bg-[#0a2e4f] dark:border-[#2c79c7] shadow-lg border-2';
  } else if (status === 'past' || isYesterday) {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  } else if (meeting.avSupport && isStartingSoon && !isYesterday) {
    // A/V needs meeting starting within 15 minutes - updated to new colors
    cardClasses += ' border-[#fa9441] bg-[#ffbc78] dark:bg-[#ffbc78]/20 dark:border-[#fa9441] border-2';
  } else {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  }
  // Apply text color and icon based on status
  let textColorClass = 'text-black dark:text-white';
  let iconComponent = null;
  if (isAvailable) {
    if (status === 'past' || isYesterday) {
      // Past available slots: gray and muted, but NO icon
      textColorClass = 'text-gray-500 dark:text-gray-400';
      // No icon for past available slots
    } else {
      // Future available slots: subtle green
      textColorClass = 'text-green-700 dark:text-green-400';
      iconComponent = <DoorOpenIcon className="h-7.5 w-7.5 text-green-600 dark:text-green-400" />;
    }
  } else if (meeting.isHighProfile && status !== 'past' && !isYesterday) {
    // VIP meetings: white text in both light and dark mode for better contrast
    textColorClass = 'text-white';
  } else if (status === 'active' && !isYesterday) {
    textColorClass = 'text-[#005ea2] dark:text-[#4d9eff] font-extrabold';
  } else if (status === 'past' || isYesterday) {
    textColorClass = 'text-gray-500 dark:text-gray-400';
    iconComponent = null;
  } else {
    // Upcoming meetings: no icon
    textColorClass = 'text-black dark:text-white';
    iconComponent = null;
  }
  // Get AV icon color based on status and conditions
  const getAvIconColor = () => {
    if (isYesterday) return 'text-gray-500 dark:text-gray-400';
    if (meeting.isHighProfile && status !== 'past') return 'text-white';
    if (status === 'active') return 'text-[#005ea2] dark:text-[#4d9eff]';
    if (status === 'past') return 'text-gray-500 dark:text-gray-400';
    if (isStartingSoon) return 'text-[#fa9441] dark:text-[#fa9441]'; // Updated to new color
    return 'text-black dark:text-white'; // default for upcoming
  };
  // Increased text sizes by 10% for better readability
  let titleSize = shouldBeSmaller && (status === 'past' || isYesterday) ? 'text-[1.7rem]' // Increased from 1.54rem
  : 'text-[2.18rem]'; // Increased from 1.98rem
  let timeSize = shouldBeSmaller && (status === 'past' || isYesterday) ? 'text-[1.33rem]' // Increased from 1.21rem
  : 'text-[1.57rem]'; // Increased from 1.43rem
  // A/V Support icon size based on card size (10% larger than before)
  const avIconSize = shouldBeSmaller && (status === 'past' || isYesterday) ? 24 : 29; // Increased from 22/26.4
  return <div className={`${cardClasses} ${status === 'past' || isYesterday ? 'opacity-35' : ''}`} style={!isAvailable && duration > 1 ? {
    minHeight: `${Math.min(duration * 80, 320)}px`
  } : {}}>
      {/* VIP Star Icon for high profile meetings */}
      {meeting.isHighProfile && status !== 'past' && !isYesterday && <div className="absolute top-1 right-1 group">
          <StarIcon size={20} className="text-white animate-pulse" aria-label="VIP meeting" />
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
            VIP meeting
            <div className="absolute top-full right-2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>}
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-2">
          <h3 className={`${titleSize} font-bold leading-tight ${meeting.isHighProfile && status !== 'past' && !isYesterday ? 'text-white' : isAvailable || status === 'active' && !isYesterday ? textColorClass : 'text-black dark:text-white'}`}>
            {meeting.name}
          </h3>
          <p className={`${timeSize} mt-0.5 ${meeting.isHighProfile && status !== 'past' && !isYesterday ? 'text-white dark:text-white dark:opacity-90' : 'dark:text-gray-200'}`}>
            {!isAvailable ? `${formatTimeToMilitary(meeting.startTime)}${meeting.endTime ? ` - ${formatTimeToMilitary(meeting.endTime)}` : ''}` : formatTimeToMilitary(meeting.startTime)}
          </p>
          {/* Duration badge for long meetings */}
          {showDurationBadge && !isAvailable && !isYesterday && <div className="mt-2 inline-flex items-center px-2.5 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium">
              <ClockIcon size={14} className="mr-1" />
              {duration} hour{duration !== 1 ? 's' : ''}
            </div>}
        </div>
        <div className="ml-2">{iconComponent}</div>
      </div>
      {/* A/V Support Icon */}
      {meeting.avSupport && !isAvailable && <div className="absolute bottom-1 right-1">
          <AVSupportIcon size={avIconSize} className={`${getAvIconColor()}`} />
        </div>}
    </div>;
};
export default SimplifiedMeetingCard;