import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ClockIcon, MapPinIcon, CalendarIcon, ArrowRightIcon, PresentationIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import AVSupportIcon from './AVSupportIcon';
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
  // Parse time from meeting
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(/(?=[AP]M)/);
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    const isPM = period === 'PM' && hours !== 12;
    return {
      hours: isPM ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours,
      minutes: minutes || 0
    };
  };
  // Calculate meeting status
  const getMeetingStatus = (meeting: any) => {
    const startTime = parseTime(meeting.startTime);
    const endTime = meeting.endTime ? parseTime(meeting.endTime) : null;
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    const endTimeInMinutes = endTime ? endTime.hours * 60 + endTime.minutes : startTimeInMinutes + 60;
    // Check if meeting is more than 2 hours in the past
    if (currentTimeInMinutes - startTimeInMinutes >= 120) {
      return 'past-history';
    }
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
  // Filter meetings - exclude those that are more than 2 hours in the past
  const currentMeetings = meetingData.filter(meeting => getMeetingStatus(meeting) === 'active');
  // Get upcoming meetings and filter by urgency and priority
  const upcomingMeetings = meetingData.filter(meeting => getMeetingStatus(meeting) === 'upcoming');
  // Urgent meetings are starting within 15 minutes
  const urgentMeetings = upcomingMeetings.filter(meeting => {
    const minutesUntil = getMinutesUntilMeeting(meeting);
    return minutesUntil <= 15 && minutesUntil > 0;
  });
  // Separate high profile urgent meetings
  const highProfileUrgent = urgentMeetings.filter(m => m.isHighProfile);
  const regularUrgent = urgentMeetings.filter(m => !m.isHighProfile);
  // Later meetings (more than 15 minutes away)
  const laterMeetings = upcomingMeetings.filter(meeting => {
    const minutesUntil = getMinutesUntilMeeting(meeting);
    return minutesUntil > 15;
  }).slice(0, 6); // Limit to prevent overflow
  return <div className="flex-1 p-4 md:p-6 h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1 gap-4 md:gap-6">
        {/* Current Meetings Section - Stacked on mobile */}
        <section className="flex-1">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <ClockIcon className="text-[#005ea2] dark:text-[#4d9eff]" size={24} />
            <h2 className="text-xl md:text-3xl font-bold dark:text-white">
              Happening Now
            </h2>
          </div>
          {currentMeetings.length > 0 ? <div className="grid grid-cols-1 gap-3 md:gap-4">
              {currentMeetings.map(meeting => <div key={`${meeting.name}-${meeting.startTime}-${meeting.room}`} className="bg-[#e6f3ff] dark:bg-[#0a2e4f] border-2 border-[#005ea2] dark:border-[#2c79c7] rounded-lg p-3 md:p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-1 md:mb-2">
                    <MapPinIcon size={18} className="text-[#005ea2] dark:text-[#4d9eff]" />
                    <span className="text-lg md:text-2xl font-bold text-[#005ea2] dark:text-[#4d9eff]">
                      {meeting.room}
                    </span>
                    {meeting.avSupport && <AVSupportIcon size={18} className="text-[#005ea2] dark:text-[#4d9eff] ml-1" />}
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 dark:text-white">
                    {meeting.name}
                  </h3>
                  <div className="flex items-center gap-1 md:gap-2">
                    <ClockIcon size={16} className="dark:text-gray-300" />
                    <p className="text-base md:text-xl dark:text-gray-300">
                      {meeting.startTime} - {meeting.endTime}
                    </p>
                  </div>
                </div>)}
            </div> : <div className="bg-[#f0fff4] dark:bg-[#0a2e18] border-2 border-dashed border-[#00a91c] dark:border-[#2c9d42] rounded-lg p-3 md:p-6 text-center">
              <p className="text-lg md:text-2xl font-bold text-[#00a91c] dark:text-[#2c9d42]">
                All Rooms Available
              </p>
              <p className="text-base md:text-lg mt-1 md:mt-2 dark:text-gray-300">
                No meetings currently in progress
              </p>
            </div>}
        </section>

        {/* Enhanced Coming Up Next Section */}
        <section className="flex-1 mt-4 md:mt-0">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <CalendarIcon className="text-[#005ea2] dark:text-[#4d9eff]" size={24} />
            <h2 className="text-xl md:text-3xl font-bold dark:text-white">
              Coming Up Next
            </h2>
          </div>

          {/* High Profile Urgent Section */}
          {highProfileUrgent.length > 0 && <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl md:text-2xl font-bold text-red-700 dark:text-red-400">
                  High Priority - Starting Soon
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {highProfileUrgent.map(meeting => <div key={`${meeting.name}-${meeting.startTime}`} className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-4 shadow-md">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPinIcon size={16} className="text-red-600 dark:text-red-400" />
                          <span className="text-lg font-bold text-red-600 dark:text-red-400">
                            {meeting.room}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1 dark:text-white">
                          {meeting.name}
                        </h3>
                        <p className="text-base dark:text-gray-300">
                          {meeting.startTime} • Starts in{' '}
                          {getMinutesUntilMeeting(meeting)} min
                        </p>
                      </div>
                      {meeting.avSupport && <AVSupportIcon size={20} className="text-red-600 dark:text-red-400 ml-2" />}
                    </div>
                  </div>)}
              </div>
            </div>}

          {/* Regular Urgent Section */}
          {regularUrgent.length > 0 && <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="text-orange-600 dark:text-orange-400" size={20} />
                <h2 className="text-lg md:text-xl font-bold text-orange-700 dark:text-orange-400">
                  Starting Within 15 Minutes
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {regularUrgent.map(meeting => <div key={`${meeting.name}-${meeting.startTime}`} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPinIcon size={14} className="text-orange-600 dark:text-orange-400" />
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {meeting.room}
                          </span>
                        </div>
                        <h4 className="font-bold dark:text-white">
                          {meeting.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {meeting.startTime} •{' '}
                          {getMinutesUntilMeeting(meeting)} min
                        </p>
                      </div>
                      {meeting.avSupport && <AVSupportIcon size={16} className="text-orange-600 dark:text-orange-400" />}
                    </div>
                  </div>)}
              </div>
            </div>}

          {/* Later Meetings - Compact Grid */}
          {laterMeetings.length > 0 && <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="text-[#005ea2] dark:text-[#4d9eff]" size={20} />
                <h2 className="text-lg md:text-xl font-bold dark:text-white">
                  Later Today
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {laterMeetings.map(meeting => <div key={`${meeting.name}-${meeting.startTime}`} className="border border-gray-300 dark:border-gray-700 rounded-lg p-2 dark:bg-gray-800 relative">
                    <h4 className="text-sm font-semibold dark:text-white truncate">
                      {meeting.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {meeting.startTime} • {meeting.room}
                    </p>
                    {meeting.avSupport && <div className="absolute top-2 right-2">
                        <AVSupportIcon size={14} className="text-gray-500 dark:text-gray-400" />
                      </div>}
                  </div>)}
              </div>
            </div>}

          {/* Empty state */}
          {upcomingMeetings.length === 0 && <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-xl font-bold text-gray-500 dark:text-gray-400">
                No Upcoming Meetings
              </p>
              <p className="text-lg mt-2 dark:text-gray-300">
                All rooms available for the rest of the day
              </p>
            </div>}
        </section>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-4 md:mt-6 mb-2 md:mb-4 flex justify-center gap-3 md:gap-4">
        <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 md:gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-sm md:text-base">
          <ArrowLeftIcon size={14} />
          <span>Simplified view</span>
        </Link>
        <Link to="/past-meetings" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 md:gap-2 py-1.5 md:py-2 px-3 md:px-4 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-sm md:text-base">
          <span>Past meetings</span>
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </div>;
};
export default AlternativeView;