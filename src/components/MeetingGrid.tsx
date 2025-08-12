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
  return <div className="flex-1 p-4">
      {/* Room Headers */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="col-span-1"></div>
        {rooms.map(room => <div key={room} className="col-span-1">
            <h2 className="text-3xl font-bold text-center py-4">{room}</h2>
          </div>)}
      </div>
      {/* Meeting Grid */}
      {timeSlots.map(timeSlot => <div key={timeSlot} className="grid grid-cols-5 gap-4 mb-8">
          <TimeSlot time={timeSlot} currentTime={currentTime} />
          {rooms.map(room => {
        const meetings = meetingData.filter(meeting => meeting.room === room && meeting.startTime.split(':')[0] === timeSlot.split(':')[0]);
        return <div key={`${room}-${timeSlot}`} className="col-span-1">
                {meetings.length > 0 ? meetings.map(meeting => <MeetingCard key={`${meeting.name}-${meeting.startTime}`} meeting={meeting} currentTime={currentTime} />) : <MeetingCard meeting={{
            name: 'Available',
            startTime: timeSlot,
            endTime: '',
            room: room,
            status: 'available'
          }} currentTime={currentTime} />}
              </div>;
      })}
        </div>)}
    </div>;
};
export default MeetingGrid;