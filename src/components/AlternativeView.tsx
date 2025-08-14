import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ClockIcon, MapPinIcon, CalendarIcon, ArrowRightIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
interface AlternativeViewProps {
  currentTime: Date;
}
const AlternativeView: React.FC<AlternativeViewProps> = ({
  currentTime
}) => {
  const meetingData = getMeetingData();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  // Parse time from meeting
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(/(?=[AP]M)/);
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    const isPM = period === 'PM' && hours !== 12;
    return {
      hours: isPM ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours,
      minutes: minutes || 0
    };
  };
  // Calculate meeting status
  const getMeetingStatus = (meeting: any) => {
    const startTime = parseTime(meeting.startTime);
    const endTime = meeting.endTime ? parseTime(meeting.endTime) : null;
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    const endTimeInMinutes = endTime ? endTime.hours * 60 + endTime.minutes : startTimeInMinutes + 60;
    // Check if meeting is more than 2 hours in the past
    if (currentTimeInMinutes - startTimeInMinutes >= 120) {
      return 'past-history';
    }
    if (meeting.name === 'Available') {
      return 'available';
    } else if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
      return 'active';
    } else if (currentTimeInMinutes >= endTimeInMinutes) {
      return 'past';
    } else {
      return 'upcoming';
    }
  };
  // Filter meetings - exclude those that are more than 2 hours in the past
  const currentMeetings = meetingData.filter(meeting => getMeetingStatus(meeting) === 'active');
  const upcomingMeetings = meetingData.filter(meeting => getMeetingStatus(meeting) === 'upcoming' || getMeetingStatus(meeting) === 'past').sort((a, b) => {
    const aTime = parseTime(a.startTime);
    const bTime = parseTime(b.startTime);
    return aTime.hours * 60 + aTime.minutes - (bTime.hours * 60 + bTime.minutes);
  });
  // For TV display, we'll show more upcoming meetings (up to 9) instead of splitting into "next" and "later"
  const nextMeetings = upcomingMeetings.slice(0, 9);
  // Group upcoming meetings by room for better organization on TV display
  const meetingsByRoom: Record<string, any[]> = {};
  // Ensure rooms are in the specified order
  const roomOrder = ['FDR', 'Executive', 'Breakout 1', 'Breakout 2'];
  nextMeetings.forEach(meeting => {
    if (!meetingsByRoom[meeting.room]) {
      meetingsByRoom[meeting.room] = [];
    }
    meetingsByRoom[meeting.room].push(meeting);
  });
  // Sort the rooms according to the specified order
  const sortedRooms = Object.keys(meetingsByRoom).sort((a, b) => {
    return roomOrder.indexOf(a) - roomOrder.indexOf(b);
  });
  return <div className="flex-1 p-4 md:p-6 h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1 gap-4 md:gap-6">
        {/* Current Meetings Section - Stacked on mobile */}
        <section className="flex-1">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <ClockIcon className="text-[#005ea2] dark:text-[#4d9eff]" size={24} />
            <h2 className="text-xl md:text-3xl font-bold dark:text-white">
              Happening Now
            </h2>
          </div>
          {currentMeetings.length > 0 ? <div className="grid grid-cols-1 gap-3 md:gap-4">
              {currentMeetings.map(meeting => <div key={`${meeting.name}-${meeting.startTime}-${meeting.room}`} className="bg-[#e6f3ff] dark:bg-[#0a2e4f] border-2 border-[#005ea2] dark:border-[#2c79c7] rounded-lg p-3 md:p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-1 md:mb-2">
                    <MapPinIcon size={18} className="text-[#005ea2] dark:text-[#4d9eff]" />
                    <span className="text-lg md:text-2xl font-bold text-[#005ea2] dark:text-[#4d9eff]">
                      {meeting.room}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 dark:text-white">
                    {meeting.name}
                  </h3>
                  <div className="flex items-center gap-1 md:gap-2">
                    <ClockIcon size={16} className="dark:text-gray-300" />
                    <p className="text-base md:text-xl dark:text-gray-300">
                      {meeting.startTime} - {meeting.endTime}
                    </p>
                  </div>
                </div>)}
            </div> : <div className="bg-[#f0fff4] dark:bg-[#0a2e18] border-2 border-dashed border-[#00a91c] dark:border-[#2c9d42] rounded-lg p-3 md:p-6 text-center">
              <p className="text-lg md:text-2xl font-bold text-[#00a91c] dark:text-[#2c9d42]">
                All Rooms Available
              </p>
              <p className="text-base md:text-lg mt-1 md:mt-2 dark:text-gray-300">
                No meetings currently in progress
              </p>
            </div>}
        </section>
        {/* Upcoming Meetings Section - Stacked on mobile */}
        <section className="flex-1 mt-4 md:mt-0">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <CalendarIcon className="text-[#005ea2] dark:text-[#4d9eff]" size={24} />
            <h2 className="text-xl md:text-3xl font-bold dark:text-white">
              Coming Up Next
            </h2>
          </div>
          {sortedRooms.length > 0 ? <div className="grid grid-cols-1 gap-3 md:gap-4">
              {sortedRooms.map(room => <div key={room} className="border border-gray-300 dark:border-gray-700 rounded-lg p-2 md:p-4 dark:bg-gray-800">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-[#005ea2] dark:text-[#4d9eff]">
                    {room}
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    {meetingsByRoom[room].map(meeting => <div key={`${meeting.name}-${meeting.startTime}`} className="flex flex-col">
                        <h4 className="text-base md:text-xl font-bold dark:text-white">
                          {meeting.name}
                        </h4>
                        <p className="text-sm md:text-lg mt-0.5 md:mt-1 dark:text-gray-300">
                          {meeting.startTime}{' '}
                        </p>
                      </div>)}
                  </div>
                </div>)}
            </div> : <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 md:p-6 text-center">
              <p className="text-lg md:text-2xl font-bold text-gray-500 dark:text-gray-400">
                No Upcoming Meetings
              </p>
              <p className="text-base md:text-lg mt-1 md:mt-2 dark:text-gray-300">
                All rooms available for the rest of the day
              </p>
            </div>}
        </section>
      </div>
      {/* Navigation Buttons */}
      <div className="mt-4 md:mt-6 mb-2 md:mb-4 flex justify-center gap-3 md:gap-4">
        <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 md:gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-sm md:text-base">
          <ArrowLeftIcon size={14} />
          <span>Simplified view</span>
        </Link>
        <Link to="/past-meetings" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 md:gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-sm md:text-base">
          <span>Past meetings</span>
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </div>;
};
export default AlternativeView;