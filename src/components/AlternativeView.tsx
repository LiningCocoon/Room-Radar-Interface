import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon, CalendarIcon, ArrowRightIcon, CheckCircleIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import AVSupportIcon from './AVSupportIcon';
import { parseTime } from '../utils/timeUtils';
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
  // Calculate meeting status
  const getMeetingStatus = (meeting: any) => {
    const startTime = parseTime(meeting.startTime);
    const endTime = meeting.endTime ? parseTime(meeting.endTime) : null;
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    const endTimeInMinutes = endTime ? endTime.hours * 60 + endTime.minutes : startTimeInMinutes + 60;
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
  // Get minutes until a meeting starts
  const getMinutesUntilMeeting = (meeting: any) => {
    const startTime = parseTime(meeting.startTime);
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    return startTimeInMinutes - currentTimeInMinutes;
  };
  // Calculate end time in minutes
  const getEndTimeInMinutes = (meeting: any) => {
    if (!meeting.endTime) return null;
    const endTime = parseTime(meeting.endTime);
    return endTime.hours * 60 + endTime.minutes;
  };
  // Filter meetings by status
  const activeMeetings = meetingData.filter(m => getMeetingStatus(m) === 'active');
  const upcomingMeetings = meetingData.filter(m => getMeetingStatus(m) === 'upcoming');
  // Find the first VIP meeting overall
  const allVipMeetings = meetingData.filter(m => m.isHighProfile);
  const firstVipMeeting = allVipMeetings.length > 0 ? allVipMeetings[0] : null;
  // Process meetings to handle VIP status - only show the first VIP meeting
  const processVipStatus = (meetings: any[]) => {
    return meetings.map(meeting => {
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
  // Process all meetings to handle VIP status
  const processedActiveMeetings = processVipStatus(activeMeetings);
  const processedUpcomingMeetings = processVipStatus(upcomingMeetings);
  // Group meetings by room
  const rooms = ['FDR', 'Executive', 'Breakout 1', 'Breakout 2'];
  const meetingsByRoom: Record<string, any[]> = {};
  rooms.forEach(room => {
    meetingsByRoom[room] = processedUpcomingMeetings.filter(m => m.room === room);
  });
  // Find next available room and time
  const findNextAvailable = () => {
    // Sort all active meetings by end time
    const sortedActive = [...processedActiveMeetings].sort((a, b) => {
      const aEnd = getEndTimeInMinutes(a) || 0;
      const bEnd = getEndTimeInMinutes(b) || 0;
      return aEnd - bEnd;
    });
    // If there are active meetings, the next available time is after the first one ends
    if (sortedActive.length > 0) {
      const firstToEnd = sortedActive[0];
      const endTimeMinutes = getEndTimeInMinutes(firstToEnd) || 0;
      // Convert end time back to display format
      const endHour = Math.floor(endTimeMinutes / 60);
      const endMinute = endTimeMinutes % 60;
      const isPM = endHour >= 12;
      const displayHour = isPM ? endHour === 12 ? 12 : endHour - 12 : endHour === 0 ? 12 : endHour;
      const amPm = isPM ? 'PM' : 'AM';
      return {
        time: `${displayHour}:${endMinute.toString().padStart(2, '0')}${amPm}`,
        room: firstToEnd.room,
        minutesUntil: endTimeMinutes - currentTimeInMinutes
      };
    }
    // If there are no active meetings, find rooms that are currently available
    const availableRooms = rooms.filter(room => !processedActiveMeetings.some(m => m.room === room));
    if (availableRooms.length > 0) {
      return {
        time: 'Now',
        room: availableRooms[0],
        minutesUntil: 0
      };
    }
    return null;
  };
  const nextAvailable = findNextAvailable();
  return <div className="flex-1 p-4 h-screen flex flex-col overflow-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Current Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="text-lg text-gray-600 dark:text-gray-300">
              Active Meetings
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {processedActiveMeetings.length}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
            <div className="text-lg text-gray-600 dark:text-gray-300">
              Starting Soon (15m)
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {processedUpcomingMeetings.filter(m => getMinutesUntilMeeting(m) <= 15).length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <div className="text-lg text-gray-600 dark:text-gray-300">
              Next Available
            </div>
            {nextAvailable ? <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {nextAvailable.room} at {nextAvailable.time}
              </div> : <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                None
              </div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            Active Meetings
          </h2>
          {processedActiveMeetings.length > 0 ? <div className="space-y-4">
              {processedActiveMeetings.map((meeting, idx) => <div key={idx} className={`p-4 rounded-lg ${meeting.isHighProfile ? 'bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500' : 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xl font-bold dark:text-white">
                        {meeting.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 mt-1">
                        {meeting.startTime} - {meeting.endTime}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {meeting.isHighProfile && <span className="text-red-500 text-2xl mr-2 group relative">
                          ★{/* Tooltip */}
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                            VIP meeting
                            <div className="absolute top-full right-2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </span>}
                      {meeting.avSupport && <AVSupportIcon size={24} className={meeting.isHighProfile ? 'text-red-500' : 'text-blue-500'} />}
                    </div>
                  </div>
                  <div className="mt-2 text-gray-700 dark:text-gray-300 font-medium">
                    {meeting.room}
                  </div>
                </div>)}
            </div> : <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No active meetings at this time
            </div>}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            Starting Soon
          </h2>
          {processedUpcomingMeetings.filter(m => getMinutesUntilMeeting(m) <= 30).length > 0 ? <div className="space-y-4">
              {processedUpcomingMeetings.filter(m => getMinutesUntilMeeting(m) <= 30).sort((a, b) => getMinutesUntilMeeting(a) - getMinutesUntilMeeting(b)).slice(0, 4).map((meeting, idx) => <div key={idx} className={`p-4 rounded-lg ${meeting.isHighProfile ? 'bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500' : meeting.avSupport && getMinutesUntilMeeting(meeting) <= 15 ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500' : 'bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-400'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xl font-bold dark:text-white">
                          {meeting.name}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 mt-1">
                          {meeting.startTime} - {meeting.endTime}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {meeting.isHighProfile && <span className="text-red-500 text-2xl mr-2">★</span>}
                        {meeting.avSupport && <AVSupportIcon size={24} className={meeting.isHighProfile ? 'text-red-500' : getMinutesUntilMeeting(meeting) <= 15 ? 'text-yellow-500' : 'text-gray-500'} />}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div className="text-gray-700 dark:text-gray-300 font-medium">
                        {meeting.room}
                      </div>
                      <div className="font-bold text-gray-700 dark:text-gray-300">
                        In {getMinutesUntilMeeting(meeting)} min
                      </div>
                    </div>
                  </div>)}
            </div> : <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No meetings starting in the next 30 minutes
            </div>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Room Availability
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rooms.map(room => {
          const activeInRoom = processedActiveMeetings.find(m => m.room === room);
          const nextInRoom = processedUpcomingMeetings.filter(m => m.room === room).sort((a, b) => getMinutesUntilMeeting(a) - getMinutesUntilMeeting(b))[0];
          return <div key={room} className={`p-4 rounded-lg ${activeInRoom ? activeInRoom.isHighProfile ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <div className="text-xl font-bold dark:text-white">{room}</div>
                {activeInRoom ? <div>
                    <div className="text-lg font-medium mt-2 dark:text-white">
                      {activeInRoom.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Until {activeInRoom.endTime}
                    </div>
                  </div> : nextInRoom ? <div>
                    <div className="text-lg font-medium mt-2 text-green-700 dark:text-green-400">
                      Available
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Next: {nextInRoom.startTime}
                    </div>
                  </div> : <div className="text-lg font-medium mt-2 text-green-700 dark:text-green-400">
                    Available All Day
                  </div>}
              </div>;
        })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-auto mb-4 flex justify-center gap-6">
        <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-2 px-4 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-lg font-bold">
          <ArrowLeftIcon size={20} />
          <span>Simplified view</span>
        </Link>
        <Link to="/past-meetings" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-2 px-4 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-lg font-bold">
          <span>Past meetings</span>
          <ArrowRightIcon size={20} />
        </Link>
      </div>
    </div>;
};
export default AlternativeView;