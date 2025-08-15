import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import SimplifiedTimeSlot from './SimplifiedTimeSlot';
import SimplifiedMeetingCard from './SimplifiedMeetingCard';
import { isOldMeeting, parseTime, timeToMinutes } from '../utils/timeUtils';
interface SimplifiedViewProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const SimplifiedView: React.FC<SimplifiedViewProps> = ({
  currentTime,
  isYesterday = false
}) => {
  // Updated room names: Reordered to put Small after Executive and before Breakout A
  const rooms = ['JFK', 'Executive', 'Small', 'Breakout A', 'Breakout B'];
  // Updated time slots to military time
  const allTimeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  // Reference for auto-scrolling
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  // Function to calculate the 2-hour cutoff time slot
  const getTwoHourCutoffTimeSlot = () => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const twoHoursAgo = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000);
    const cutoffHour = twoHoursAgo.getHours();
    // Find the matching time slot
    const cutoffTimeSlot = allTimeSlots.find(slot => {
      const hourPart = parseInt(slot.split(':')[0]);
      return hourPart === cutoffHour;
    });
    return cutoffTimeSlot;
  };
  // Auto-scroll to the 2-hour cutoff on load (only for current day view)
  useEffect(() => {
    if (!isYesterday) {
      const cutoffTimeSlot = getTwoHourCutoffTimeSlot();
      if (cutoffTimeSlot && scrollTargetRef.current) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          scrollTargetRef.current?.scrollIntoView({
            behavior: 'instant',
            block: 'start'
          });
        }, 100);
      }
    }
  }, [isYesterday]);
  // Use all time slots
  const displayTimeSlots = allTimeSlots;
  // Get meetings data
  const allMeetings = getMeetingData();
  // Convert legacy room names to new names for compatibility
  const convertedMeetings = allMeetings.map(meeting => {
    let newRoom = meeting.room;
    if (meeting.room === 'Breakout 1') newRoom = 'Breakout A';
    if (meeting.room === 'Breakout 2') newRoom = 'Breakout B';
    return {
      ...meeting,
      room: newRoom
    };
  });
  // Find the first VIP meeting across all rooms and time slots
  const allVipMeetings = convertedMeetings.filter(m => m.isHighProfile);
  const firstVipMeeting = allVipMeetings.length > 0 ? allVipMeetings[0] : null;
  // Helper to get hour from time string
  const getHourFromTimeString = (timeStr: string) => {
    // For military time format
    if (timeStr.includes(':') && !timeStr.includes('AM') && !timeStr.includes('PM')) {
      return parseInt(timeStr.split(':')[0]);
    }
    // For AM/PM format
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
  const getMeetingForRoomAndTime = (room: string, timeSlot: string) => {
    // Get all meetings for this room
    const roomMeetings = convertedMeetings.filter(meeting => meeting.room === room);
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
    // Return the meeting with its original VIP status
    return relevantMeetings[0];
  };
  // Determine if a meeting should be displayed in this time slot
  const shouldDisplayMeetingInTimeSlot = (meeting: any, timeSlot: string) => {
    if (meeting.name === 'Available') return true;
    const meetingStartHour = getHourFromTimeString(meeting.startTime);
    const timeSlotHour = getHourFromTimeString(timeSlot);
    return meetingStartHour === timeSlotHour;
  };
  // Determine if a meeting starts in the first half (:00/:15) or second half (:30/:45) of the hour
  const getStartPositionInHour = (meeting: any) => {
    if (meeting.name === 'Available') return 'top';
    const minutesPart = parseTime(meeting.startTime).minutes;
    return minutesPart < 30 ? 'top' : 'bottom';
  };
  return <div className="flex-1 p-2 overflow-auto flex flex-col h-full">
      {/* Fixed header positioned directly below the main header with reduced padding */}
      <div className="fixed top-[52px] left-0 right-0 z-[9999] border-b border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 shadow-md" style={{
      padding: '0.5rem 0.75rem' // Reduced padding by ~15%
    }}>
        <div className="grid grid-cols-6 gap-2">
          {/* Empty first column to align with time slots */}
          <div className="col-span-1"></div>
          {/* Room headers in columns 2-6 */}
          {rooms.map(room => <div key={room} className="col-span-1 flex justify-center items-center">
              <h2 className="text-[2.4rem] font-bold dark:text-white">
                {room}
              </h2>
            </div>)}
        </div>
      </div>

      {/* Add padding to prevent content from being hidden under the fixed header */}
      <div className="pt-[80px]">
        {/* Meeting Grid - Show all time slots */}
        <div className="space-y-0 flex-1">
          {displayTimeSlots.map((timeSlot, index) => {
          // Determine background color based on index (even/odd)
          const rowBgColor = index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800';
          // Determine if this is the cutoff slot for auto-scrolling
          const isCutoffSlot = !isYesterday && timeSlot === getTwoHourCutoffTimeSlot();
          return <div key={timeSlot} className={`${rowBgColor} w-full py-2`} ref={isCutoffSlot ? scrollTargetRef : null}>
                <div className="grid grid-cols-6 gap-2">
                  <SimplifiedTimeSlot time={timeSlot} currentTime={currentTime} militaryTime={true} />
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
                // Determine vertical position based on start time
                const startPosition = getStartPositionInHour(meeting);
                return <div key={`${room}-${timeSlot}`} className={`col-span-1 relative ${startPosition === 'bottom' ? 'pt-10' : ''}`}>
                        <SimplifiedMeetingCard meeting={meeting} currentTime={currentTime} duration={duration} showDurationBadge={isLongMeeting} startPosition={startPosition} militaryTime={true} isYesterday={isYesterday} />
                      </div>;
              })}
                </div>
              </div>;
        })}
        </div>
      </div>

      {/* Navigation Buttons - hide simplified view link on mobile */}
      <div className="mt-4 mb-2 flex justify-center gap-4">
        <Link to="/alternative" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 md:inline-flex hidden">
          <span>Try alternative view</span>
          <ArrowRightIcon size={16} />
        </Link>
        <Link to="/past-meetings" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 md:inline-flex hidden">
          <span>Past meetings</span>
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>;
};
export default SimplifiedView;