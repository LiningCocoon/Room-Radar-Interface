import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, AlertTriangleIcon, CheckCircleIcon, AlertCircleIcon, PhoneIcon, PhoneCallIcon, ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import AVSupportIcon from './AVSupportIcon';
import { parseTime } from '../utils/timeUtils';
interface OperationsDashboardProps {
  currentTime: Date;
  isYesterday?: boolean;
}
// Format time to military format - moved outside component to avoid initialization issues
const formatTimeToMilitary = (timeStr: string) => {
  const time = parseTime(timeStr);
  return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
};
// Get VIP title/role based on meeting name or room - moved outside component
const getVipTitle = (meeting: any) => {
  if (meeting.room === 'Executive') {
    if (meeting.name.includes('Review')) return 'CEO';
    if (meeting.name.includes('Planning')) return 'COO';
    if (meeting.name.includes('Client')) return 'SVP';
    if (meeting.name.includes('Board')) return 'Chairman';
    if (meeting.name.includes('All-Hands')) return 'CEO';
    if (meeting.name.includes('International')) return 'President';
    if (meeting.name.includes('Briefing')) return 'CTO';
    return 'Executive';
  }
  if (meeting.room === 'JFK') {
    if (meeting.name.includes('Planning')) return 'Director';
    if (meeting.name.includes('Brief')) return 'VP';
    if (meeting.name.includes('Committee')) return 'CFO';
    if (meeting.name.includes('Emergency')) return 'Security Officer';
    return 'Senior Manager';
  }
  if (meeting.room === 'Breakout A') {
    if (meeting.name.includes('Leadership')) return 'SVP';
    if (meeting.name.includes('All-Hands')) return 'CEO';
    if (meeting.name.includes('Investor')) return 'CFO';
    return 'Director';
  }
  return 'VIP';
};
// Get audience for meetings and calls - moved outside component
const getAudience = (meeting: any) => {
  if (meeting.name.includes('Board')) return 'Executive Team';
  if (meeting.name.includes('Client')) return 'External, Sales';
  if (meeting.name.includes('Team')) return 'Team Members';
  if (meeting.name.includes('Planning')) return 'Department Leads';
  if (meeting.name.includes('Review')) return 'Executive Team';
  if (meeting.name.includes('Strategy')) return 'Marketing, Product';
  if (meeting.name.includes('Demo')) return 'Product, Sales';
  if (meeting.name.includes('Leadership')) return 'Senior Management';
  if (meeting.name.includes('All-Hands')) return 'All Employees';
  if (meeting.name.includes('Investor')) return 'Investors, Finance';
  if (meeting.name.includes('Executive')) return 'C-Suite';
  if (meeting.name.includes('Support')) return 'IT, Support Team';
  if (meeting.name.includes('Partner')) return 'External Partners';
  if (meeting.name.includes('Workshop')) return 'Design, Product';
  if (meeting.name.includes('International')) return 'Global Teams';
  if (meeting.name.includes('Emergency')) return 'Crisis Team';
  return 'Internal';
};
// Determine if a call is secure based on content - moved outside component
const isSecureCall = (meeting: any) => {
  return meeting.name.includes('Board') || meeting.name.includes('Executive') || meeting.name.includes('Investor') || meeting.name.includes('Leadership') || meeting.name.includes('Committee') || meeting.name.includes('Emergency');
};
const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  currentTime,
  isYesterday = false
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  // State for tracking the selected date (yesterday, today, or tomorrow)
  const [isTomorrow, setIsTomorrow] = useState(false);
  const [isYesterdayView, setIsYesterdayView] = useState(isYesterday);
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // Keep isYesterdayView in sync with the prop
  useEffect(() => {
    setIsYesterdayView(isYesterday);
  }, [isYesterday]);
  // Navigation functions
  const goToPreviousDay = () => {
    if (isTomorrow) {
      setIsTomorrow(false);
      setIsYesterdayView(false);
    } else if (!isYesterdayView) {
      setIsYesterdayView(true);
    }
  };
  const goToNextDay = () => {
    if (isYesterdayView) {
      setIsYesterdayView(false);
    } else if (!isTomorrow) {
      setIsTomorrow(true);
    }
  };
  // Toggle between today and tomorrow (legacy function, kept for compatibility)
  const toggleDay = () => {
    if (isYesterdayView) {
      setIsYesterdayView(false);
    } else if (isTomorrow) {
      setIsTomorrow(false);
    } else {
      setIsTomorrow(true);
    }
  };
  // Format current time as HH:MM:SS in military time (24-hour format)
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  // Format the date (yesterday, today, or tomorrow based on state)
  const dateToShow = new Date(currentDateTime);
  if (isYesterdayView) {
    dateToShow.setDate(dateToShow.getDate() - 1);
  } else if (isTomorrow) {
    dateToShow.setDate(dateToShow.getDate() + 1);
  }
  const formattedDate = dateToShow.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  // Updated room names (changed FDR to JFK)
  const rooms = ['JFK', 'Executive', 'Small', 'Breakout A', 'Breakout B'];
  // Get meeting data and convert room names
  const meetingData = getMeetingData();
  const convertedMeetings = meetingData.map(meeting => {
    let newRoom = meeting.room;
    if (meeting.room === 'Breakout 1') newRoom = 'Breakout A';
    if (meeting.room === 'Breakout 2') newRoom = 'Breakout B';
    if (meeting.room === 'FDR') newRoom = 'JFK';
    return {
      ...meeting,
      room: newRoom
    };
  });
  // Add additional meeting data for Operations Dashboard demonstration
  const additionalMeetings = [{
    name: 'Executive Briefing',
    startTime: '14:30',
    endTime: '15:30',
    room: 'Executive',
    isHighProfile: true,
    avSupport: true,
    isCall: false
  }, {
    name: 'International Call',
    startTime: '15:15',
    endTime: '16:00',
    room: 'Small',
    isHighProfile: false,
    avSupport: true,
    isCall: true,
    callType: 'Conference'
  }, {
    name: 'Emergency Response Review',
    startTime: '16:00',
    endTime: '17:00',
    room: 'JFK',
    isHighProfile: true,
    avSupport: true,
    isCall: false
  }, {
    name: 'Team Standup',
    startTime: '13:45',
    endTime: '14:15',
    room: 'Breakout A',
    isHighProfile: false,
    avSupport: false,
    isCall: false
  },
  // Additional meeting data for tomorrow's planning
  {
    name: 'Quarterly Planning',
    startTime: '09:00',
    endTime: '11:00',
    room: 'JFK',
    isHighProfile: true,
    avSupport: true,
    isCall: false
  }, {
    name: 'Client Presentation',
    startTime: '11:30',
    endTime: '12:30',
    room: 'Executive',
    isHighProfile: true,
    avSupport: true,
    isCall: false
  }, {
    name: 'Team Sync',
    startTime: '14:00',
    endTime: '15:00',
    room: 'Small',
    isHighProfile: false,
    avSupport: false,
    isCall: true,
    callType: 'Huddle'
  }, {
    name: 'Partner Meeting',
    startTime: '15:30',
    endTime: '16:30',
    room: 'Breakout B',
    isHighProfile: false,
    avSupport: true,
    isCall: true,
    callType: 'External'
  }];
  // Combine original and additional meetings
  const enhancedMeetings = [...convertedMeetings, ...additionalMeetings];
  // Tomorrow's meetings
  const tomorrowMeetings = [{
    name: 'Board Review',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Executive',
    isHighProfile: true,
    avSupport: true,
    isCall: false
  }, {
    name: 'Leadership Sync',
    startTime: '11:00',
    endTime: '12:00',
    room: 'JFK',
    isHighProfile: true,
    avSupport: false,
    isCall: false
  }, {
    name: 'Product Demo',
    startTime: '13:30',
    endTime: '14:30',
    room: 'Small',
    isHighProfile: false,
    avSupport: true,
    isCall: false
  }, {
    name: 'All-Hands Meeting',
    startTime: '15:00',
    endTime: '16:00',
    room: 'JFK',
    isHighProfile: true,
    avSupport: true,
    isCall: false
  }, {
    name: 'International Call',
    startTime: '16:30',
    endTime: '17:30',
    room: 'Executive',
    isHighProfile: false,
    avSupport: true,
    isCall: true,
    callType: 'Conference'
  }];
  // Yesterday's meetings (using the same data as today for simplicity)
  const yesterdayMeetings = enhancedMeetings;
  // Use the appropriate meetings based on which day is selected
  const getMeetingsForSelectedDay = () => {
    if (isYesterdayView) {
      return yesterdayMeetings;
    } else if (isTomorrow) {
      return tomorrowMeetings;
    } else {
      return enhancedMeetings;
    }
  };
  const meetingsToUse = getMeetingsForSelectedDay();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  // Calculate meeting status
  const getMeetingStatus = (meeting: any) => {
    // If showing tomorrow or yesterday, adjust accordingly
    if (isTomorrow) return 'upcoming';
    if (isYesterdayView) return 'past';
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
  // Get minutes until a meeting starts or ends
  const getMinutesUntilMeeting = (meeting: any) => {
    const startTime = parseTime(meeting.startTime);
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    return startTimeInMinutes - currentTimeInMinutes;
  };
  const getMinutesUntilMeetingEnds = (meeting: any) => {
    if (!meeting.endTime) return 60; // Default to 1 hour if no end time
    const endTime = parseTime(meeting.endTime);
    const endTimeInMinutes = endTime.hours * 60 + endTime.minutes;
    return endTimeInMinutes - currentTimeInMinutes;
  };
  // Filter meetings by status
  const activeMeetings = meetingsToUse.filter(m => getMeetingStatus(m) === 'active');
  const upcomingMeetings = meetingsToUse.filter(m => getMeetingStatus(m) === 'upcoming');
  const pastMeetings = meetingsToUse.filter(m => getMeetingStatus(m) === 'past');
  // Find active or soon VIP meetings (including VIP calls)
  const activeVipMeetings = activeMeetings.filter(m => m.isHighProfile);
  const soonVipMeetings = upcomingMeetings.filter(m => m.isHighProfile && getMinutesUntilMeeting(m) <= 10 && getMinutesUntilMeeting(m) > 0);
  // Get room status for each room
  const roomStatuses = useMemo(() => {
    return rooms.map(room => {
      const activeInRoom = activeMeetings.find(m => m.room === room);
      const nextInRoom = upcomingMeetings.filter(m => m.room === room).sort((a, b) => getMinutesUntilMeeting(a) - getMinutesUntilMeeting(b))[0];
      return {
        room,
        status: activeInRoom ? 'busy' : 'available',
        activeMeeting: activeInRoom,
        nextMeeting: nextInRoom,
        isVip: activeInRoom?.isHighProfile || false,
        needsAv: activeInRoom?.avSupport || false,
        isCall: activeInRoom?.isCall || false,
        callType: activeInRoom?.callType || null
      };
    });
  }, [rooms, activeMeetings, upcomingMeetings]);
  // Calculate alert status - ONLY for VIP meetings and calls
  const getAlertStatus = () => {
    if (isTomorrow) {
      // For tomorrow view, show planning alert instead of VIP alert
      const vipMeetingsTomorrow = meetingsToUse.filter(m => m.isHighProfile);
      if (vipMeetingsTomorrow.length > 0) {
        return {
          type: 'planning',
          message: `PLANNING FOR TOMORROW: ${vipMeetingsTomorrow.length} VIP meetings scheduled`,
          color: 'bg-blue-600 text-white',
          icon: <AlertCircleIcon size={32} className="text-white" />
        };
      }
      return null;
    } else if (isYesterdayView) {
      // For yesterday view, show a recap alert
      const vipMeetingsYesterday = meetingsToUse.filter(m => m.isHighProfile);
      if (vipMeetingsYesterday.length > 0) {
        return {
          type: 'recap',
          message: `YESTERDAY'S RECAP: ${vipMeetingsYesterday.length} VIP meetings occurred`,
          color: 'bg-gray-600 text-white',
          icon: <CheckCircleIcon size={32} className="text-white" />
        };
      }
      return null;
    }
    // Find upcoming VIP meetings starting within 15 minutes
    const upcomingVipMeetings = upcomingMeetings.filter(m => m.isHighProfile && getMinutesUntilMeeting(m) <= 15 && getMinutesUntilMeeting(m) > 0);
    if (upcomingVipMeetings.length > 0) {
      // Return array of upcoming VIP meetings
      return upcomingVipMeetings.map(meeting => ({
        type: 'vip-upcoming',
        meeting,
        message: `${meeting.room}: ${meeting.name} at ${formatTimeToMilitary(meeting.startTime)} - ${getVipTitle(meeting)}`,
        color: 'bg-red-600 text-white',
        icon: meeting.isCall ? <PhoneCallIcon size={28} className="text-white" /> : <AlertCircleIcon size={28} className="text-white" />
      }));
    }
    return null;
  };
  const alertStatuses = getAlertStatus();
  // Simplified upcoming activity generation
  const generateUpcomingActivity = () => {
    const threeHoursFromNow = currentTimeInMinutes + 180;
    const twoHoursBeforeNow = currentTimeInMinutes - 120;
    const relevantMeetings = [...activeMeetings, ...upcomingMeetings].filter(m => {
      const startTime = parseTime(m.startTime);
      const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
      // Filter out meetings that started more than 2 hours ago
      if (startTimeInMinutes < twoHoursBeforeNow) {
        return false;
      }
      return startTimeInMinutes < threeHoursFromNow && (getMeetingStatus(m) === 'upcoming' || getMeetingStatus(m) === 'active');
    }).sort((a, b) => {
      const aTime = parseTime(a.startTime).hours * 60 + parseTime(a.startTime).minutes;
      const bTime = parseTime(b.startTime).hours * 60 + parseTime(b.startTime).minutes;
      return aTime - bTime;
    });
    return relevantMeetings;
  };
  const upcomingActivities = generateUpcomingActivity();
  // Generate call information
  const generateCallInformation = () => {
    return meetingsToUse.filter(m => m.isCall && getMeetingStatus(m) !== 'past').sort((a, b) => {
      const aTime = parseTime(a.startTime).hours * 60 + parseTime(a.startTime).minutes;
      const bTime = parseTime(b.startTime).hours * 60 + parseTime(b.startTime).minutes;
      return aTime - bTime;
    });
  };
  const callInformation = generateCallInformation();
  return <div className="flex-1 overflow-auto flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Minimal header - updated to match SimplifiedView styling */}
      <div className="bg-[#1a2235] text-white py-3 px-5 flex items-center justify-between sticky top-0 z-[10000]" style={{
      height: '70px'
    }}>
        <div className="text-3xl font-bold">{formattedTime}</div>
        {/* Centered date with fixed positioning - updated with both navigation arrows */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          {/* Left arrow - always visible, goes back in time */}
          <button onClick={goToPreviousDay} className="mr-4 p-2 rounded-full bg-gray-800 hover:bg-[#004b81] dark:hover:bg-gray-700 transition-colors flex items-center justify-center" aria-label="View previous day" disabled={isYesterdayView} style={{
          width: '40px',
          height: '40px',
          opacity: isYesterdayView ? 0.5 : 1
        }}>
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
          <div className="text-3xl font-bold">{formattedDate}</div>
          {/* Right arrow - always visible, goes forward in time */}
          <button onClick={goToNextDay} className="ml-4 p-2 rounded-full bg-gray-800 hover:bg-[#004b81] dark:hover:bg-gray-700 transition-colors flex items-center justify-center" aria-label="View next day" disabled={isTomorrow} style={{
          width: '40px',
          height: '40px',
          opacity: isTomorrow ? 0.5 : 1
        }}>
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        <div className="text-3xl font-bold">Calls and Room Radar</div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Room status grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomStatuses.map(status => <div key={status.room} className={`rounded-lg shadow-lg p-4 ${status.isVip ? 'bg-red-100 dark:bg-red-900/30 border-l-8 border-red-600' : status.status === 'busy' ? 'bg-white dark:bg-gray-800 border-l-8 border-blue-600' : 'bg-green-100 dark:bg-green-900/30 border-l-8 border-green-600'}`}>
              <div className="flex flex-col relative">
                {/* Star icon for VIP */}
                {status.isVip && <div className="absolute top-1 right-1">
                    <StarIcon size={28} className="text-red-500 dark:text-red-400" />
                  </div>}
                <div className="flex items-center">
                  {/* Phone icon for calls - more prominent */}
                  {status.status === 'busy' && status.isCall && <PhoneCallIcon size={32} className="mr-3 text-blue-600 dark:text-blue-400" />}
                  <div className="text-4xl font-bold mb-2">{status.room}</div>
                </div>
                <div className={`text-2xl font-bold ${status.isVip ? 'text-red-700 dark:text-red-400' : status.status === 'busy' ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'}`}>
                  {status.status === 'busy' ? 'BUSY' : 'AVAILABLE'}
                </div>
                {status.status === 'busy' && status.activeMeeting && <div className="mt-2">
                    <div className="text-xl font-medium">
                      {status.activeMeeting.name}
                      {status.needsAv && <span className="ml-2 inline-block">
                          <AVSupportIcon size={24} className="text-blue-600 dark:text-blue-400" />
                        </span>}
                    </div>
                    {status.isCall && <div className="flex justify-between items-center mt-1">
                        <div className="text-sm font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded inline-block">
                          {status.callType}
                        </div>
                      </div>}
                    <div className="text-lg flex justify-between items-center">
                      <span>
                        Until{' '}
                        {formatTimeToMilitary(status.activeMeeting.endTime)}
                      </span>
                      {status.isVip && <span className="text-red-600 dark:text-red-400 font-bold flex items-center">
                          <StarIcon size={18} className="mr-1" />
                          VIP
                        </span>}
                    </div>
                  </div>}
                {status.status === 'available' && status.nextMeeting && <div className="mt-2">
                    <div className="text-lg flex items-center">
                      {status.nextMeeting.isCall && <PhoneCallIcon size={20} className="mr-2 text-gray-500 dark:text-gray-400" />}
                      <span>
                        Next:{' '}
                        {formatTimeToMilitary(status.nextMeeting.startTime)} -{' '}
                        {status.nextMeeting.name}
                      </span>
                      {status.nextMeeting.isHighProfile && <span className="ml-2 text-red-600 dark:text-red-400 font-bold flex items-center">
                          <StarIcon size={16} className="mr-1" />
                          VIP
                        </span>}
                    </div>
                  </div>}
              </div>
            </div>)}
        </div>

        {/* Call Information Section */}
        {callInformation.length > 0 && <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="text-2xl font-bold mb-3 dark:text-white flex items-center">
              CALLS
              <PhoneCallIcon size={24} className="ml-2 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-3">
              {callInformation.map((call, index) => {
            const formattedTime = formatTimeToMilitary(call.startTime);
            const audience = getAudience(call);
            const isSecure = isSecureCall(call);
            return <div key={`call-${index}`} className="p-3.5 rounded-lg border-l-6 bg-white dark:bg-gray-800 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3.5 flex-wrap">
                          {/* Time - decreased by 5% */}
                          <span className="font-bold text-[2.09rem]">
                            {formattedTime}
                          </span>
                          {/* Audience - decreased by 5% */}
                          <span className="text-gray-700 dark:text-gray-300 text-[1.881rem]">
                            {audience}
                          </span>
                          {/* Secure/Non-secure badge - decreased by 5% */}
                          {isSecure ? <span className="ml-auto px-3.5 py-1.5 rounded-full font-bold text-[1.254rem] bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 border-2 border-green-500">
                              SECURE
                            </span> : <span className="ml-auto px-3.5 py-1.5 rounded-full font-bold text-[1.254rem] bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border-2 border-yellow-500">
                              NON-SECURE
                            </span>}
                        </div>
                      </div>
                    </div>
                  </div>;
          })}
            </div>
          </div>}

        {/* Simplified Upcoming Activity Section - with VIP alerts moved inside */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="text-2xl font-bold mb-3 dark:text-white">
            {isTomorrow ? 'SCHEDULED' : isYesterdayView ? 'PAST' : 'UPCOMING'}
          </div>
          {/* VIP Alert Banner - Moved here */}
          {alertStatuses && <div className="mb-4">
              {Array.isArray(alertStatuses) ? <div className="space-y-2">
                  {alertStatuses.map((status, index) => <div key={`alert-${index}`} className={`${status.color} rounded-lg shadow-md p-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        {status.icon}
                        <span className="text-xl font-bold">
                          {status.message}
                        </span>
                      </div>
                    </div>)}
                </div> : <div className={`${alertStatuses.color} rounded-lg shadow-md p-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {alertStatuses.icon}
                    <span className="text-xl font-bold">
                      {alertStatuses.message}
                    </span>
                  </div>
                </div>}
            </div>}
          {upcomingActivities.length > 0 ? <div className="space-y-3">
              {upcomingActivities.map((meeting, index) => {
            const formattedTime = formatTimeToMilitary(meeting.startTime);
            const audience = getAudience(meeting);
            const isCall = meeting.isCall;
            const isVip = meeting.isHighProfile;
            const isSecure = isCall ? isSecureCall(meeting) : false;
            return <div key={index} className={`p-4 rounded-lg border-l-6 ${isVip ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Larger time display */}
                          <span className="font-bold text-2xl">
                            {formattedTime}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-xl mx-1">
                            |
                          </span>
                          {/* Room or audience with larger text */}
                          <span className="font-medium text-xl">
                            {isCall ? audience : meeting.room}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-xl mx-1">
                            |
                          </span>
                          {/* Phone icon for calls - moved before meeting name for better visibility */}
                          {isCall && <PhoneCallIcon size={28} className="mr-2 text-blue-600 dark:text-blue-400" />}
                          {/* Meeting name with larger text */}
                          <span className="font-medium text-xl">
                            {meeting.name}
                          </span>
                          {/* VIP indicator with larger star icon */}
                          {isVip && <span className="ml-3 text-red-600 dark:text-red-400 font-bold flex items-center">
                              <StarIcon size={24} className="mr-1" />
                              <span className="text-xl">VIP</span>
                            </span>}
                          {/* Larger secure/non-secure tag */}
                          {isCall && <span className={`ml-auto px-3 py-1.5 rounded-full font-bold text-base ${isSecure ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'}`}>
                              {isSecure ? 'SECURE' : 'NON-SECURE'}
                            </span>}
                        </div>
                      </div>
                    </div>
                  </div>;
          })}
            </div> : <div className="text-lg text-center py-4 text-gray-500 dark:text-gray-400">
              No {isYesterdayView ? 'past' : 'upcoming'} meetings or calls
              scheduled{' '}
              {isTomorrow ? 'for tomorrow' : isYesterdayView ? 'from yesterday' : 'in the next 3 hours'}
            </div>}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-auto mb-3 flex justify-center gap-3">
          <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-2 px-3 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold">
            <ArrowLeftIcon size={20} />
            <span>Simplified view</span>
          </Link>
          <Link to="/alternative" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-2 px-3 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold">
            <span>Alternative view</span>
            <ArrowRightIcon size={20} />
          </Link>
          <Link to="/past-meetings" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-2 px-3 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold">
            <span>Daily Recap</span>
            <ArrowRightIcon size={20} />
          </Link>
        </div>
      </div>
    </div>;
};
export default OperationsDashboard;