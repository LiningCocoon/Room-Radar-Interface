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
interface MeetingCardProps {
  meeting: Meeting;
  currentTime: Date;
  condensed?: boolean;
  duration?: number;
  showDurationBadge?: boolean;
  startPosition?: 'top' | 'bottom';
}
const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  currentTime,
  condensed = false,
  duration = 0,
  showDurationBadge = false,
  startPosition = 'top'
}) => {
  const isAvailable = meeting.name === 'Available';
  // Parse meeting times more precisely
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(/(?=[AP]M)/);
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    const isPM = period === 'PM' && hours !== 12;
    return {
      hours: isPM ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours,
      minutes: minutes || 0
    };
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
  // Determine status based on current time, with special handling for Available slots
  let status = 'upcoming';
  if (isAvailable) {
    // For Available slots, check if this time slot is in the past
    if (currentTimeInMinutes > startTimeInMinutes + 60) {
      // Past the end of this hour slot
      status = 'past';
    } else {
      status = 'available';
    }
  } else if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
    // Meeting is currently happening
    status = 'active';
  } else if (currentTimeInMinutes >= endTimeInMinutes) {
    // Meeting has ended
    status = 'past';
  } else {
    // Meeting hasn't started yet
    status = 'upcoming';
  }
  // Check if this is an early morning meeting (before 9AM)
  const isEarlyMorning = startTime.hours < 9;
  // Check if this is a late evening meeting (6PM or later)
  const isLateEvening = startTime.hours >= 18;
  // Never condense active meetings or early/late meetings
  const isCondensed = condensed && !isEarlyMorning && !isLateEvening && status !== 'active';
  // Base card styling - reduced padding by 20%
  let cardClasses = 'rounded-lg border text-left transition-all duration-300';
  // Apply height based on duration for non-available meetings
  if (!isAvailable && duration > 1) {
    cardClasses += ` min-h-[${Math.min(duration * 100, 400)}px]`;
  }
  // Apply styling based on status
  if (isAvailable) {
    if (status === 'past') {
      // Past available slots should match other past events
      cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
    } else {
      // Future available slots: subtle green
      cardClasses += ' border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600 opacity-75';
    }
  } else if (meeting.isHighProfile && status !== 'past') {
    // VIP meeting styling (not for past meetings) - UPDATED to USWDS Red 50v
    cardClasses += ' border-[#b50909] bg-[#d83933] dark:bg-[#b50909] dark:border-[#b50909] shadow-lg border-2';
  } else if (status === 'active') {
    cardClasses += ' border-[#005ea2] bg-[#e6f3ff] dark:bg-[#0a2e4f] dark:border-[#2c79c7] shadow-lg border-2';
  } else if (status === 'past') {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  } else if (meeting.avSupport && isStartingSoon) {
    // A/V needs meeting starting within 15 minutes - updated to new colors
    cardClasses += ' border-[#fa9441] bg-[#ffbc78] dark:bg-[#ffbc78]/20 dark:border-[#fa9441] border-2';
  } else {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  }
  cardClasses += isCondensed ? ' p-[0.54rem] ml-0' : ' p-[0.9rem] ml-0';
  // Apply text color and icon based on status
  let textColorClass = 'text-black dark:text-white';
  let iconComponent = null;
  if (isAvailable) {
    if (status === 'past') {
      // Past available slots should have gray text but NO icon
      textColorClass = 'text-gray-500 dark:text-gray-400';
      // No icon for past available slots
    } else {
      // Future available slots with subtle green styling
      textColorClass = 'text-green-700 dark:text-green-400';
      iconComponent = <DoorOpenIcon className={isCondensed ? 'h-4.5 w-4.5 text-green-600 dark:text-green-400' : 'h-7.5 w-7.5 text-green-600 dark:text-green-400'} />;
    }
  } else if (meeting.isHighProfile && status !== 'past') {
    // VIP meetings: white text but NO clock icon
    textColorClass = 'text-white';
  } else if (status === 'active') {
    textColorClass = 'text-[#005ea2] dark:text-[#4d9eff] font-extrabold';
  } else if (status === 'past') {
    textColorClass = 'text-gray-500 dark:text-gray-400';
    iconComponent = null;
  } else {
    textColorClass = 'text-black dark:text-white';
  }
  // Add a subtle indicator for early/late meetings without changing the card styling
  if ((isEarlyMorning || isLateEvening) && !isAvailable && status !== 'past' && status !== 'active') {
    // Remove the gold color styling - use standard text color
    textColorClass = 'text-black dark:text-white';
  }
  // Get AV icon color based on status
  const getAvIconColor = () => {
    if (meeting.isHighProfile && status !== 'past') return 'text-white';
    if (status === 'active') return 'text-[#005ea2] dark:text-[#4d9eff]';
    if (status === 'past') return 'text-gray-500 dark:text-gray-400';
    if (isStartingSoon) return 'text-[#fa9441] dark:text-[#fa9441]'; // Updated to new color
    return 'text-black dark:text-white'; // upcoming
  };
  // A/V Support icon size based on condensed state
  const avIconSize = isCondensed ? 16 : 20;
  // Get the exact minute part of the meeting start time for display
  const getMinuteDisplay = () => {
    const minutes = parseTime(meeting.startTime).minutes;
    return minutes === 0 ? ':00' : `:${minutes}`;
  };
  // Mock chair data - in a real app, this would come from the meeting data
  const getChairName = () => {
    if (meeting.room === 'JFK' || meeting.room === 'Executive') {
      if (meeting.name.includes('Planning')) return 'Sarah Johnson';
      if (meeting.name.includes('Review')) return 'Michael Chen';
      if (meeting.name.includes('Sync')) return 'David Wilson';
      if (meeting.name.includes('Meeting')) return 'Emily Parker';
      if (meeting.name.includes('Demo')) return 'Robert Taylor';
      return 'Alex Rodriguez';
    }
    return null;
  };
  const chairName = getChairName();
  const showChair = chairName && !isAvailable && status === 'upcoming';
  // Increased font sizes by 10% for title
  const titleFontSize = isCondensed ? 'text-[1.11rem]' : 'text-[1.49rem]'; // Increased from text-[1.0125rem]/text-[1.35rem]
  return <div className={`${cardClasses} mb-2 ml-0.5 mr-1.5 md:ml-1 md:mr-2 lg:ml-1.5 lg:mr-3 relative ${status === 'past' ? 'opacity-50' : ''}`} style={!isAvailable && duration > 1 ? {
    minHeight: `${Math.min(duration * 80, 320)}px`
  } : {}}>
      {/* VIP Star Icon for high profile meetings */}
      {meeting.isHighProfile && status !== 'past' && <div className="absolute top-1 right-1 group">
          <StarIcon size={isCondensed ? 14 : 18} className="text-white animate-pulse" aria-label="VIP meeting" />
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
            VIP meeting
            <div className="absolute top-full right-2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`${titleFontSize} font-bold ${isAvailable || status === 'active' ? textColorClass : 'text-black dark:text-white'}`}>
            {meeting.name}
          </h3>
          <p className={`${isCondensed ? 'text-[0.7875rem]' : 'text-[1.125rem]'} mt-1 dark:text-gray-200`}>
            {!isAvailable ? `${meeting.startTime} - ${meeting.endTime}` : meeting.startTime}
          </p>
          {/* Chair information with increased font size by 25% */}
          {showChair && <div className="mt-1 text-[1.25rem] text-gray-600 dark:text-gray-400 font-medium">
              Chair: {chairName}
            </div>}
          {/* Show exact minute for non-available meetings to help visualize the placement */}
          {!isAvailable && !isCondensed && startPosition === 'bottom' && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Starts at{getMinuteDisplay()}
            </div>}
          {/* Duration badge for long meetings */}
          {showDurationBadge && !isAvailable && <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium">
              <ClockIcon size={12} className="mr-1" />
              {duration} hour{duration !== 1 ? 's' : ''}
            </div>}
        </div>
        <div className={`${isCondensed ? 'ml-2' : 'ml-4'} flex items-center justify-center h-full`}>
          {iconComponent}
        </div>
      </div>
      {/* A/V Support Icon */}
      {meeting.avSupport && !isAvailable && <div className="absolute bottom-1 right-1">
          <AVSupportIcon size={avIconSize} className={`${getAvIconColor()}`} />
        </div>}
    </div>;
};
export default MeetingCard;