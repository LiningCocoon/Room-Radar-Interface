import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, ClockIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import { isOldMeeting, parseTime } from '../utils/timeUtils';
interface PastMeetingsViewProps {
  currentTime: Date;
}
const PastMeetingsView: React.FC<PastMeetingsViewProps> = ({
  currentTime
}) => {
  const meetingData = getMeetingData();
  // Filter past meetings (more than 2 hours old)
  const pastMeetings = meetingData.filter(meeting => meeting.name !== 'Available' && isOldMeeting(meeting, currentTime)).sort((a, b) => {
    // Sort by most recent first
    const aTime = parseTime(a.startTime);
    const bTime = parseTime(b.startTime);
    return bTime.hours * 60 + bTime.minutes - (aTime.hours * 60 + aTime.minutes);
  });
  // Group past meetings by room
  const meetingsByRoom: Record<string, any[]> = {};
  const roomOrder = ['FDR', 'Executive', 'Breakout 1', 'Breakout 2'];
  pastMeetings.forEach(meeting => {
    if (!meetingsByRoom[meeting.room]) {
      meetingsByRoom[meeting.room] = [];
    }
    meetingsByRoom[meeting.room].push(meeting);
  });
  // Sort rooms according to the specified order
  const sortedRooms = Object.keys(meetingsByRoom).sort((a, b) => {
    return roomOrder.indexOf(a) - roomOrder.indexOf(b);
  });
  return <div className="flex-1 p-4 md:p-6 overflow-auto flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <CheckIcon className="text-gray-600 dark:text-gray-300" size={24} />
          <h2 className="text-xl md:text-3xl font-bold dark:text-white">
            Past Meetings (2+ hours ago)
          </h2>
        </div>
        {pastMeetings.length > 0 ? <div className="grid grid-cols-1 gap-4">
            {sortedRooms.map(room => <div key={room} className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 md:p-5 dark:bg-gray-800">
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  {room}
                </h3>
                <div className="space-y-3 md:space-y-4">
                  {meetingsByRoom[room].map(meeting => <div key={`${meeting.name}-${meeting.startTime}`} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4">
                      <h4 className="text-base md:text-lg font-bold dark:text-white">
                        {meeting.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <ClockIcon size={14} className="text-gray-500 dark:text-gray-400" />
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                          {meeting.startTime} - {meeting.endTime}
                        </p>
                      </div>
                    </div>)}
                </div>
              </div>)}
          </div> : <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 md:p-6 text-center">
            <p className="text-lg md:text-xl font-bold text-gray-500 dark:text-gray-400">
              No Past Meetings
            </p>
            <p className="text-base md:text-lg mt-2 text-gray-500 dark:text-gray-400">
              There are no meetings from more than 2 hours ago
            </p>
          </div>}
      </div>
      {/* Navigation Buttons */}
      <div className="mt-auto mb-2 flex justify-center gap-3 md:gap-4">
        <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800">
          <ArrowLeftIcon size={16} />
          <span>Back to simplified view</span>
        </Link>
      </div>
    </div>;
};
export default PastMeetingsView;