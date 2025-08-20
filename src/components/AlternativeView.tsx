import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, UtensilsIcon, PhoneCallIcon, UsersIcon, CalendarIcon, StarIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import AVSupportIcon from './AVSupportIcon';
import { parseTime } from '../utils/timeUtils';
import { useTheme } from './ThemeContext';
interface AlternativeViewProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const AlternativeView: React.FC<AlternativeViewProps> = ({
  currentTime,
  isYesterday = false
}) => {
  const {
    isDarkMode,
    toggleDarkMode
  } = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // Format current time as HH:MM:SS in military time (24-hour format)
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  // State for tracking the selected date
  const [selectedDate, setSelectedDate] = useState<Date>(isYesterday ? new Date(currentTime.getTime() - 24 * 60 * 60 * 1000) : new Date(currentTime));
  // Initialize the selected date once on component mount
  useEffect(() => {
    const initialDate = isYesterday ? new Date(currentTime.getTime() - 24 * 60 * 60 * 1000) : new Date(currentTime);
    setSelectedDate(initialDate);
  }, []);
  // Calculate if we're viewing today, yesterday, tomorrow, or another day
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isYesterdayView = selectedDate.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();
  const isTomorrowView = selectedDate.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();
  const isViewingPastDay = selectedDate < new Date(new Date().setHours(0, 0, 0, 0));
  // Format the selected date to match SimplifiedView format (short format)
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
  // Get meeting data
  const meetingData = getMeetingData();
  // Helper function to format time to military format
  const formatTimeToMilitary = (timeStr: string) => {
    const time = parseTime(timeStr);
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  };
  // Calculate meeting status
  const getMeetingStatus = (meeting: any) => {
    if (isViewingPastDay) return 'past';
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTime = parseTime(meeting.startTime);
    const endTime = meeting.endTime ? parseTime(meeting.endTime) : null;
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    const endTimeInMinutes = endTime ? endTime.hours * 60 + endTime.minutes : startTimeInMinutes + 60;
    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
      return 'active';
    } else if (currentTimeInMinutes >= endTimeInMinutes) {
      return 'past';
    } else {
      return 'upcoming';
    }
  };
  // Get time until meeting starts
  const getTimeUntilMeeting = (meeting: any) => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTime = parseTime(meeting.startTime);
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    const minutesUntil = startTimeInMinutes - currentTimeInMinutes;
    if (minutesUntil <= 0) return 'Now';
    if (minutesUntil < 60) return `${minutesUntil}m`;
    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  // Get time until meeting ends
  const getTimeUntilFree = (meeting: any) => {
    if (!meeting.endTime) return '1h';
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const endTime = parseTime(meeting.endTime);
    const endTimeInMinutes = endTime.hours * 60 + endTime.minutes;
    const minutesUntil = endTimeInMinutes - currentTimeInMinutes;
    if (minutesUntil <= 0) return 'Now';
    if (minutesUntil < 60) return `${minutesUntil}m`;
    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  // Get time until next meeting
  const getTimeUntilNextMeeting = (meeting: any) => {
    return getTimeUntilMeeting(meeting);
  };
  // Filter meetings for today's VIP meetings
  const vipMeetingsToday = meetingData.filter(meeting => meeting.isHighProfile);
  // Past day meetings (for yesterday view)
  const pastDayMeetings = isViewingPastDay ? meetingData : [];
  // Room status calculations
  const rooms = ['JFK', 'Executive', 'Small', 'Breakout A', 'Breakout B'];
  const roomStatuses = useMemo(() => {
    return rooms.map(room => {
      const roomMeetings = meetingData.filter(m => {
        let roomName = m.room;
        if (m.room === 'Breakout 1') roomName = 'Breakout A';
        if (m.room === 'Breakout 2') roomName = 'Breakout B';
        return roomName === room;
      });
      const activeMeeting = roomMeetings.find(m => getMeetingStatus(m) === 'active');
      const upcomingMeetings = roomMeetings.filter(m => getMeetingStatus(m) === 'upcoming');
      const nextMeeting = upcomingMeetings.length > 0 ? upcomingMeetings[0] : null;
      return {
        room,
        status: activeMeeting ? 'busy' : 'available',
        activeMeeting,
        nextMeeting
      };
    });
  }, [meetingData, currentTime]);
  // Mock data for calls section
  const callsData = [{
    name: 'Product Team Sync',
    audience: 'Marketing, Engineering',
    startTime: '13:30',
    endTime: '14:15',
    isActive: isToday
  }, {
    name: 'Client Presentation',
    audience: 'External, Sales',
    startTime: '15:00',
    endTime: '16:00',
    isActive: false
  }, {
    name: 'Weekly Status Update',
    audience: 'All Teams',
    startTime: '16:30',
    endTime: '17:00',
    isActive: false
  }];
  // Group calls by day
  const groupCallsByDay = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayStr = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const tomorrowStr = tomorrow.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    return {
      [todayStr]: callsData.filter(call => call.isActive !== false),
      [tomorrowStr]: [{
        name: 'Board Review Call',
        audience: 'Executive Team',
        startTime: '09:30',
        endTime: '10:30',
        isActive: false
      }, {
        name: 'Partner Discussion',
        audience: 'External, Sales',
        startTime: '14:00',
        endTime: '15:00',
        isActive: false
      }]
    };
  };
  const callsByDay = groupCallsByDay();
  return <div className="flex-1 overflow-auto flex flex-col h-full">
      {/* Header with live timer */}
      <div className="bg-[#1a2235] text-white py-3 px-5 sticky top-0 z-[10000] flex items-center justify-between">
        {/* Left: Live timestamp */}
        <div className="text-2xl font-bold">{formattedTime}</div>
        {/* Center: Date */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
          {formattedDate}
        </div>
        {/* Right: Title */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">Room Radar</h1>
        </div>
      </div>

      {/* Main content area */}
      <div className="p-2.5 flex flex-col h-full">
        {/* Main content - Updated layout with calls section in right column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2.5">
          {isViewingPastDay ?
        // For past view, show past meetings
        <div className="col-span-1 md:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2.5">
                <h2 className="text-2xl font-bold mb-2.5 dark:text-white">
                  {isYesterdayView ? "Yesterday's Meetings" : `${formattedDate} Meetings`}
                </h2>
                {pastDayMeetings.length > 0 ? <div className="space-y-2">
                    {pastDayMeetings.map((meeting, idx) => <div key={idx} className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-400">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <div className="text-[2.06rem] font-bold dark:text-white">
                                {meeting.name}
                              </div>
                              <div className="ml-2 text-[1.86rem] text-gray-700 dark:text-gray-300 font-medium">
                                ({meeting.room})
                              </div>
                            </div>
                            <div className="text-[1.55rem] text-gray-600 dark:text-gray-300 mt-1">
                              {formatTimeToMilitary(meeting.startTime)} -{' '}
                              {formatTimeToMilitary(meeting.endTime)}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {meeting.isHighProfile && <span className="text-gray-500 text-[2.06rem] mr-2">
                                ★
                              </span>}
                            {meeting.avSupport && <AVSupportIcon size={31} className="text-gray-500" />}
                          </div>
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-4 text-[1.86rem] text-gray-500 dark:text-gray-400">
                    No meetings found for this day
                  </div>}
              </div>
            </div> :
        // For current or future day view, show Room Status in left column and Calls in right column
        <>
              {/* Left Column - Room Status and VIP Meetings */}
              <div className="flex flex-col gap-2.5">
                {/* Room Status Section - Updated with time calculations */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
                  <h2 className="text-[1.86rem] font-bold mb-1.5 dark:text-white">
                    Room Status
                  </h2>
                  <div className="space-y-1.5">
                    {roomStatuses.map(status => <div key={status.room} className={`p-2 rounded-lg ${status.status === 'busy' ? status.activeMeeting?.isHighProfile ? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500' : 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500'}`}>
                        <div className="flex justify-between items-center">
                          <div className="text-[1.86rem] font-bold dark:text-white">
                            {status.room}
                          </div>
                          <div className={`text-[1.55rem] font-medium ${status.status === 'busy' ? status.activeMeeting?.isHighProfile ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'}`}>
                            {status.status === 'busy' ? 'In Use' : 'Available'}
                          </div>
                        </div>
                        {status.status === 'busy' && status.activeMeeting && <div className="text-[1.38rem] text-gray-600 dark:text-gray-300 mt-1">
                            <div className="font-medium text-[1.55rem]">
                              {status.activeMeeting.name}
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                Until{' '}
                                {formatTimeToMilitary(status.activeMeeting.endTime)}
                              </div>
                              <div className="text-[1.25rem] font-bold text-gray-700 dark:text-gray-300">
                                {getTimeUntilFree(status.activeMeeting)}
                              </div>
                            </div>
                          </div>}
                        {status.status === 'available' && status.nextMeeting && <div className="text-[1.38rem] text-gray-600 dark:text-gray-300 mt-1">
                              <div>Next: {status.nextMeeting.name}</div>
                              <div className="flex justify-between items-center">
                                <div>
                                  At{' '}
                                  {formatTimeToMilitary(status.nextMeeting.startTime)}
                                </div>
                                <div className="text-[1.25rem] font-bold text-gray-700 dark:text-gray-300">
                                  {getTimeUntilNextMeeting(status.nextMeeting)}
                                </div>
                              </div>
                            </div>}
                      </div>)}
                  </div>
                </div>
                {/* VIP Meetings Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
                  <h2 className="text-[1.86rem] font-bold mb-1.5 dark:text-white">
                    Principal Meetings {isTomorrowView ? 'Tomorrow' : 'Today'}
                  </h2>
                  {vipMeetingsToday.length > 0 ? <div className="space-y-1.5">
                      {vipMeetingsToday.map((meeting, idx) => <div key={idx} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <div className="text-[1.55rem] font-bold dark:text-white">
                                  {meeting.name}
                                </div>
                                <div className="ml-1.5 text-[1.38rem] text-gray-700 dark:text-gray-300 font-medium">
                                  ({meeting.room})
                                </div>
                              </div>
                              <div className="text-[1.25rem] text-gray-600 dark:text-gray-300 mt-0.5">
                                {formatTimeToMilitary(meeting.startTime)} -{' '}
                                {formatTimeToMilitary(meeting.endTime)}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="text-red-500 mr-1.5 group relative">
                                <StarIcon size={18} className="text-red-500 fill-red-500" />
                                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                                  VIP meeting
                                  <div className="absolute top-full right-2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </span>
                              {meeting.avSupport && <AVSupportIcon size={18} className="text-red-500" />}
                            </div>
                          </div>
                          <div className="mt-1 flex justify-end">
                            {getMeetingStatus(meeting) === 'active' && <div className="text-[1.25rem] font-bold text-red-700 dark:text-red-300">
                                In progress
                              </div>}
                            {getMeetingStatus(meeting) === 'upcoming' && <div className="text-[1.25rem] font-bold text-gray-700 dark:text-gray-300">
                                {getTimeUntilMeeting(meeting)}
                              </div>}
                          </div>
                        </div>)}
                    </div> : <div className="text-center py-3 text-[1.38rem] text-gray-500 dark:text-gray-400">
                      No VIP meetings scheduled{' '}
                      {isTomorrowView ? 'for tomorrow' : 'for today'}
                    </div>}
                </div>
              </div>
              {/* Right Column - Calls Section - Updated with day grouping */}
              <div className="flex flex-col gap-2.5">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
                  <div className="flex items-center mb-2">
                    <PhoneCallIcon size={23} className="text-blue-500 mr-2" />
                    <h2 className="text-[1.86rem] font-bold dark:text-white">
                      Calls
                    </h2>
                  </div>
                  {Object.keys(callsByDay).length > 0 ? <div className="space-y-4">
                      {Object.entries(callsByDay).map(([day, dayMeetings]) => <div key={day}>
                          {/* Day Header */}
                          <div className="border-b-2 border-gray-200 dark:border-gray-600 pb-1 mb-3">
                            <h3 className="text-[1.55rem] font-bold text-gray-700 dark:text-gray-300">
                              {day}
                            </h3>
                          </div>
                          {/* Calls for this day */}
                          <div className="space-y-2">
                            {dayMeetings.map((call, idx) => {
                      // Determine if call is secure based on name
                      const isSecure = call.name.includes('Board') || call.name.includes('Executive') || call.name.includes('Investor');
                      return <div key={`${day}-${idx}`} className={`p-2.5 rounded-lg ${call.isActive ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : 'bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-400'}`}>
                                  <div className="flex justify-between items-start">
                                    <div className="w-full">
                                      {/* Time | Audience */}
                                      <div className="flex items-center mb-2">
                                        <div className="text-[2.06rem] text-black dark:text-white font-bold">
                                          {call.startTime}
                                        </div>
                                        <div className="mx-2 text-gray-500 dark:text-gray-300 font-bold">
                                          |
                                        </div>
                                        <div className="flex items-center text-[2.06rem] text-black dark:text-white font-bold">
                                          <UsersIcon size={24} className="mr-2 text-black dark:text-white" />
                                          {call.audience}
                                        </div>
                                        {/* Secure/Non-secure badge */}
                                        <div className="ml-auto">
                                          <span className={`px-2 py-1 rounded-full text-[0.82rem] font-medium ${isSecure ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 border border-green-500' : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border border-yellow-500'}`}>
                                            {isSecure ? 'SECURE' : 'NON-SECURE'}
                                          </span>
                                        </div>
                                      </div>
                                      {/* Call name */}
                                      <div className="text-[1.55rem] font-normal dark:text-white mb-3">
                                        {call.name}
                                      </div>
                                      {/* Conference bridge details */}
                                      <div className="mt-2 text-[1.38rem] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-1.5 rounded border border-gray-200 dark:border-gray-600">
                                        <div className="flex flex-col gap-1.5">
                                          <div>
                                            <span>
                                              Bridge: 888-555-{1000 + idx}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="font-medium">
                                              Meeting ID:{' '}
                                            </span>
                                            <span>{10000 + idx * 1111}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>;
                    })}
                          </div>
                        </div>)}
                    </div> : <div className="text-center py-4 text-[1.55rem] text-gray-500 dark:text-gray-400">
                      No calls scheduled
                    </div>}
                </div>
              </div>
            </>}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-auto mb-2.5 flex justify-center gap-2.5">
          <Link to="/main-wall" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1.5 px-2.5 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold md:flex hidden">
            <ArrowLeftIcon size={20} />
            <span>Main Wall</span>
          </Link>
          <Link to="/ops-mui" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1.5 px-2.5 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold md:flex hidden">
            <span>MUI Operations</span>
            <ArrowRightIcon size={20} />
          </Link>
        </div>
      </div>
    </div>;
};
export default AlternativeView;