import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import TimeSlot from './TimeSlot';
import MeetingCard from './MeetingCard';
import { getMeetingData } from '../utils/data';
interface MeetingGridProps {
  currentTime: Date;
}
const MeetingGrid: React.FC<MeetingGridProps> = ({
  currentTime
}) => {
  // Ensure rooms are in the specified order
  const rooms = ['FDR', 'Executive', 'Breakout 1', 'Breakout 2'];
  const timeSlots = ['7:00AM', '8:00AM', '9:00AM', '10:00AM', '12:00PM', '2:00PM', '3:00PM', '5:00PM'];
  const meetingData = getMeetingData();
  const currentHour = currentTime.getHours();
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
              const meetings = meetingData.filter(meeting => meeting.room === room && meeting.startTime.split(':')[0] === timeSlot.split(':')[0]);
              return <div key={`${room}-${timeSlot}`} className="col-span-1">
                      {meetings.length > 0 ? meetings.map(meeting => <MeetingCard key={`${meeting.name}-${meeting.startTime}`} meeting={meeting} currentTime={currentTime} condensed={condensed} />) : <MeetingCard meeting={{
                  name: 'Available',
                  startTime: timeSlot,
                  endTime: '',
                  room: room,
                  status: 'available'
                }} currentTime={currentTime} condensed={condensed} />}
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