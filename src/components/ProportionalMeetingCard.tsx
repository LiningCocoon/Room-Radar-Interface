import React from 'react';
import { DoorOpenIcon, StarIcon, ClockIcon } from 'lucide-react';
import AVSupportIcon from './AVSupportIcon';
import { getAbbreviation } from '../utils/abbreviations';
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
  height: number;
  width: number;
  top: number;
  left: number;
  duration?: number;
  militaryTime?: boolean;
  isYesterday?: boolean;
}
const ProportionalMeetingCard: React.FC<ProportionalMeetingCardProps> = ({
  meeting,
  currentTime,
  height,
  width,
  top,
  left,
  duration = 0,
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
  // Determine text size and content based on card height
  // Increase all text sizes by 30%
  const getTextSizing = () => {
    // Very short cards (< 40px)
    if (height < 40) {
      return {
        titleClass: 'text-sm font-bold truncate',
        timeClass: 'hidden',
        chairClass: 'hidden',
        showTime: false,
        showChair: false,
        showDuration: false,
        name: getAbbreviation(meeting.name, 8)
      };
    }
    // Short cards (40-80px)
    else if (height < 80) {
      return {
        titleClass: 'text-base font-bold truncate',
        timeClass: 'text-sm',
        chairClass: 'hidden',
        showTime: true,
        showChair: false,
        showDuration: false,
        name: getAbbreviation(meeting.name, 15)
      };
    }
    // Medium cards (80-120px)
    else if (height < 120) {
      return {
        titleClass: 'text-xl font-bold line-clamp-2',
        timeClass: 'text-lg',
        chairClass: 'text-sm',
        showTime: true,
        showChair: true,
        showDuration: false,
        name: getAbbreviation(meeting.name, 25)
      };
    }
    // Long cards (120px+)
    else {
      return {
        titleClass: 'text-2xl font-bold',
        timeClass: 'text-xl',
        chairClass: 'text-lg',
        showTime: true,
        showChair: true,
        showDuration: true,
        name: meeting.name
      };
    }
  };
  const textSizing = getTextSizing();
  // Base card styling
  let cardClasses = 'rounded-lg border text-left transition-all duration-300 absolute';
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
    // VIP meeting styling
    cardClasses += ' border-[#b50909] bg-[#d83933] dark:bg-[#b50909] dark:border-[#b50909] shadow-lg border-2';
  } else if (status === 'active' && !isYesterday) {
    cardClasses += ' border-[#005ea2] bg-[#e6f3ff] dark:bg-[#0a2e4f] dark:border-[#2c79c7] shadow-lg border-2';
  } else if (status === 'past' || isYesterday) {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  } else if (meeting.avSupport && isStartingSoon && !isYesterday) {
    // A/V needs meeting starting within 15 minutes
    cardClasses += ' border-[#fa9441] bg-[#ffbc78] dark:bg-[#ffbc78]/20 dark:border-[#fa9441] border-2';
  } else {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  }
  // Apply text color based on status
  let textColorClass = 'text-black dark:text-white';
  if (isAvailable) {
    if (status === 'past' || isYesterday) {
      textColorClass = 'text-gray-500 dark:text-gray-400';
    } else {
      textColorClass = 'text-green-700 dark:text-green-400';
    }
  } else if (meeting.isHighProfile && status !== 'past' && !isYesterday) {
    textColorClass = 'text-white';
  } else if (status === 'active' && !isYesterday) {
    textColorClass = 'text-[#005ea2] dark:text-[#4d9eff] font-extrabold';
  } else if (status === 'past' || isYesterday) {
    textColorClass = 'text-gray-500 dark:text-gray-400';
  }
  // Get AV icon color based on status and conditions
  const getAvIconColor = () => {
    if (isYesterday) return 'text-gray-500 dark:text-gray-400';
    if (meeting.isHighProfile && status !== 'past') return 'text-white';
    if (status === 'active') return 'text-[#005ea2] dark:text-[#4d9eff]';
    if (status === 'past') return 'text-gray-500 dark:text-gray-400';
    if (isStartingSoon) return 'text-[#fa9441] dark:text-[#fa9441]';
    return 'text-black dark:text-white';
  };
  // A/V Support icon size based on card height (30% larger)
  const getAvIconSize = () => {
    if (height < 40) return 16;
    if (height < 80) return 21;
    if (height < 120) return 26;
    return 31;
  };
  // Chair name function
  const getChairName = () => {
    if (meeting.room === 'JFK' || meeting.room === 'Executive') {
      // Use the meeting name to determine which chair name to use
      if (meeting.name.includes('Planning')) return 'Carlos Salazar';
      if (meeting.name.includes('Review')) return 'Devon Black';
      if (meeting.name.includes('Sync')) return 'Nick Trees';
      if (meeting.name.includes('Meeting')) return 'Patty Smith';
      // For other meeting types, rotate through the 4 names based on start time
      const nameIndex = startTimeInMinutes % 4;
      const chairNames = ['Carlos Salazar', 'Devon Black', 'Nick Trees', 'Patty Smith'];
      return chairNames[nameIndex];
    }
    return null;
  };
  const chairName = getChairName();
  const showChair = chairName && !isAvailable && status === 'upcoming' && !isYesterday && textSizing.showChair;
  // Calculate padding based on card height
  const getPadding = () => {
    if (height < 40) return 'p-1.5';
    if (height < 80) return 'p-2';
    if (height < 120) return 'p-2.5';
    return 'p-4';
  };
  return <div className={`${cardClasses} ${status === 'past' || isYesterday ? 'opacity-35' : ''} ${getPadding()}`} style={{
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`
  }} title={meeting.name !== textSizing.name ? meeting.name : undefined}>
      {/* VIP Star Icon for high profile meetings */}
      {meeting.isHighProfile && status !== 'past' && !isYesterday && height >= 40 && <div className="absolute top-1 right-1 group">
            <StarIcon size={height < 80 ? 16 : 21} className="text-white" aria-label="VIP meeting" />
          </div>}
      <div className="flex flex-col h-full justify-between">
        <div>
          <h3 className={`${textSizing.titleClass} ${textColorClass}`}>
            {textSizing.name}
          </h3>
          {/* Time display */}
          {textSizing.showTime && (!isAvailable || isAvailable && status !== 'past' && !isYesterday) && <p className={`${textSizing.timeClass} mt-0.5 ${meeting.isHighProfile && status !== 'past' && !isYesterday ? 'text-white dark:text-white dark:opacity-90' : 'dark:text-gray-200'}`}>
                {!isAvailable ? `${formatTimeToMilitary(meeting.startTime)}${meeting.endTime ? ` - ${formatTimeToMilitary(meeting.endTime)}` : ''}` : formatTimeToMilitary(meeting.startTime)}
              </p>}
          {/* Chair information */}
          {showChair && <div className={`${textSizing.chairClass} mt-1 text-gray-600 dark:text-gray-400 font-medium`}>
              Chair: {chairName}
            </div>}
        </div>
        <div className="flex justify-between items-end">
          {/* Duration badge for long meetings */}
          {textSizing.showDuration && !isAvailable && !isYesterday && duration >= 2 && <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium">
                <ClockIcon size={13} className="mr-1" />
                {duration}h
              </div>}
          {/* A/V Support Icon */}
          {meeting.avSupport && !isAvailable && height >= 40 && <div className="ml-auto">
              <AVSupportIcon size={getAvIconSize()} className={`${getAvIconColor()}`} />
            </div>}
        </div>
      </div>
    </div>;
};
export default ProportionalMeetingCard;