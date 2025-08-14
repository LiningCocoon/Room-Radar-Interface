import React, { Component } from 'react';
import { ClockIcon, CheckIcon, DoorOpenIcon, CalendarClockIcon } from 'lucide-react';
import AVSupportIcon from './AVSupportIcon';
interface Meeting {
  name: string;
  startTime: string;
  endTime: string;
  room: string;
  status?: 'active' | 'upcoming' | 'past' | 'available';
  avSupport?: boolean;
}
interface SimplifiedMeetingCardProps {
  meeting: Meeting;
  currentTime: Date;
}
const SimplifiedMeetingCard: React.FC<SimplifiedMeetingCardProps> = ({
  meeting,
  currentTime
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
  // Check if current time is past noon (12PM)
  const isPastNoon = currentHour >= 12;
  // Check if this is a morning meeting (before noon)
  const isMorningMeeting = startTime.hours < 12;
  // Determine if this meeting should be smaller based on time of day
  const shouldBeSmaller = isPastNoon && isMorningMeeting && !isAvailable;
  // Determine status based on current time with special handling for Available slots
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
    cardClasses += ' p-[0.7rem]';
  } else {
    // Regular meetings: more horizontal breathing room
    cardClasses += ' px-[1.2rem] py-[0.9rem]';
  }
  // Apply styling based on status
  if (isAvailable) {
    if (status === 'past') {
      // Past available slots: gray and muted
      cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
    } else {
      // Future available slots: subtle green
      cardClasses += ' border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600 opacity-75';
    }
  } else if (status === 'active') {
    cardClasses += ' border-[#005ea2] bg-[#e6f3ff] dark:bg-[#0a2e4f] dark:border-[#2c79c7] shadow-lg border-2';
  } else if (status === 'past') {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  } else {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
  }
  // Apply text color and icon based on status
  let textColorClass = 'text-black dark:text-white';
  let iconComponent = null;
  if (isAvailable) {
    if (status === 'past') {
      // Past available slots: gray and muted
      textColorClass = 'text-gray-500 dark:text-gray-400';
      iconComponent = <CheckIcon className="h-7.5 w-7.5 text-gray-500 dark:text-gray-400" />;
    } else {
      // Future available slots: subtle green
      textColorClass = 'text-green-700 dark:text-green-400';
      iconComponent = <DoorOpenIcon className="h-7.5 w-7.5 text-green-600 dark:text-green-400" />;
    }
  } else if (status === 'active') {
    textColorClass = 'text-[#005ea2] dark:text-[#4d9eff] font-extrabold';
    iconComponent = <ClockIcon className="h-7.5 w-7.5 text-[#005ea2] dark:text-[#4d9eff]" />;
  } else if (status === 'past') {
    textColorClass = 'text-gray-500 dark:text-gray-400';
    iconComponent = null;
  } else {
    textColorClass = 'text-black dark:text-white';
    iconComponent = <CalendarClockIcon className="h-7.5 w-7.5 text-black dark:text-white" />;
  }
  // Get AV icon color based on status
  const getAvIconColor = () => {
    if (status === 'active') return 'text-[#005ea2] dark:text-[#4d9eff]';
    if (status === 'past') return 'text-gray-500 dark:text-gray-400';
    return 'text-black dark:text-white'; // upcoming
  };
  // Adjust text sizes based on time of day
  let titleSize = shouldBeSmaller && status === 'past' ? 'text-[1.5rem]' : 'text-[2rem]';
  let timeSize = shouldBeSmaller && status === 'past' ? 'text-[1.1rem]' : 'text-[1.4rem]';
  // A/V Support icon size based on card size
  const avIconSize = shouldBeSmaller && status === 'past' ? 20 : 24;
  return <div className={`${cardClasses} ${status === 'past' ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`${titleSize} font-bold ${isAvailable || status === 'active' ? textColorClass : 'text-black dark:text-white'}`}>
            {meeting.name}
          </h3>
          <p className={`${timeSize} mt-1 dark:text-gray-200`}>
            {meeting.startTime}
          </p>
        </div>
        <div className="ml-4 mt-1">{iconComponent}</div>
      </div>
      {/* A/V Support Icon */}
      {meeting.avSupport && !isAvailable && <div className="absolute bottom-2 right-2">
          <AVSupportIcon size={avIconSize} className={`${getAvIconColor()}`} />
        </div>}
    </div>;
};
export default SimplifiedMeetingCard;