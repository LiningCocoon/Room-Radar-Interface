import React, { Component } from 'react';
import { ClockIcon, CheckIcon, DoorOpenIcon, CalendarClockIcon } from 'lucide-react';
interface Meeting {
  name: string;
  startTime: string;
  endTime: string;
  room: string;
  status?: 'active' | 'upcoming' | 'past' | 'available';
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
  // Check if this is an after-hours meeting (6PM or later or before 9AM)
  const isAfterHours = startTime.hours >= 18 || startTime.hours < 9; // 6PM or later, or before 9AM
  // Never condense active meetings or after-hours meetings
  const isCondensed = condensed && !isAfterHours && status !== 'active';
  // Base card styling
  let cardClasses = 'rounded-lg border text-left transition-all duration-300';
  if (isAvailable) {
    if (status === 'past') {
      // Past available slots should match other past events
      cardClasses += ' border-gray-300 bg-white';
    } else {
      // Future available slots keep the green styling
      cardClasses += ' border-dashed border-[#00a91c] bg-[#f0fff4]';
    }
    cardClasses += isCondensed ? ' p-2' : ' p-4';
  } else {
    cardClasses += isCondensed ? ' p-2' : ' p-4'; // consistent padding for all cards
  }
  let textColorClass = 'text-black';
  let iconComponent = null;
  // Apply specific styles based on status
  if (isAvailable) {
    if (status === 'past') {
      // Past available slots should have gray text and icon
      textColorClass = 'text-gray-500';
      iconComponent = <CheckIcon className={isCondensed ? 'h-4 w-4 text-gray-500' : 'h-7 w-7 text-gray-500'} />;
    } else {
      // Future available slots keep the green styling
      textColorClass = 'text-[#00a91c]';
      iconComponent = <DoorOpenIcon className={isCondensed ? 'h-4 w-4 text-[#00a91c]' : 'h-7 w-7 text-[#00a91c]'} />;
    }
  } else if (status === 'active') {
    cardClasses += ' border-[#005ea2] bg-[#e6f3ff] shadow-lg border-2';
    textColorClass = 'text-[#005ea2] font-extrabold';
    iconComponent = <ClockIcon className={isCondensed ? 'h-4 w-4 text-[#005ea2]' : 'h-7 w-7 text-[#005ea2]'} />;
  } else if (status === 'past') {
    cardClasses += ' border-gray-300 bg-white';
    textColorClass = 'text-gray-500';
    iconComponent = <CheckIcon className={isCondensed ? 'h-4 w-4 text-gray-500' : 'h-7 w-7 text-gray-500'} />;
  } else {
    cardClasses += ' border-gray-300 bg-white';
    textColorClass = 'text-black';
    iconComponent = <CalendarClockIcon className={isCondensed ? 'h-4 w-4 text-black' : 'h-7 w-7 text-black'} />;
  }
  // Highlight after-hours meetings
  if (isAfterHours && !isAvailable && status !== 'past') {
    cardClasses += ' border-orange-400';
  }
  return <div className={`${cardClasses} mb-2 ${isAvailable && status === 'past' ? 'opacity-10' : status === 'past' ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`${isCondensed ? 'text-lg' : 'text-2xl'} font-bold ${textColorClass}`}>
            {meeting.name}
          </h3>
          <p className={`${isCondensed ? 'text-sm' : 'text-xl'} mt-1`}>
            {meeting.startTime}
          </p>
          {!isCondensed && <p className="text-sm text-gray-500 mt-1">{meeting.room}</p>}
        </div>
        <div className={`${isCondensed ? 'ml-2' : 'ml-4'} mt-1`}>
          {iconComponent}
        </div>
      </div>
    </div>;
};
export default MeetingCard;