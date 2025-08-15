import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, UtensilsIcon } from 'lucide-react';
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
  // Get all VIP meetings for today (not in the past)
  const vipMeetingsToday = meetingData.filter(m => m.isHighProfile && getMeetingStatus(m) !== 'past');
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
  const rooms = ['JFK', 'Executive', 'Breakout 1', 'Breakout 2'];
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
  // Get hours until meeting
  const getTimeUntilMeeting = (meeting: any) => {
    const minutesUntil = getMinutesUntilMeeting(meeting);
    // If less than 60 minutes, show minutes
    if (minutesUntil < 60) {
      return `In ${minutesUntil} min`;
    }
    // Otherwise show hours (with one decimal place if not whole number)
    const hoursUntil = minutesUntil / 60;
    if (hoursUntil === Math.floor(hoursUntil)) {
      return `In ${hoursUntil} hr${hoursUntil !== 1 ? 's' : ''}`;
    } else {
      return `In ${hoursUntil.toFixed(1)} hrs`;
    }
  };
  // NEW: Calculate meeting density for each hour
  const calculateMeetingDensity = useMemo(() => {
    const workHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const density: Record<number, {
      count: number;
      vip: boolean;
      avSupport: boolean;
    }> = {};
    // Initialize density object
    workHours.forEach(hour => {
      density[hour] = {
        count: 0,
        vip: false,
        avSupport: false
      };
    });
    // Count meetings per hour
    meetingData.forEach(meeting => {
      const startTime = parseTime(meeting.startTime);
      const endTime = meeting.endTime ? parseTime(meeting.endTime) : {
        hours: startTime.hours + 1,
        minutes: 0
      };
      // For each hour this meeting spans
      for (let h = startTime.hours; h < endTime.hours; h++) {
        if (density[h]) {
          density[h].count += 1;
          density[h].vip = density[h].vip || meeting.isHighProfile || false;
          density[h].avSupport = density[h].avSupport || meeting.avSupport || false;
        }
      }
      // Special case for the ending hour - only count if it doesn't end exactly on the hour
      if (endTime.minutes > 0 && density[endTime.hours]) {
        density[endTime.hours].count += 1;
        density[endTime.hours].vip = density[endTime.hours].vip || meeting.isHighProfile || false;
        density[endTime.hours].avSupport = density[endTime.hours].avSupport || meeting.avSupport || false;
      }
    });
    return density;
  }, [meetingData]);
  // NEW: Find low activity windows
  const findLowActivityWindows = useMemo(() => {
    const workHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const windows = [];
    let currentWindow: {
      start: number;
      end: number;
    } | null = null;
    // Define what counts as "low activity" (less than 2 meetings)
    const isLowActivity = (hour: number) => calculateMeetingDensity[hour].count < 2;
    // Find continuous low activity windows
    for (const hour of workHours) {
      if (isLowActivity(hour)) {
        if (!currentWindow) {
          currentWindow = {
            start: hour,
            end: hour
          };
        } else {
          currentWindow.end = hour;
        }
      } else if (currentWindow) {
        windows.push({
          ...currentWindow
        });
        currentWindow = null;
      }
    }
    // Add the last window if it exists
    if (currentWindow) {
      windows.push(currentWindow);
    }
    // Filter for windows at least 1 hour long
    return windows.filter(w => w.end - w.start >= 1);
  }, [calculateMeetingDensity]);
  // NEW: Format hour to AM/PM string
  const formatHour = (hour: number) => {
    const isPM = hour >= 12;
    const displayHour = isPM ? hour === 12 ? 12 : hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00${isPM ? 'PM' : 'AM'}`;
  };
  // NEW: Find best break times
  const findBestBreakTime = useMemo(() => {
    // Current hour and next hour
    const currentHour = currentTime.getHours();
    const nextHour = currentHour + 1;
    // If current time is low activity
    if (calculateMeetingDensity[currentHour] && calculateMeetingDensity[currentHour].count < 2) {
      return `next ${30 - currentTime.getMinutes() % 30} min`;
    }
    // Find next low activity period
    for (let h = nextHour; h <= 19; h++) {
      if (calculateMeetingDensity[h] && calculateMeetingDensity[h].count < 2) {
        return `after ${formatHour(h).replace(':00', '')}`;
      }
    }
    return 'Limited today';
  }, [calculateMeetingDensity, currentTime]);
  // NEW: Find safe window text
  const safeWindowText = useMemo(() => {
    if (findLowActivityWindows.length === 0) {
      return 'High activity all day';
    }
    // Find the next upcoming low activity window
    const currentHour = currentTime.getHours();
    const upcomingWindows = findLowActivityWindows.filter(w => w.end >= currentHour);
    if (upcomingWindows.length === 0) {
      return 'No more low activity periods today';
    }
    const nextWindow = upcomingWindows[0];
    // If we're currently in the window
    if (currentHour >= nextWindow.start && currentHour <= nextWindow.end) {
      return `Low activity now until ${formatHour(nextWindow.end + 1)}`;
    }
    return `Low activity expected: ${formatHour(nextWindow.start)}–${formatHour(nextWindow.end + 1)}`;
  }, [findLowActivityWindows, currentTime]);
  return <div className="flex-1 p-3 pt-2 h-screen flex flex-col overflow-auto">
      {/* Unified Dashboard with Meeting Density and Break Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-3 p-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Meeting Density Graph - Takes more space on desktop */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                7AM
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                9AM
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                11AM
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                1PM
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                3PM
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                5PM
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                7PM
              </span>
            </div>
            <div className="relative h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
              {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(hour => {
              const density = calculateMeetingDensity[hour];
              // Updated color scheme: show red for busy OR VIP meetings
              let bgColor = 'bg-[#4caf50] dark:bg-[#36AE7C]'; // Open - custom green
              if (density.count >= 3 || density.vip) {
                bgColor = 'bg-[#e52207] dark:bg-[#EB5353]'; // Busy or VIP - custom red
              } else if (density.count === 2) {
                bgColor = 'bg-[#ffbe2e] dark:bg-[#F9D923]'; // Moderate - custom yellow
              } else if (density.count === 1) {
                bgColor = 'bg-[#00bde3] dark:bg-[#187498]'; // Light - custom blue
              }
              return <div key={hour} className={`flex-1 ${bgColor} border-r border-white dark:border-gray-800 relative`}>
                    {density.count === 0 && <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] text-gray-600 dark:text-gray-300">
                        ·
                      </span>}
                    {hour === currentHour && <div className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-gray-300 left-1/2 transform -translate-x-1/2"></div>}
                  </div>;
            })}
            </div>
            <div className="flex h-4 mt-0.5">
              {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(hour => <div key={`vip-${hour}`} className="flex-1 flex justify-center"></div>)}
            </div>
            {/* Updated legend with better mobile responsiveness */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-5 mt-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
              <div className="flex items-center px-0.5 sm:px-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#4caf50] dark:bg-[#36AE7C] rounded-full mr-1 sm:mr-1.5"></div>
                <span>Open</span>
              </div>
              <div className="flex items-center px-0.5 sm:px-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#00bde3] dark:bg-[#187498] rounded-full mr-1 sm:mr-1.5"></div>
                <span>Light</span>
              </div>
              <div className="flex items-center px-0.5 sm:px-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#ffbe2e] dark:bg-[#F9D923] rounded-full mr-1 sm:mr-1.5"></div>
                <span>Moderate</span>
              </div>
              <div className="flex items-center px-0.5 sm:px-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#e52207] dark:bg-[#EB5353] rounded-full mr-1 sm:mr-1.5"></div>
                <span>Busy or VIP</span>
              </div>
            </div>
          </div>
          {/* Break Time Info - Moved utensils icon to top right and text 2px left on mobile */}
          <div className="md:w-64 w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 relative">
            <UtensilsIcon size={20} className="text-green-500 absolute top-3 right-3" />
            <div className="pr-7 sm:pl-0 pl-[2px]">
              <div className="text-lg font-medium text-gray-700 dark:text-gray-200">
                Best break time:
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {findBestBreakTime}
              </div>
              {findLowActivityWindows.length > 0 && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Next window: {formatHour(findLowActivityWindows[0].start)}–
                  {formatHour(findLowActivityWindows[0].end + 1)}
                </div>}
            </div>
          </div>
        </div>
      </div>

      {/* Current Status - Improved mobile layout */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md pt-3 px-3 pb-3 mb-3">
        <h2 className="text-2xl font-bold mb-3 dark:text-white">
          Current Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <div className="text-xl text-gray-600 dark:text-gray-300">
              Active Meetings
            </div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {processedActiveMeetings.length}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
            <div className="text-xl text-gray-600 dark:text-gray-300">
              Starting Soon (15m)
            </div>
            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
              {processedUpcomingMeetings.filter(m => getMinutesUntilMeeting(m) <= 15).length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
            <div className="text-xl text-gray-600 dark:text-gray-300">
              Next Available
            </div>
            {nextAvailable ? <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {nextAvailable.time === 'Now' ? `${nextAvailable.room} - Now` : `${nextAvailable.room} at ${nextAvailable.time}`}
              </div> : <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                None
              </div>}
          </div>
        </div>
      </div>

      {/* Main content - Improved mobile layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
            <h2 className="text-2xl font-bold mb-3 dark:text-white">
              Active Meetings
            </h2>
            {processedActiveMeetings.length > 0 ? <div className="space-y-3">
                {processedActiveMeetings.map((meeting, idx) => <div key={idx} className={`p-3 rounded-lg ${meeting.isHighProfile ? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500' : 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <div className="text-2xl font-bold dark:text-white">
                            {meeting.name}
                          </div>
                          <div className="ml-2 text-xl text-gray-700 dark:text-gray-300 font-medium">
                            ({meeting.room})
                          </div>
                        </div>
                        <div className="text-lg text-gray-600 dark:text-gray-300 mt-1">
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
                        {meeting.avSupport && <AVSupportIcon size={30} className={meeting.isHighProfile ? 'text-red-500' : 'text-blue-500'} />}
                      </div>
                    </div>
                  </div>)}
              </div> : <div className="text-center py-5 text-xl text-gray-500 dark:text-gray-400">
                No active meetings at this time
              </div>}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
            <h2 className="text-2xl font-bold mb-3 dark:text-white">
              Starting Soon
            </h2>
            {processedUpcomingMeetings.filter(m => getMinutesUntilMeeting(m) <= 30).length > 0 ? <div className="space-y-3">
                {processedUpcomingMeetings.filter(m => getMinutesUntilMeeting(m) <= 30).sort((a, b) => getMinutesUntilMeeting(a) - getMinutesUntilMeeting(b)).slice(0, 4).map((meeting, idx) => <div key={idx} className={`p-3 rounded-lg ${meeting.isHighProfile ? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500' : meeting.avSupport && getMinutesUntilMeeting(meeting) <= 15 ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500' : 'bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-400'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <div className="text-2xl font-bold dark:text-white">
                              {meeting.name}
                            </div>
                            <div className="ml-2 text-xl text-gray-700 dark:text-gray-300 font-medium">
                              ({meeting.room})
                            </div>
                          </div>
                          <div className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                            {meeting.startTime} - {meeting.endTime}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {meeting.isHighProfile && <span className="text-red-500 text-2xl mr-2">
                              ★
                            </span>}
                          {meeting.avSupport && <AVSupportIcon size={30} className={meeting.isHighProfile ? 'text-red-500' : getMinutesUntilMeeting(meeting) <= 15 ? 'text-yellow-500' : 'text-gray-500'} />}
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                          In {getMinutesUntilMeeting(meeting)} min
                        </div>
                      </div>
                    </div>)}
              </div> : <div className="text-center py-5 text-xl text-gray-500 dark:text-gray-400">
                No meetings starting in the next 30 minutes
              </div>}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
            <h2 className="text-2xl font-bold mb-3 dark:text-white">
              Room Availability
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {rooms.map(room => {
              const activeInRoom = processedActiveMeetings.find(m => m.room === room);
              const nextInRoom = processedUpcomingMeetings.filter(m => m.room === room).sort((a, b) => getMinutesUntilMeeting(a) - getMinutesUntilMeeting(b))[0];
              return <div key={room} className={`p-3 rounded-lg ${activeInRoom ? activeInRoom.isHighProfile ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-50 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    <div className="text-2xl font-bold dark:text-white">
                      {room}
                      {activeInRoom ? ' (Busy)' : ''}
                    </div>
                    {activeInRoom ? <div>
                        <div className="text-xl font-medium mt-2 dark:text-white">
                          {activeInRoom.name}
                        </div>
                        <div className="text-lg text-gray-600 dark:text-gray-300">
                          Until {activeInRoom.endTime}
                        </div>
                      </div> : nextInRoom ? <div>
                        <div className="text-xl font-medium mt-2 text-green-700 dark:text-green-400">
                          Available
                        </div>
                        <div className="text-lg text-gray-600 dark:text-gray-300">
                          Next: {nextInRoom.startTime}
                        </div>
                      </div> : <div className="text-xl font-medium mt-2 text-green-700 dark:text-green-400">
                        Available All Day
                      </div>}
                  </div>;
            })}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
            <h2 className="text-2xl font-bold mb-3 dark:text-white">
              VIP Meetings Today
            </h2>
            {vipMeetingsToday.length > 0 ? <div className="space-y-3">
                {vipMeetingsToday.map((meeting, idx) => <div key={idx} className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <div className="text-2xl font-bold dark:text-white">
                            {meeting.name}
                          </div>
                          <div className="ml-2 text-xl text-gray-700 dark:text-gray-300 font-medium">
                            ({meeting.room})
                          </div>
                        </div>
                        <div className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                          {meeting.startTime} - {meeting.endTime}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 text-2xl mr-2 group relative">
                          ★{/* Tooltip */}
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                            VIP meeting
                            <div className="absolute top-full right-2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </span>
                        {meeting.avSupport && <AVSupportIcon size={30} className="text-red-500" />}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      {getMeetingStatus(meeting) === 'active' && <div className="text-lg font-bold text-red-700 dark:text-red-300">
                          In progress
                        </div>}
                      {getMeetingStatus(meeting) === 'upcoming' && <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                          {getTimeUntilMeeting(meeting)}
                        </div>}
                    </div>
                  </div>)}
              </div> : <div className="text-center py-5 text-xl text-gray-500 dark:text-gray-400">
                No VIP meetings scheduled for today
              </div>}
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Make Past Meetings link work on mobile */}
      <div className="mt-auto mb-3 flex justify-center gap-3">
        <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-2 px-3 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold md:flex hidden">
          <ArrowLeftIcon size={20} />
          <span>Simplified view</span>
        </Link>
        <Link to="/past-meetings" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-2 px-3 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold">
          <span>Past meetings</span>
          <ArrowRightIcon size={20} />
        </Link>
      </div>
    </div>;
};
export default AlternativeView;