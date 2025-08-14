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
interface MeetingCardProps {
  meeting: Meeting;
  currentTime: Date;
  condensed?: boolean;
}
const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  currentTime,
  condensed = false
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
  // Determine status based on current time, ignoring any hardcoded status
  let status = 'upcoming';
  if (isAvailable) {
    status = 'available';
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
  if (isAvailable) {
    if (status === 'past') {
      // Past available slots should match other past events
      cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
    } else {
      // Future available slots: subtle green
      cardClasses += ' border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600 opacity-75';
    }
    cardClasses += isCondensed ? ' p-[0.54rem] ml-0' : ' p-[0.9rem] ml-0';
  } else {
    cardClasses += isCondensed ? ' p-[0.54rem] ml-0' : ' p-[0.9rem] ml-0'; // reduced padding by 20%
  }
  // Apply opacity to all past items is now moved to the final return div
  let textColorClass = 'text-black dark:text-white';
  let iconComponent = null;
  // Apply specific styles based on status
  if (isAvailable) {
    if (status === 'past') {
      // Past available slots should have gray text and icon
      textColorClass = 'text-gray-500 dark:text-gray-400';
      iconComponent = null;
    } else {
      // Future available slots with subtle green styling
      textColorClass = 'text-green-700 dark:text-green-400';
      iconComponent = <DoorOpenIcon className={isCondensed ? 'h-4.5 w-4.5 text-green-600 dark:text-green-400' : 'h-7.5 w-7.5 text-green-600 dark:text-green-400'} />;
    }
  } else if (status === 'active') {
    cardClasses += ' border-[#005ea2] bg-[#e6f3ff] dark:bg-[#0a2e4f] dark:border-[#2c79c7] shadow-lg border-2';
    textColorClass = 'text-[#005ea2] dark:text-[#4d9eff] font-extrabold';
    iconComponent = <ClockIcon className={isCondensed ? 'h-4.5 w-4.5 text-[#005ea2] dark:text-[#4d9eff]' : 'h-7.5 w-7.5 text-[#005ea2] dark:text-[#4d9eff]'} />;
  } else if (status === 'past') {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
    textColorClass = 'text-gray-500 dark:text-gray-400';
    iconComponent = null;
  } else {
    cardClasses += ' border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700';
    textColorClass = 'text-black dark:text-white';
    iconComponent = <CalendarClockIcon className={isCondensed ? 'h-4.5 w-4.5 text-black dark:text-white' : 'h-7.5 w-7.5 text-black dark:text-white'} />;
  }
  // Add a subtle indicator for early/late meetings without changing the card styling
  if ((isEarlyMorning || isLateEvening) && !isAvailable && status !== 'past' && status !== 'active') {
    // Remove the gold color styling - use standard text color
    textColorClass = 'text-black dark:text-white';
  }
  // Get AV icon color based on status
  const getAvIconColor = () => {
    if (status === 'active') return 'text-[#005ea2] dark:text-[#4d9eff]';
    if (status === 'past') return 'text-gray-500 dark:text-gray-400';
    return 'text-black dark:text-white'; // upcoming
  };
  // A/V Support icon size based on condensed state
  const avIconSize = isCondensed ? 16 : 20;
  return <div className={`${cardClasses} mb-2 ml-0.5 mr-1.5 md:ml-1 md:mr-2 lg:ml-1.5 lg:mr-3 relative ${status === 'past' ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`${isCondensed ? 'text-[1.0125rem]' : 'text-[1.35rem]'} font-bold ${isAvailable || status === 'active' ? textColorClass : 'text-black dark:text-white'}`}>
            {meeting.name}
          </h3>
          <p className={`${isCondensed ? 'text-[0.7875rem]' : 'text-[1.125rem]'} mt-1 dark:text-gray-200`}>
            {meeting.startTime}
          </p>
        </div>
        <div className={`${isCondensed ? 'ml-2' : 'ml-4'} mt-1`}>
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