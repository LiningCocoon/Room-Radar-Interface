import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, UtensilsIcon, PhoneCallIcon, UsersIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import AVSupportIcon from './AVSupportIcon';
import { parseTime } from '../utils/timeUtils';
interface AlternativeViewProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const AlternativeView: React.FC<AlternativeViewProps> = ({
  currentTime,
  isYesterday = false
}) => {
  const meetingData = getMeetingData();
  // Convert legacy room names to new names
  const convertedMeetings = meetingData.map(meeting => {
    let newRoom = meeting.room;
    if (meeting.room === 'Breakout 1') newRoom = 'Breakout A';
    if (meeting.room === 'Breakout 2') newRoom = 'Breakout B';
    if (meeting.room === 'JFK') newRoom = 'FDR'; // Rename JFK to FDR as requested
    return {
      ...meeting,
      room: newRoom
    };
  });
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  // Calculate meeting status
  const getMeetingStatus = (meeting: any) => {
    // If viewing yesterday, all meetings are considered past
    if (isYesterday) return 'past';
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
  const activeMeetings = convertedMeetings.filter(m => !isYesterday && getMeetingStatus(m) === 'active');
  const upcomingMeetings = convertedMeetings.filter(m => !isYesterday && getMeetingStatus(m) === 'upcoming');
  // Find the first VIP meeting overall
  const allVipMeetings = convertedMeetings.filter(m => m.isHighProfile);
  const firstVipMeeting = allVipMeetings.length > 0 ? allVipMeetings[0] : null;
  // Get all VIP meetings for today (not in the past)
  const vipMeetingsToday = convertedMeetings.filter(m => m.isHighProfile && !isYesterday && getMeetingStatus(m) !== 'past');
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
  // Sort active meetings to show VIP and AV Support meetings first
  const sortedActiveMeetings = [...processedActiveMeetings].sort((a, b) => {
    // VIP meetings first
    if (a.isHighProfile && !b.isHighProfile) return -1;
    if (!a.isHighProfile && b.isHighProfile) return 1;
    // Then AV Support meetings
    if (a.avSupport && !b.avSupport) return -1;
    if (!a.avSupport && b.avSupport) return 1;
    // Otherwise sort by room
    return a.room.localeCompare(b.room);
  });
  const processedUpcomingMeetings = processVipStatus(upcomingMeetings);
  // Updated room names and order as requested
  const rooms = ['FDR', 'Executive', 'Breakout A', 'Breakout B', 'Small'];
  const meetingsByRoom: Record<string, any[]> = {};
  rooms.forEach(room => {
    meetingsByRoom[room] = processedUpcomingMeetings.filter(m => m.room === room);
  });
  // Find next available room and time
  const findNextAvailable = () => {
    if (isYesterday) return null; // No "next available" for yesterday's view
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
      // Convert end time to military format
      const endHour = Math.floor(endTimeMinutes / 60);
      const endMinute = endTimeMinutes % 60;
      return {
        time: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
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
  // Calculate meeting density for each hour
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
    convertedMeetings.forEach(meeting => {
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
  }, [convertedMeetings]);
  // Find low activity windows
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
  // Format hour to military time string
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };
  // Find best break times
  const findBestBreakTime = useMemo(() => {
    if (isYesterday) return 'N/A for past day';
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
  }, [calculateMeetingDensity, currentTime, isYesterday]);
  // Find safe window text
  const safeWindowText = useMemo(() => {
    if (isYesterday) return 'N/A for past day';
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
  }, [findLowActivityWindows, currentTime, isYesterday]);
  // Convert time to military format
  const formatTimeToMilitary = (timeStr: string) => {
    if (timeStr === 'Now') return timeStr;
    const time = parseTime(timeStr);
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  };
  // For yesterday view, show all meetings as past
  const pastDayMeetings = isYesterday ? convertedMeetings : [];
  // Get room status for each room
  const getRoomStatus = () => {
    return rooms.map(room => {
      const activeInRoom = processedActiveMeetings.find(m => m.room === room);
      const nextInRoom = processedUpcomingMeetings.filter(m => m.room === room).sort((a, b) => getMinutesUntilMeeting(a) - getMinutesUntilMeeting(b))[0];
      return {
        room,
        status: activeInRoom ? 'busy' : 'available',
        activeMeeting: activeInRoom,
        nextMeeting: nextInRoom
      };
    });
  };
  const roomStatuses = getRoomStatus();
  // Mock data for calls section
  const callsData = [{
    name: 'Product Team Sync',
    audience: 'Marketing, Engineering',
    startTime: '13:30',
    endTime: '14:15',
    isActive: true
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
  return <div className="flex-1 p-3 pt-2 h-screen flex flex-col overflow-auto">
      {/* Unified Dashboard with Meeting Density and Break Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-3 p-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Meeting Density Graph - Takes more space on desktop */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                07:00
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                09:00
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                11:00
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                13:00
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                15:00
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                17:00
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                19:00
              </span>
            </div>
            <div className="relative h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
              {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(hour => {
              const density = calculateMeetingDensity[hour];
              // Updated color scheme: show red for busy OR VIP meetings
              let bgColor = 'bg-[#4caf50] dark:bg-[#36AE7C]'; // Open - custom green
              // If viewing yesterday, show all time slots as past (gray)
              if (isYesterday) {
                bgColor = 'bg-gray-300 dark:bg-gray-600';
              } else if (density.count >= 3 || density.vip) {
                bgColor = 'bg-[#e52207] dark:bg-[#EB5353]'; // Busy or VIP - custom red
              } else if (density.count === 2) {
                bgColor = 'bg-[#ffbe2e] dark:bg-[#F9D923]'; // Moderate - custom yellow
              } else if (density.count === 1) {
                bgColor = 'bg-[#00bde3] dark:bg-[#187498]'; // Light - custom blue
              }
              return <div key={hour} className={`flex-1 ${bgColor} border-r border-white dark:border-gray-800 relative`}>
                    {density.count === 0 && !isYesterday && <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] text-gray-600 dark:text-gray-300">
                        ·
                      </span>}
                    {hour === currentHour && !isYesterday && <div className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-gray-300 left-1/2 transform -translate-x-1/2"></div>}
                  </div>;
            })}
            </div>
            <div className="flex h-4 mt-0.5">
              {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(hour => <div key={`vip-${hour}`} className="flex-1 flex justify-center"></div>)}
            </div>
            {/* Updated legend with better mobile responsiveness */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-5 mt-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
              {!isYesterday ? <>
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
                </> : <div className="flex items-center px-0.5 sm:px-1">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-300 dark:bg-gray-600 rounded-full mr-1 sm:mr-1.5"></div>
                  <span>Past Day</span>
                </div>}
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
              {!isYesterday && findLowActivityWindows.length > 0 && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Next window: {formatHour(findLowActivityWindows[0].start)}–
                  {formatHour(findLowActivityWindows[0].end + 1)}
                </div>}
            </div>
          </div>
        </div>
      </div>
      {/* Main content - Updated layout with calls section in right column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {isYesterday ?
      // For yesterday view, show past meetings
      <div className="col-span-1 md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
              <h2 className="text-2xl font-bold mb-3 dark:text-white">
                Yesterday's Meetings
              </h2>
              {pastDayMeetings.length > 0 ? <div className="space-y-3">
                  {pastDayMeetings.map((meeting, idx) => <div key={idx} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-400">
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
                            {formatTimeToMilitary(meeting.startTime)} -{' '}
                            {formatTimeToMilitary(meeting.endTime)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {meeting.isHighProfile && <span className="text-gray-500 text-2xl mr-2">
                              ★
                            </span>}
                          {meeting.avSupport && <AVSupportIcon size={30} className="text-gray-500" />}
                        </div>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-5 text-xl text-gray-500 dark:text-gray-400">
                  No meetings found for yesterday
                </div>}
            </div>
          </div> :
      // For current day view, show Activity in left column and Calls in right column
      <>
            {/* Left Column - Activity (formerly Room Status) */}
            <div className="flex flex-col gap-3">
              {/* Activity Section (renamed from Room Status) with 20% larger text */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
                <h2 className="text-2xl font-bold mb-3 dark:text-white">
                  Activity
                </h2>
                <div className="space-y-3">
                  {roomStatuses.map(status => <div key={status.room} className={`p-3 rounded-lg ${status.status === 'busy' ? status.activeMeeting?.isHighProfile ? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500' : 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500'}`}>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold dark:text-white">
                          {status.room}
                        </div>
                        <div className={`text-xl font-medium ${status.status === 'busy' ? status.activeMeeting?.isHighProfile ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'}`}>
                          {status.status === 'busy' ? 'In Use' : 'Available'}
                        </div>
                      </div>
                      {status.status === 'busy' && status.activeMeeting && <div className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                          <div className="font-medium text-xl">
                            {status.activeMeeting.name}
                          </div>
                          <div>
                            Until{' '}
                            {formatTimeToMilitary(status.activeMeeting.endTime)}
                          </div>
                        </div>}
                      {status.status === 'available' && status.nextMeeting && <div className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                          <div>Next: {status.nextMeeting.name}</div>
                          <div>
                            At{' '}
                            {formatTimeToMilitary(status.nextMeeting.startTime)}
                          </div>
                        </div>}
                    </div>)}
                </div>
              </div>
              {/* VIP Meetings Section */}
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
                              {formatTimeToMilitary(meeting.startTime)} -{' '}
                              {formatTimeToMilitary(meeting.endTime)}
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
            {/* Right Column - Calls Section */}
            <div className="flex flex-col gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
                <div className="flex items-center mb-3">
                  <PhoneCallIcon size={24} className="text-blue-500 mr-2" />
                  <h2 className="text-2xl font-bold dark:text-white">Calls</h2>
                </div>
                {callsData.length > 0 ? <div className="space-y-3">
                    {callsData.map((call, idx) => <div key={idx} className={`p-3 rounded-lg ${call.isActive ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : 'bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-400'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-2xl font-bold dark:text-white">
                              {call.name}
                            </div>
                            <div className="flex items-center mt-1">
                              <UsersIcon size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                              <div className="text-lg text-gray-600 dark:text-gray-300">
                                {call.audience}
                              </div>
                            </div>
                            <div className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                              {call.startTime} - {call.endTime}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {call.isActive && <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                                Active
                              </span>}
                          </div>
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-5 text-xl text-gray-500 dark:text-gray-400">
                    No calls scheduled
                  </div>}
              </div>
              {/* Upcoming Calls Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 flex-1">
                <h2 className="text-2xl font-bold mb-3 dark:text-white">
                  Call Information
                </h2>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <h3 className="text-xl font-bold dark:text-white mb-2">
                      Join Options
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-blue-500 text-white p-1 rounded">
                        <PhoneCallIcon size={16} />
                      </div>
                      <div className="text-lg">Main Line: 888-555-1234</div>
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-300 ml-8">
                      Meeting ID: 1234 5678
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <h3 className="text-xl font-bold dark:text-white mb-2">
                      Support
                    </h3>
                    <div className="text-lg text-gray-600 dark:text-gray-300">
                      Technical issues: 888-555-4321
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-300">
                      Conference support: ext. 9876
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>}
      </div>
      {/* Navigation Buttons - Make Past Meetings link work on mobile */}
      <div className="mt-auto mb-3 flex justify-center gap-3">
        <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-2 px-3 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold md:flex hidden">
          <ArrowLeftIcon size={20} />
          <span>Simplified view</span>
        </Link>
        <Link to="/past-meetings" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-2 px-3 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold md:flex hidden">
          <span>Past meetings</span>
          <ArrowRightIcon size={20} />
        </Link>
      </div>
    </div>;
};
export default AlternativeView;