import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import TimeSlot from './TimeSlot';
import MeetingCard from './MeetingCard';
import { getMeetingData } from '../utils/data';
import { parseTime } from '../utils/timeUtils';
interface MeetingGridProps {
  currentTime: Date;
}
const MeetingGrid: React.FC<MeetingGridProps> = ({
  currentTime
}) => {
  // Ensure rooms are in the specified order
  const rooms = ['JFK', 'Executive', 'Breakout 1', 'Breakout 2'];
  const timeSlots = ['7:00AM', '8:00AM', '9:00AM', '10:00AM', '11:00AM', '12:00PM', '1:00PM', '2:00PM', '3:00PM', '4:00PM', '5:00PM', '6:00PM', '7:00PM'];
  const meetingData = getMeetingData();
  const currentHour = currentTime.getHours();
  // Find the first VIP meeting across all meetings
  const allVipMeetings = meetingData.filter(m => m.isHighProfile);
  const firstVipMeeting = allVipMeetings.length > 0 ? allVipMeetings[0] : null;
  // Determine if a time slot should be condensed
  const isCondensedTimeSlot = (timeSlot: string) => {
    const hour = parseInt(timeSlot.split(':')[0]);
    const isPM = timeSlot.includes('PM');
    const slotHour = isPM && hour !== 12 ? hour + 12 : hour;
    // Don't condense current hour or after-hours slots (before 9AM or 6PM or later)
    if (slotHour === currentHour) return false;
    if (slotHour >= 18 || slotHour < 9) return false; // 6PM or later, or before 9AM
    // Check if this time slot has few or no meetings
    const meetingsInSlot = meetingData.filter(meeting => {
      const meetingHour = parseInt(meeting.startTime.split(':')[0]);
      const meetingIsPM = meeting.startTime.includes('PM');
      const meetingSlotHour = meetingIsPM && meetingHour !== 12 ? meetingHour + 12 : meetingHour;
      return meetingSlotHour === slotHour;
    });
    // If 2 or fewer meetings in this slot, condense it
    return meetingsInSlot.length <= 2;
  };
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
  // Get meetings for a room that either start in or span across the given time slot
  const getMeetingsForRoomAndTimeSlot = (room: string, timeSlot: string) => {
    // Get all meetings for this room
    const roomMeetings = meetingData.filter(meeting => meeting.room === room);
    // Find meetings that start in or span across this time slot
    const relevantMeetings = roomMeetings.filter(meeting => meetingSpansTimeSlot(meeting, timeSlot));
    // If no meetings found, return an "Available" placeholder
    if (relevantMeetings.length === 0) {
      return [{
        name: 'Available',
        startTime: timeSlot,
        endTime: '',
        room: room,
        status: 'available'
      }];
    }
    // Process VIP status
    return relevantMeetings.map(meeting => {
      if (meeting.isHighProfile) {
        if (firstVipMeeting && meeting.name === firstVipMeeting.name && meeting.startTime === firstVipMeeting.startTime && meeting.room === firstVipMeeting.room) {
          return meeting; // Keep VIP status for the first VIP meeting only
        } else {
          return {
            ...meeting,
            isHighProfile: false
          }; // Remove VIP status
        }
      }
      return meeting;
    });
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
  // Determine if a meeting should be displayed in this time slot
  // We only want to show a meeting card at its starting time slot
  const shouldDisplayMeetingInTimeSlot = (meeting: any, timeSlot: string) => {
    if (meeting.name === 'Available') return true;
    const meetingStartHour = getHourFromTimeString(meeting.startTime);
    const timeSlotHour = getHourFromTimeString(timeSlot);
    return meetingStartHour === timeSlotHour;
  };
  return <div className="flex-1 p-2 overflow-auto flex flex-col">
      {/* Room headers are now in the Header component */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 pb-1">
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-1"></div>
          {/* Room headers removed from here and moved to Header.tsx */}
        </div>
      </div>

      {/* Meeting Grid */}
      <div className="space-y-0 flex-1">
        {timeSlots.map((timeSlot, index) => {
        const condensed = isCondensedTimeSlot(timeSlot);
        // Determine background color based on index (even/odd)
        const rowBgColor = index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800';
        return <div key={timeSlot} className={`${rowBgColor} w-full ${condensed ? 'py-1' : 'py-2'}`}>
              <div className="grid grid-cols-5 gap-4">
                <TimeSlot time={timeSlot} currentTime={currentTime} condensed={condensed} />
                {rooms.map(room => {
              const meetings = getMeetingsForRoomAndTimeSlot(room, timeSlot);
              // We'll only display one meeting per room/time slot
              const meeting = meetings[0];
              // Skip rendering if this is a continuation of a multi-hour meeting
              // (except for the starting time slot)
              if (!shouldDisplayMeetingInTimeSlot(meeting, timeSlot)) {
                return <div key={`${room}-${timeSlot}-empty`} className="col-span-1"></div>;
              }
              // Calculate meeting duration for badges
              const duration = getMeetingDurationHours(meeting);
              const isLongMeeting = duration >= 2;
              return <div key={`${room}-${timeSlot}`} className="col-span-1">
                      <MeetingCard key={`${meeting.name}-${meeting.startTime}`} meeting={meeting} currentTime={currentTime} condensed={condensed} duration={duration} showDurationBadge={isLongMeeting} />
                    </div>;
            })}
              </div>
            </div>;
      })}
      </div>

      {/* View Buttons */}
      <div className="mt-4 mb-2 flex justify-center gap-4">
        <Link to="/alternative" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800">
          <span>Try alternative view</span>
          <ArrowRightIcon size={16} />
        </Link>
        <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800">
          <span>Try simplified view</span>
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>;
};
export default MeetingGrid;