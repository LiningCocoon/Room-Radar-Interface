import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import { isOldMeeting, parseTime } from '../utils/timeUtils';
import AVSupportIcon from './AVSupportIcon';
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
  roomOrder.forEach(room => {
    meetingsByRoom[room] = pastMeetings.filter(meeting => meeting.room === room);
  });
  return <div className="flex-1 p-3 overflow-hidden flex flex-col">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <CheckIcon className="text-gray-600 dark:text-gray-300" size={28} />
          <h2 className="text-2xl font-bold dark:text-white">
            Past Meetings (2+ hours ago)
          </h2>
        </div>
        {pastMeetings.length > 0 ? <div className="overflow-hidden">
            <table className="w-full border-collapse text-lg">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="p-3 border-2 border-gray-400 dark:border-gray-500 text-left font-extrabold">
                    Room
                  </th>
                  <th className="p-3 border-2 border-gray-400 dark:border-gray-500 text-left font-extrabold">
                    Meeting
                  </th>
                  <th className="p-3 border-2 border-gray-400 dark:border-gray-500 text-left font-extrabold">
                    Time
                  </th>
                  <th className="p-3 border-2 border-gray-400 dark:border-gray-500 text-center w-16 font-extrabold">
                    AV
                  </th>
                </tr>
              </thead>
              <tbody>
                {pastMeetings.map((meeting, index) => <tr key={`${meeting.name}-${meeting.startTime}`} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-900'}>
                    <td className="p-3 border-2 border-gray-400 dark:border-gray-500 font-bold text-xl">
                      {meeting.room}
                    </td>
                    <td className="p-3 border-2 border-gray-400 dark:border-gray-500 font-medium">
                      {meeting.name}
                    </td>
                    <td className="p-3 border-2 border-gray-400 dark:border-gray-500 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {meeting.startTime} - {meeting.endTime}
                    </td>
                    <td className="p-3 border-2 border-gray-400 dark:border-gray-500 text-center">
                      {meeting.avSupport && <div className="flex justify-center">
                          <AVSupportIcon size={24} className="text-gray-500 dark:text-gray-400" />
                        </div>}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div> : <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-gray-500 dark:text-gray-400">
              No Past Meetings
            </p>
            <p className="text-lg mt-2 text-gray-500 dark:text-gray-400">
              There are no meetings from more than 2 hours ago
            </p>
          </div>}
      </div>
      {/* Room Summary Section - Increased size */}
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2 dark:text-white">Room Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-base">
          {roomOrder.map(room => {
          const roomMeetings = meetingsByRoom[room] || [];
          return <div key={room} className="border-2 border-gray-400 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                <div className="font-bold text-xl">{room}</div>
                <div className="text-gray-600 dark:text-gray-400 text-lg">
                  {roomMeetings.length} past meetings
                </div>
              </div>;
        })}
        </div>
      </div>
      {/* Total Summary - Increased size */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-lg mb-4">
        <div className="font-bold text-xl">
          Total past meetings shown: {pastMeetings.length}
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-base mt-1">
          Showing meetings that ended 2+ hours ago
        </div>
      </div>
      {/* Navigation Buttons - Increased size */}
      <div className="mt-auto mb-2 flex justify-center">
        <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-3 py-3 px-5 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold">
          <ArrowLeftIcon size={24} />
          <span>Back to simplified view</span>
        </Link>
      </div>
    </div>;
};
export default PastMeetingsView;