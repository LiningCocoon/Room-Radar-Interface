import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import { isOldMeeting, parseTime } from '../utils/timeUtils';
import AVSupportIcon from './AVSupportIcon';
interface PastMeetingsViewProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const PastMeetingsView: React.FC<PastMeetingsViewProps> = ({
  currentTime,
  isYesterday = false
}) => {
  // State for tracking the selected date
  const [selectedDate, setSelectedDate] = useState<Date>(isYesterday ? new Date(currentTime.getTime() - 24 * 60 * 60 * 1000) : new Date(currentTime));
  // Initialize the selected date once on component mount
  useEffect(() => {
    // Only set initial date on first render
    const initialDate = isYesterday ? new Date(currentTime.getTime() - 24 * 60 * 60 * 1000) : new Date(currentTime);
    setSelectedDate(initialDate);
  }, []); // Empty dependency array means this only runs once on mount
  // Calculate if we're viewing today, yesterday, tomorrow, or another day
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isYesterdayView = selectedDate.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();
  const isTomorrowView = selectedDate.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();
  const isViewingPastDay = selectedDate < new Date(new Date().setHours(0, 0, 0, 0));
  // Format the selected date in a short, readable format
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  // Navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  const meetingData = getMeetingData();
  // Convert legacy room names to new names
  const convertedMeetings = meetingData.map(meeting => {
    let newRoom = meeting.room;
    if (meeting.room === 'Breakout 1') newRoom = 'Breakout A';
    if (meeting.room === 'Breakout 2') newRoom = 'Breakout B';
    return {
      ...meeting,
      room: newRoom
    };
  });
  // Filter past meetings (more than 2 hours old)
  const pastMeetings = convertedMeetings.filter(meeting => meeting.name !== 'Available' && isOldMeeting(meeting, currentTime)).sort((a, b) => {
    // Sort by most recent first
    const aTime = parseTime(a.startTime);
    const bTime = parseTime(b.startTime);
    return bTime.hours * 60 + bTime.minutes - (aTime.hours * 60 + aTime.minutes);
  });
  // Group past meetings by room
  const meetingsByRoom: Record<string, any[]> = {};
  // Updated room order with Small after Executive
  const roomOrder = ['JFK', 'Executive', 'Small', 'Breakout A', 'Breakout B'];
  roomOrder.forEach(room => {
    meetingsByRoom[room] = pastMeetings.filter(meeting => meeting.room === room);
  });
  // Convert time to military format
  const formatTimeToMilitary = (timeStr: string) => {
    const time = parseTime(timeStr);
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  };
  return <div className="flex-1 overflow-auto flex flex-col h-full">
      {/* New header with navigation controls */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 shadow-md">
        <div className="flex items-center px-4 py-3">
          {/* Navigation arrows with tooltips */}
          <button onClick={goToPreviousDay} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="View previous day" title="View previous day">
            <ChevronLeftIcon className="h-7 w-7 text-gray-700 dark:text-gray-300" />
          </button>
          {/* Next day button */}
          <button onClick={goToNextDay} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="View next day" title="View next day">
            <ChevronRightIcon className="h-7 w-7 text-gray-700 dark:text-gray-300" />
          </button>
          {/* Current date display - enlarged for better readability */}
          <h2 className="text-3xl font-bold dark:text-white mr-6">
            {formattedDate}
          </h2>
          {/* Today button - only show when not viewing today */}
          {!isToday && <button onClick={goToToday} className="mr-6 px-3 py-1 text-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors" aria-label="Return to today" title="Return to today">
              Today
            </button>}
          {/* Day indicators */}
          <div className="flex items-center gap-2">
            {isYesterdayView && <div className="px-3 py-1 text-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md">
                Yesterday
              </div>}
            {isToday && <div className="px-3 py-1 text-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
                Today
              </div>}
            {isTomorrowView && <div className="px-3 py-1 text-lg bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md">
                Tomorrow
              </div>}
          </div>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden under the fixed header */}
      <div className="pt-[80px] p-3 flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <CheckIcon className="text-gray-600 dark:text-gray-300" size={28} />
            <h2 className="text-2xl font-bold dark:text-white">
              Past Meetings (2+ hours ago)
            </h2>
          </div>
          {pastMeetings.length > 0 ? <div className="overflow-x-auto">
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
                        <div className="flex items-center">
                          {meeting.name}
                          {meeting.isHighProfile && <span className="ml-2 group relative">
                              <StarIcon size={18} className="text-[#c05600] dark:text-[#ffbe2e]" aria-label="VIP meeting" />
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                                VIP meeting
                                <div className="absolute top-full left-2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </span>}
                        </div>
                      </td>
                      <td className="p-3 border-2 border-gray-400 dark:border-gray-500 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatTimeToMilitary(meeting.startTime)} -{' '}
                        {formatTimeToMilitary(meeting.endTime)}
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
        {/* Room Summary Section - Improved mobile layout */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2 dark:text-white">
            Room Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-base">
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
        {/* Navigation Buttons */}
        <div className="mt-auto mb-2 flex justify-center">
          <Link to={window.innerWidth < 768 ? '/alternative' : '/simplified'} className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-3 py-3 px-5 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold">
            <ArrowLeftIcon size={24} />
            <span className="md:inline hidden">Back to simplified view</span>
            <span className="md:hidden inline">Back to dashboard</span>
          </Link>
        </div>
      </div>
    </div>;
};
export default PastMeetingsView;