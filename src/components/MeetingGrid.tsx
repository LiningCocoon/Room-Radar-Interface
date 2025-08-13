import React from 'react';
import TimeSlot from './TimeSlot';
import MeetingCard from './MeetingCard';
import { getMeetingData } from '../utils/data';
interface MeetingGridProps {
  currentTime: Date;
}
const MeetingGrid: React.FC<MeetingGridProps> = ({
  currentTime
}) => {
  const rooms = ['FDR', 'Executive', 'Breakout 1', 'Breakout 2'];
  const timeSlots = ['8:00AM', '9:00AM', '10:00AM', '12:00PM', '2:00PM', '3:00PM', '5:00PM'];
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
  return <div className="flex-1 p-4 overflow-auto">
      {/* Room Headers */}
      <div className="grid grid-cols-5 gap-4 mb-4 sticky top-0 bg-white z-10">
        <div className="col-span-1"></div>
        {rooms.map(room => <div key={room} className="col-span-1">
            <h2 className="text-3xl font-bold text-center py-4">{room}</h2>
          </div>)}
      </div>
      {/* Meeting Grid */}
      <div className="space-y-2">
        {timeSlots.map(timeSlot => {
        const condensed = isCondensedTimeSlot(timeSlot);
        return <div key={timeSlot} className={`grid grid-cols-5 gap-4 ${condensed ? 'mb-2' : 'mb-6'}`}>
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
            </div>;
      })}
      </div>
    </div>;
};
export default MeetingGrid;