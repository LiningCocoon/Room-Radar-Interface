import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PhoneCallIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import { parseTime } from '../utils/timeUtils';
interface OperationsDashboardProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  currentTime,
  isYesterday = false
}) => {
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
  // Format the selected date
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
  // Convert time to military format
  const formatTimeToMilitary = (timeStr: string) => {
    const time = parseTime(timeStr);
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  };
  // Get upcoming activities (next 3 hours or tomorrow's activities)
  const getUpcomingActivities = () => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    if (isTomorrowView) {
      // Show all meetings for tomorrow
      return meetingData.filter(m => m.name !== 'Available');
    }
    if (isViewingPastDay) {
      // Show all meetings for past days
      return meetingData.filter(m => m.name !== 'Available');
    }
    // For today, show meetings in next 3 hours
    return meetingData.filter(meeting => {
      if (meeting.name === 'Available') return false;
      const startTime = parseTime(meeting.startTime);
      const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
      const hoursUntil = (startTimeInMinutes - currentTimeInMinutes) / 60;
      return hoursUntil >= 0 && hoursUntil <= 3;
    }).sort((a, b) => {
      const aTime = parseTime(a.startTime);
      const bTime = parseTime(b.startTime);
      return aTime.hours * 60 + aTime.minutes - (bTime.hours * 60 + bTime.minutes);
    });
  };
  const upcomingActivities = getUpcomingActivities();
  // Helper functions for call detection
  const isSecureCall = (meeting: any) => {
    return meeting.name.toLowerCase().includes('secure') || meeting.name.toLowerCase().includes('classified') || meeting.room === 'Executive';
  };
  const getAudience = (meeting: any) => {
    if (meeting.name.includes('Team')) return 'Internal Team';
    if (meeting.name.includes('Client')) return 'External Client';
    if (meeting.name.includes('Board')) return 'Board Members';
    if (meeting.name.includes('Planning')) return 'Planning Committee';
    return 'General Audience';
  };
  return <div className="flex-1 overflow-auto flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 shadow-md">
        <div className="flex items-center px-4 py-3">
          <button onClick={goToPreviousDay} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeftIcon className="h-7 w-7 text-gray-700 dark:text-gray-300" />
          </button>
          <button onClick={goToNextDay} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronRightIcon className="h-7 w-7 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-3xl font-bold dark:text-white mr-6">
            Operations Dashboard - {formattedDate}
          </h2>
          {!isToday && <button onClick={goToToday} className="mr-6 px-3 py-1 text-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors">
              Today
            </button>}
        </div>
      </div>

      {/* Main content with top margin of 8px and row padding of 8px */}
      <div className="pt-[80px] p-3 flex flex-col h-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 mt-2">
          <div className="text-3xl font-bold mb-3 dark:text-white">
            {isTomorrowView ? 'SCHEDULED ACTIVITY' : isYesterdayView ? 'PAST ACTIVITY' : 'UPCOMING (NEXT 3 HOURS)'}
          </div>
          {upcomingActivities.length > 0 ? <div className="space-y-4">
              {upcomingActivities.map((meeting, index) => {
            const formattedTime = formatTimeToMilitary(meeting.startTime);
            const audience = getAudience(meeting);
            const isCall = meeting.name.toLowerCase().includes('call') || meeting.name.toLowerCase().includes('sync');
            const isVip = meeting.isHighProfile;
            const isSecure = isCall ? isSecureCall(meeting) : false;
            return <div key={index} className={`p-2 rounded-lg border-l-6 ${isVip ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="font-bold text-2xl">
                            {formattedTime}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-xl mx-1">
                            |
                          </span>
                          <span className="font-medium text-xl">
                            {isCall ? audience : meeting.room}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-xl mx-1">
                            |
                          </span>
                          <span className="font-medium text-xl">
                            {meeting.name}
                          </span>
                          {isCall && <PhoneCallIcon size={28} className="ml-3 text-blue-600 dark:text-blue-400" />}
                          {isVip && <span className="ml-4 text-red-600 dark:text-red-400 font-bold flex items-center">
                              <StarIcon size={24} className="mr-2" />
                              <span className="text-xl">VIP</span>
                            </span>}
                          {isCall && <span className={`ml-auto px-4 py-2 rounded-full font-bold text-base ${isSecure ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'}`}>
                              {isSecure ? 'SECURE' : 'NON-SECURE'}
                            </span>}
                        </div>
                      </div>
                    </div>
                  </div>;
          })}
            </div> : <div className="text-lg text-center py-3 text-gray-500 dark:text-gray-400">
              No {isYesterdayView ? 'past' : 'upcoming'} activity{' '}
              {isTomorrowView ? 'scheduled for tomorrow' : isYesterdayView ? 'from yesterday' : 'in the next 3 hours'}
            </div>}
        </div>

        {/* Navigation */}
        <div className="mt-auto mb-2 flex justify-center">
          <Link to="/alternative" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-3 py-3 px-5 rounded-lg border-2 border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold">
            <ArrowLeftIcon size={24} />
            <span>Back to Alternative View</span>
          </Link>
        </div>
      </div>
    </div>;
};
export default OperationsDashboard;