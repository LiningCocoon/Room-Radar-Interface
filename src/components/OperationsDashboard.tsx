import React, { useEffect, useMemo, useState } from 'react';
import { ClockIcon, AlertTriangleIcon, CheckCircleIcon, AlertCircleIcon, PhoneIcon, PhoneCallIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import AVSupportIcon from './AVSupportIcon';
import { parseTime } from '../utils/timeUtils';
interface OperationsDashboardProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  currentTime,
  isYesterday = false
}) => {
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
  // Format the date
  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
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
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  // Calculate meeting status
  const getMeetingStatus = (meeting: any) => {
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
  const activeMeetings = convertedMeetings.filter(m => getMeetingStatus(m) === 'active');
  const upcomingMeetings = convertedMeetings.filter(m => getMeetingStatus(m) === 'upcoming');
  // Find active or soon VIP meetings (including VIP calls)
  const activeVipMeetings = activeMeetings.filter(m => m.isHighProfile);
  const soonVipMeetings = upcomingMeetings.filter(m => m.isHighProfile && getMinutesUntilMeeting(m) <= 10);
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
  // Get VIP title/role based on meeting name or room
  const getVipTitle = (meeting: any) => {
    if (meeting.room === 'Executive') {
      if (meeting.name.includes('Review')) return 'CEO';
      if (meeting.name.includes('Planning')) return 'COO';
      if (meeting.name.includes('Client')) return 'SVP';
      if (meeting.name.includes('Board')) return 'Chairman';
      if (meeting.name.includes('All-Hands')) return 'CEO';
      if (meeting.name.includes('International')) return 'President';
      return 'Executive';
    }
    if (meeting.room === 'JFK') {
      if (meeting.name.includes('Planning')) return 'Director';
      if (meeting.name.includes('Brief')) return 'VP';
      if (meeting.name.includes('Committee')) return 'CFO';
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
  // Calculate alert status - ONLY for VIP meetings and calls
  const getAlertStatus = () => {
    if (activeVipMeetings.length > 0) {
      const vipMeeting = activeVipMeetings[0];
      const vipTitle = getVipTitle(vipMeeting);
      const meetingType = vipMeeting.isCall ? vipMeeting.callType : 'Meeting';
      return {
        type: 'vip-active',
        message: `${vipMeeting.room}: ${vipMeeting.name} until ${formatTimeToMilitary(vipMeeting.endTime)} - ${vipTitle}`,
        color: 'bg-red-600 text-white',
        icon: vipMeeting.isCall ? <PhoneCallIcon size={32} className="text-white" /> : <AlertCircleIcon size={32} className="text-white" />
      };
    } else if (soonVipMeetings.length > 0) {
      const vipMeeting = soonVipMeetings[0];
      const vipTitle = getVipTitle(vipMeeting);
      const arrivalText = vipMeeting.isCall ? 'VIP CALL STARTING' : 'VIP ARRIVING';
      return {
        type: 'vip-soon',
        message: `${arrivalText} - ${vipMeeting.room}: ${vipMeeting.name} at ${formatTimeToMilitary(vipMeeting.startTime)} - ${vipTitle}`,
        color: 'bg-red-600 text-white',
        icon: vipMeeting.isCall ? <PhoneCallIcon size={32} className="text-white" /> : <AlertCircleIcon size={32} className="text-white" />
      };
    }
    // Return null when no VIP meetings are active or upcoming
    return null;
  };
  const alertStatus = getAlertStatus();
  // Format time to military format
  const formatTimeToMilitary = (timeStr: string) => {
    const time = parseTime(timeStr);
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  };
  // Generate upcoming changes
  const generateUpcomingChanges = () => {
    const changes = [];
    // Add room status changes
    const statusChanges = [...activeMeetings, ...upcomingMeetings].filter(m => {
      const minutesUntil = m.endTime ? getMinutesUntilMeetingEnds(m) : getMinutesUntilMeeting(m);
      return minutesUntil > 0 && minutesUntil < 120; // Next 2 hours
    }).sort((a, b) => {
      const aTime = a.endTime ? parseTime(a.endTime).hours * 60 + parseTime(a.endTime).minutes : parseTime(a.startTime).hours * 60 + parseTime(a.startTime).minutes;
      const bTime = b.endTime ? parseTime(b.endTime).hours * 60 + parseTime(b.endTime).minutes : parseTime(b.startTime).hours * 60 + parseTime(b.startTime).minutes;
      return aTime - bTime;
    });
    statusChanges.forEach(meeting => {
      if (getMeetingStatus(meeting) === 'active') {
        changes.push(`${formatTimeToMilitary(meeting.endTime)} - ${meeting.room} will be free`);
      } else {
        const activityType = meeting.isCall ? meeting.callType : 'Meeting';
        changes.push(`${formatTimeToMilitary(meeting.startTime)} - ${meeting.room} will be used for ${meeting.name}${meeting.isHighProfile ? ' (VIP)' : ''}`);
      }
    });
    return changes.slice(0, 3); // Return at most 3 changes
  };
  const changes = generateUpcomingChanges();
  return <div className="flex-1 overflow-auto flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Minimal header */}
      <div className="bg-[#1a2235] text-white py-2 px-4 flex items-center justify-between sticky top-0 z-[10000]" style={{
      height: '60px'
    }}>
        <div className="text-3xl font-bold">{formattedTime}</div>
        <div className="text-xl font-medium">{formattedDate}</div>
        <div className="text-lg">Room Radar</div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Alert bar - Only show for VIP meetings */}
        {alertStatus && <div className={`${alertStatus.color} rounded-lg shadow-lg p-4 flex items-center justify-between`} style={{
        height: '80px'
      }}>
            <div className="flex items-center gap-3">
              {alertStatus.icon}
              <span className="text-3xl font-bold">{alertStatus.message}</span>
            </div>
          </div>}
        {/* Room status grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomStatuses.map(status => <div key={status.room} className={`rounded-lg shadow-lg p-4 ${status.isVip ? 'bg-red-100 dark:bg-red-900/30 border-l-8 border-red-600' : status.status === 'busy' ? 'bg-blue-100 dark:bg-blue-900/30 border-l-8 border-blue-600' : 'bg-green-100 dark:bg-green-900/30 border-l-8 border-green-600'}`}>
              <div className="flex flex-col relative">
                {/* Phone icon for calls */}
                {status.status === 'busy' && status.isCall && <div className="absolute top-1 right-1">
                    <PhoneIcon size={20} className={status.isVip ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'} />
                  </div>}
                <div className="text-4xl font-bold mb-2">{status.room}</div>
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
                    {/* Call type indication */}
                    {status.isCall && <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {status.callType}
                      </div>}
                    <div className="text-lg">
                      Until {formatTimeToMilitary(status.activeMeeting.endTime)}
                      {status.isVip && <span className="ml-2 text-red-600 dark:text-red-400 font-bold text-[1.1em] bg-red-50 dark:bg-red-900/50 px-1.5 py-0.5 rounded">
                          VIP
                        </span>}
                    </div>
                  </div>}
                {status.status === 'available' && status.nextMeeting && <div className="mt-2">
                    <div className="text-lg">
                      Next: {formatTimeToMilitary(status.nextMeeting.startTime)}
                      {status.nextMeeting.isHighProfile && <span className="ml-2 text-red-600 dark:text-red-400 font-bold text-[1.1em] bg-red-50 dark:bg-red-900/50 px-1.5 py-0.5 rounded">
                          VIP
                        </span>}
                      {status.nextMeeting.isCall && <span className="ml-1 inline-block align-text-bottom">
                          <PhoneIcon size={14} className="text-gray-500 dark:text-gray-400" />
                        </span>}
                    </div>
                  </div>}
              </div>
            </div>)}
        </div>
        {/* Upcoming changes - Updated with more natural language */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="text-2xl font-bold mb-2 dark:text-white">
            UPCOMING CHANGES
          </div>
          <ul className="space-y-2">
            {changes.map((change, index) => <li key={index} className="text-lg dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-1">
                {change}
              </li>)}
            {changes.length === 0 && <li className="text-lg dark:text-gray-200">
                No upcoming changes in the next 2 hours
              </li>}
          </ul>
        </div>
      </div>
    </div>;
};
export default OperationsDashboard;