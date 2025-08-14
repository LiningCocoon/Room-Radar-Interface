import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import SimplifiedTimeSlot from './SimplifiedTimeSlot';
import SimplifiedMeetingCard from './SimplifiedMeetingCard';
interface SimplifiedViewProps {
  currentTime: Date;
}
const SimplifiedView: React.FC<SimplifiedViewProps> = ({
  currentTime
}) => {
  // Ensure rooms are in the specified order
  const rooms = ['FDR', 'Executive', 'Breakout 1', 'Breakout 2'];
  const timeSlots = ['7:00AM', '8:00AM', '9:00AM', '10:00AM', '12:00PM', '2:00PM', '3:00PM', '5:00PM'];
  const meetingData = getMeetingData();
  // Function to get the first meeting for a room at a specific time slot
  const getFirstMeetingForRoomAndTime = (room: string, timeSlot: string) => {
    const timeHour = timeSlot.split(':')[0];
    const meetings = meetingData.filter(meeting => meeting.room === room && meeting.startTime.split(':')[0] === timeHour);
    // Return the first meeting or create an "Available" placeholder
    return meetings.length > 0 ? meetings[0] : {
      name: 'Available',
      startTime: timeSlot,
      endTime: '',
      room: room,
      status: 'available'
    };
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

      {/* Meeting Grid */}
      <div className="space-y-0 flex-1">
        {timeSlots.map((timeSlot, index) => {
        // Determine background color based on index (even/odd)
        const rowBgColor = index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800';
        return <div key={timeSlot} className={`${rowBgColor} w-full py-2`}>
              <div className="grid grid-cols-5 gap-2">
                <SimplifiedTimeSlot time={timeSlot} currentTime={currentTime} />
                {rooms.map(room => {
              const meeting = getFirstMeetingForRoomAndTime(room, timeSlot);
              return <div key={`${room}-${timeSlot}`} className="col-span-1">
                      <SimplifiedMeetingCard meeting={meeting} currentTime={currentTime} />
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