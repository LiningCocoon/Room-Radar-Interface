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
}
const MeetingCard: React.FC<MeetingCardProps> = ({
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
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  // Convert times to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
  // Determine status
  let status = meeting.status || 'upcoming';
  if (!status) {
    if (currentHour < 8 && startTime.hours === 8) {
      // Before 8 AM, mark 8 AM meetings as upcoming
      status = 'upcoming';
    } else if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < startTimeInMinutes + 60) {
      // During the meeting time window
      status = 'active';
    } else if (currentTimeInMinutes >= startTimeInMinutes + 60) {
      // Only mark as past after the full hour window has elapsed
      status = 'past';
    } else {
      status = 'upcoming';
    }
  }
  // Base card styling
  let cardClasses = 'rounded-lg border text-left transition-all duration-300';
  if (isAvailable) {
    cardClasses += ' border-dashed border-[#00a91c] bg-white p-4';
  } else {
    cardClasses += ' p-4'; // consistent padding for all cards
  }
  let textColorClass = 'text-black';
  let iconComponent = null;
  // Apply specific styles based on status
  if (isAvailable) {
    textColorClass = 'text-[#00a91c]';
    iconComponent = <DoorOpenIcon className="h-7 w-7 text-[#00a91c]" />;
  } else if (status === 'active') {
    cardClasses += ' border-[#005ea2] bg-white shadow-lg border-2';
    textColorClass = 'text-[#005ea2] font-extrabold';
    iconComponent = <ClockIcon className="h-7 w-7 text-[#005ea2]" />;
  } else if (status === 'past') {
    cardClasses += ' border-gray-300 bg-white';
    textColorClass = 'text-gray-500';
    iconComponent = <CheckIcon className="h-7 w-7 text-gray-500" />;
  } else {
    cardClasses += ' border-gray-300 bg-white';
    textColorClass = 'text-black';
    iconComponent = <CalendarClockIcon className="h-7 w-7 text-black" />;
  }
  return <div className={cardClasses}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`text-2xl font-bold ${textColorClass}`}>
            {meeting.name}
          </h3>
          <p className="text-xl mt-2">
            {meeting.startTime}
            {meeting.endTime ? ` - ${meeting.endTime}` : ''}
          </p>
        </div>
        <div className="ml-4 mt-1">{iconComponent}</div>
      </div>
    </div>;
};
export default MeetingCard;