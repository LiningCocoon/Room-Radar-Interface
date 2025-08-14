import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import SimplifiedTimeSlot from './SimplifiedTimeSlot';
import SimplifiedMeetingCard from './SimplifiedMeetingCard';
import { isOldMeeting, parseTime, timeToMinutes } from '../utils/timeUtils';
interface SimplifiedViewProps {
  currentTime: Date;
}
const SimplifiedView: React.FC<SimplifiedViewProps> = ({
  currentTime
}) => {
  // Ensure rooms are in the specified order
  const rooms = ['FDR', 'Executive', 'Breakout 1', 'Breakout 2'];
  const allTimeSlots = ['7:00AM', '8:00AM', '9:00AM', '10:00AM', '12:00PM', '2:00PM', '3:00PM', '5:00PM', '6:00PM', '7:00PM'];
  // Check if a time slot should be shown (not more than 2 hours in the past)
  const shouldShowTimeSlot = (timeSlot: string) => {
    const slotTime = parseTime(timeSlot);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const slotTimeInMinutes = slotTime.hours * 60 + slotTime.minutes;
    // Show time slot if it's less than 2 hours in the past
    return currentTimeInMinutes - slotTimeInMinutes < 120;
  };
  // Filter time slots to only show recent/current/future ones
  const visibleTimeSlots = allTimeSlots.filter(shouldShowTimeSlot);
  // Filter out old meetings (more than 2 hours old)
  const recentMeetings = getMeetingData().filter(meeting => !isOldMeeting(meeting, currentTime));
  // Find the first VIP meeting across all rooms and time slots
  const allVipMeetings = recentMeetings.filter(m => m.isHighProfile);
  const firstVipMeeting = allVipMeetings.length > 0 ? allVipMeetings[0] : null;
  // Helper to get hour from time string
  const getHourFromTimeString = (timeStr: string) => {
    const time = parseTime(timeStr);
    return time.hours;
  };
  // Helper to check if a meeting spans across the given time slot
  const meetingSpansTimeSlot = (meeting: any, timeSlotStr: string) => {
    const timeSlotHour = getHourFromTimeString(timeSlotStr);
    const startHour = getHourFromTimeString(meeting.startTime);
    const endHour = getHourFromTimeString(meeting.endTime);
    // If meeting starts at this hour
    if (startHour === timeSlotHour) return true;
    // If meeting spans this hour (starts before and ends after)
    if (startHour < timeSlotHour && endHour > timeSlotHour) return true;
    return false;
  };
  // Calculate the duration of a meeting in hours
  const getMeetingDurationHours = (meeting: any) => {
    if (meeting.name === 'Available') return 0;
    const startTime = parseTime(meeting.startTime);
    const endTime = parseTime(meeting.endTime);
    const startMinutes = startTime.hours * 60 + startTime.minutes;
    const endMinutes = endTime.hours * 60 + endTime.minutes;
    return Math.round((endMinutes - startMinutes) / 60);
  };
  // Function to get the meeting for a room at a specific time slot
  // This handles meetings that span multiple hours
  const getMeetingForRoomAndTime = (room: string, timeSlot: string) => {
    // Get all meetings for this room
    const roomMeetings = recentMeetings.filter(meeting => meeting.room === room);
    // Find meetings that start in or span across this time slot
    const relevantMeetings = roomMeetings.filter(meeting => meetingSpansTimeSlot(meeting, timeSlot));
    if (relevantMeetings.length === 0) {
      // Return an "Available" placeholder if no meetings
      return {
        name: 'Available',
        startTime: timeSlot,
        endTime: '',
        room: room,
        status: 'available'
      };
    }
    // If there's a meeting, check if it's a VIP meeting
    const meeting = relevantMeetings[0];
    if (meeting.isHighProfile) {
      // Only show this VIP meeting if it's the first VIP meeting overall
      if (firstVipMeeting && meeting.name === firstVipMeeting.name && meeting.startTime === firstVipMeeting.startTime && meeting.room === firstVipMeeting.room) {
        return meeting;
      } else {
        // Otherwise, return a non-VIP version of this meeting
        return {
          ...meeting,
          isHighProfile: false
        };
      }
    }
    // No VIP meetings, return the meeting
    return meeting;
  };
  // Determine if a meeting should be displayed in this time slot
  // We only want to show a meeting card at its starting time slot
  const shouldDisplayMeetingInTimeSlot = (meeting: any, timeSlot: string) => {
    if (meeting.name === 'Available') return true;
    const meetingStartHour = getHourFromTimeString(meeting.startTime);
    const timeSlotHour = getHourFromTimeString(timeSlot);
    return meetingStartHour === timeSlotHour;
  };
  return <div className="flex-1 p-2 overflow-auto flex flex-col">
      {/* Room headers - Added with 20% larger text */}
      <div className="border-b border-gray-300 py-2 px-3 bg-white dark:bg-gray-900 dark:border-gray-700 mb-2">
        <div className="grid grid-cols-5 gap-2">
          {/* Empty first column to align with time slots */}
          <div className="col-span-1"></div>
          {/* Room headers in columns 2-5 */}
          {rooms.map(room => <div key={room} className="col-span-1 flex justify-center">
              <h2 className="text-[2.4rem] font-bold dark:text-white">
                {room}
              </h2>
            </div>)}
        </div>
      </div>

      {/* Meeting Grid - Only show visible time slots */}
      <div className="space-y-0 flex-1">
        {visibleTimeSlots.map((timeSlot, index) => {
        // Determine background color based on index (even/odd)
        const rowBgColor = index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800';
        return <div key={timeSlot} className={`${rowBgColor} w-full py-2`}>
              <div className="grid grid-cols-5 gap-2">
                <SimplifiedTimeSlot time={timeSlot} currentTime={currentTime} />
                {rooms.map(room => {
              const meeting = getMeetingForRoomAndTime(room, timeSlot);
              // Skip rendering if this is a continuation of a multi-hour meeting
              // (except for the starting time slot)
              if (!shouldDisplayMeetingInTimeSlot(meeting, timeSlot)) {
                return <div key={`${room}-${timeSlot}-empty`} className="col-span-1"></div>;
              }
              // Calculate meeting duration for badges
              const duration = getMeetingDurationHours(meeting);
              const isLongMeeting = duration >= 2;
              return <div key={`${room}-${timeSlot}`} className="col-span-1">
                      <SimplifiedMeetingCard meeting={meeting} currentTime={currentTime} duration={duration} showDurationBadge={isLongMeeting} />
                    </div>;
            })}
              </div>
            </div>;
      })}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-4 mb-2 flex justify-center gap-4">
        <Link to="/alternative" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800">
          <span>Try alternative view</span>
          <ArrowRightIcon size={16} />
        </Link>
        <Link to="/past-meetings" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800">
          <span>Past meetings</span>
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>;
};
export default SimplifiedView;