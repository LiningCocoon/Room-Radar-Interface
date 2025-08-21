import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, PhoneCallIcon } from 'lucide-react';
import SimplifiedTimeSlot from './SimplifiedTimeSlot';
import SimplifiedMeetingCard from './SimplifiedMeetingCard';
import { parseTime, timeToMinutes } from '../utils/timeUtils';
// Call data interface
interface Call {
  name: string;
  startTime: string;
  endTime: string;
  audience: string;
  isSecure: boolean;
  isVip?: boolean;
  callType: string;
}
interface CallsMainWallProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const CallsMainWall: React.FC<CallsMainWallProps> = ({
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
  // Calculate if we're viewing today, yesterday, or another day
  const isToday = selectedDate.toDateString() === new Date().toDateString();
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
    // Only allow going to next day if we're viewing a past day
    if (isViewingPastDay) {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 1);
      setSelectedDate(newDate);
    }
  };
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  // Call types for columns
  const callTypes = ['Conference', 'External', 'Internal', 'Huddle', 'International'];
  // Updated time slots to military time
  const allTimeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  // Reference for auto-scrolling
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  // Function to calculate the 2-hour cutoff time slot
  const getTwoHourCutoffTimeSlot = () => {
    const twoHoursAgo = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000);
    const cutoffHour = twoHoursAgo.getHours();
    // Find the matching time slot
    const cutoffTimeSlot = allTimeSlots.find(slot => {
      const hourPart = parseInt(slot.split(':')[0]);
      return hourPart === cutoffHour;
    });
    return cutoffTimeSlot;
  };
  // Auto-scroll to the 2-hour cutoff on load (only for current day view)
  useEffect(() => {
    if (isToday && scrollTargetRef.current) {
      const cutoffTimeSlot = getTwoHourCutoffTimeSlot();
      if (cutoffTimeSlot) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          scrollTargetRef.current?.scrollIntoView({
            behavior: 'instant',
            block: 'start'
          });
        }, 100);
      }
    }
  }, [isToday]);
  // Mock calls data - we'll use this to populate our grid
  const getCallsData = (): Call[] => {
    return [
    // Conference calls
    {
      name: 'Weekly Team Sync',
      startTime: '09:00',
      endTime: '10:00',
      audience: 'Product Team',
      isSecure: false,
      callType: 'Conference'
    }, {
      name: 'Project Status Update',
      startTime: '11:30',
      endTime: '12:30',
      audience: 'Project Managers',
      isSecure: false,
      callType: 'Conference'
    }, {
      name: 'Executive Committee',
      startTime: '14:00',
      endTime: '15:30',
      audience: 'C-Suite',
      isSecure: true,
      isVip: true,
      callType: 'Conference'
    }, {
      name: 'Department Heads Sync',
      startTime: '16:00',
      endTime: '17:00',
      audience: 'Management',
      isSecure: true,
      callType: 'Conference'
    },
    // External calls
    {
      name: 'Client Presentation',
      startTime: '10:00',
      endTime: '11:00',
      audience: 'Acme Corp',
      isSecure: false,
      callType: 'External'
    }, {
      name: 'Investor Relations',
      startTime: '13:00',
      endTime: '14:00',
      audience: 'Venture Capital',
      isSecure: true,
      isVip: true,
      callType: 'External'
    }, {
      name: 'Partner Collaboration',
      startTime: '15:00',
      endTime: '16:00',
      audience: 'TechPartners Inc',
      isSecure: false,
      callType: 'External'
    },
    // Internal calls
    {
      name: 'HR Policy Update',
      startTime: '09:30',
      endTime: '10:30',
      audience: 'All Staff',
      isSecure: false,
      callType: 'Internal'
    }, {
      name: 'Product Roadmap Discussion',
      startTime: '12:00',
      endTime: '13:00',
      audience: 'Product & Engineering',
      isSecure: false,
      callType: 'Internal'
    }, {
      name: 'Security Briefing',
      startTime: '15:30',
      endTime: '16:30',
      audience: 'Security Team',
      isSecure: true,
      callType: 'Internal'
    },
    // Huddle calls
    {
      name: 'Morning Standup',
      startTime: '08:00',
      endTime: '08:30',
      audience: 'Engineering Team',
      isSecure: false,
      callType: 'Huddle'
    }, {
      name: 'Sprint Planning',
      startTime: '11:00',
      endTime: '12:00',
      audience: 'Development Team',
      isSecure: false,
      callType: 'Huddle'
    }, {
      name: 'Design Review',
      startTime: '14:30',
      endTime: '15:30',
      audience: 'Design Team',
      isSecure: false,
      callType: 'Huddle'
    },
    // International calls
    {
      name: 'APAC Market Update',
      startTime: '07:30',
      endTime: '08:30',
      audience: 'Global Teams',
      isSecure: false,
      callType: 'International'
    }, {
      name: 'European Partners Call',
      startTime: '10:30',
      endTime: '11:30',
      audience: 'European Team',
      isSecure: false,
      callType: 'International'
    }, {
      name: 'Global Strategy Alignment',
      startTime: '16:30',
      endTime: '17:30',
      audience: 'Leadership Team',
      isSecure: true,
      isVip: true,
      callType: 'International'
    }];
  };
  const allCalls = getCallsData();
  // Helper to get hour from time string
  const getHourFromTimeString = (timeStr: string) => {
    if (timeStr.includes(':')) {
      return parseInt(timeStr.split(':')[0]);
    }
    const time = parseTime(timeStr);
    return time.hours;
  };
  // Helper to check if a call spans across the given time slot
  const callSpansTimeSlot = (call: Call, timeSlotStr: string) => {
    const timeSlotHour = getHourFromTimeString(timeSlotStr);
    const startHour = getHourFromTimeString(call.startTime);
    const endHour = getHourFromTimeString(call.endTime);
    // If call starts at this hour
    if (startHour === timeSlotHour) return true;
    // If call spans this hour (starts before and ends after)
    if (startHour < timeSlotHour && endHour > timeSlotHour) return true;
    return false;
  };
  // Calculate the duration of a call in hours
  const getCallDurationHours = (call: Call) => {
    const startTime = parseTime(call.startTime);
    const endTime = parseTime(call.endTime);
    const startMinutes = startTime.hours * 60 + startTime.minutes;
    const endMinutes = endTime.hours * 60 + endTime.minutes;
    return Math.round((endMinutes - startMinutes) / 60);
  };
  // Function to get the call for a type at a specific time slot
  const getCallForTypeAndTime = (type: string, timeSlot: string) => {
    // Get all calls for this type
    const typeCalls = allCalls.filter(call => call.callType === type);
    // Find calls that start in or span across this time slot
    const relevantCalls = typeCalls.filter(call => callSpansTimeSlot(call, timeSlot));
    if (relevantCalls.length === 0) {
      return null;
    }
    // Return the call with duration information
    const call = relevantCalls[0];
    const duration = getCallDurationHours(call);
    return {
      ...call,
      duration: duration
    };
  };
  // Determine if a call should be displayed in this time slot
  // We only want to show a call card at its starting time slot
  const shouldDisplayCallInTimeSlot = (call: any, timeSlot: string) => {
    if (!call) return false; // Skip if no call
    const callStartHour = getHourFromTimeString(call.startTime);
    const timeSlotHour = getHourFromTimeString(timeSlot);
    return callStartHour === timeSlotHour;
  };
  // Determine if a call starts in the first half (:00/:15) or second half (:30/:45) of the hour
  const getStartPositionInHour = (call: any) => {
    if (!call) return 'top'; // Default for empty slots
    const minutesPart = parseTime(call.startTime).minutes;
    return minutesPart < 30 ? 'top' : 'bottom';
  };
  // Check if this is the current time slot
  const isCurrentTimeSlot = (timeSlot: string) => {
    const timeSlotHour = parseInt(timeSlot.split(':')[0]);
    return timeSlotHour === currentTime.getHours() && isToday;
  };
  // Calculate the exact position based on minutes within the hour
  const calculatePositionOffset = (call: any) => {
    const startTime = parseTime(call.startTime);
    return startTime.minutes;
  };
  // Calculate the precise duration in minutes
  const getCallDurationMinutes = (call: any) => {
    if (!call || !call.endTime) return 60; // Default to 1 hour
    const startTime = parseTime(call.startTime);
    const endTime = parseTime(call.endTime);
    const startMinutes = startTime.hours * 60 + startTime.minutes;
    const endMinutes = endTime.hours * 60 + endTime.minutes;
    return endMinutes - startMinutes;
  };
  return <div className="flex-1 overflow-auto flex flex-col h-full">
      {/* Minimal context-aware header with vertically centered elements */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#1a2235] dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 shadow-md">
        <div className="flex items-center px-4 py-3">
          {/* Navigation arrows with tooltips */}
          <button onClick={goToPreviousDay} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="View previous day" title="View previous day">
            <ChevronLeftIcon className="h-7 w-7 text-white" />
          </button>
          {/* Only show next day button if we're not on today */}
          {isViewingPastDay && <button onClick={goToNextDay} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="View next day" title="View next day">
              <ChevronRightIcon className="h-7 w-7 text-white" />
            </button>}
          {/* Current date display - enlarged for better readability */}
          <h2 className="text-3xl font-bold text-white mr-6">
            {formattedDate}
          </h2>
          {/* Today button - only show when not viewing today */}
          {!isToday && <button onClick={goToToday} className="mr-6 px-3 py-1 text-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors" aria-label="Return to today" title="Return to today">
              Today
            </button>}
          {/* Calls Radar title */}
          <div className="ml-auto">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <PhoneCallIcon size={28} className="mr-2 text-white" />
              Calls Radar
            </h2>
          </div>
        </div>
      </div>
      {/* Add padding to prevent content from being hidden under the fixed header */}
      <div className="pt-[70px]">
        {/* Call Grid - Show all time slots */}
        <div className="space-y-0 flex-1">
          {allTimeSlots.map((timeSlot, index) => {
          // Only use dark blue for current time slot
          const isActive = isCurrentTimeSlot(timeSlot);
          const rowBgColor = isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900';
          // Determine if this is the cutoff slot for auto-scrolling
          const isCutoffSlot = isToday && timeSlot === getTwoHourCutoffTimeSlot();
          // Get the hour for this time slot
          const timeSlotHour = parseInt(timeSlot.split(':')[0]);
          return <div key={timeSlot} className={`${rowBgColor} w-full py-2 border-b border-gray-200 dark:border-gray-800 relative meeting-grid-row`} ref={isCutoffSlot ? scrollTargetRef : null} style={{
            minHeight: '100px',
            position: 'relative'
          }}>
                <div className="grid grid-cols-6 gap-2 relative">
                  <SimplifiedTimeSlot time={timeSlot} currentTime={currentTime} militaryTime={true} />
                  {callTypes.map(callType => {
                // Get all calls that start in this hour for this type
                const typeCalls = allCalls.filter(call => call.callType === callType);
                // Find calls that start in this hour
                const callsInHour = typeCalls.filter(call => {
                  const callStartHour = getHourFromTimeString(call.startTime);
                  return callStartHour === timeSlotHour;
                });
                // If no calls start in this hour, return empty div
                if (callsInHour.length === 0) {
                  return <div key={`${callType}-${timeSlot}-empty`} className="col-span-1 relative"></div>;
                }
                // Render all calls that start in this hour with precise positioning
                return <div key={`${callType}-${timeSlot}`} className="col-span-1 relative" style={{
                  minHeight: '100px'
                }}>
                        {callsInHour.map((call, idx) => {
                    // Calculate precise position and height
                    const startMinutes = calculatePositionOffset(call);
                    const durationMinutes = getCallDurationMinutes(call);
                    const durationHours = durationMinutes / 60;
                    // Calculate position within the hour (1.67px per minute)
                    const topOffset = startMinutes * 1.67;
                    // Calculate height based on exact duration (1.67px per minute)
                    const cardHeight = Math.max(100, durationMinutes * 1.67);
                    // Convert call to meeting format for SimplifiedMeetingCard
                    const callAsMeeting = {
                      name: `${call.name} - ${call.audience}`,
                      startTime: call.startTime,
                      endTime: call.endTime,
                      room: call.callType,
                      isHighProfile: call.isVip,
                      avSupport: call.isSecure,
                      isCall: true,
                      callType: call.callType,
                      audience: call.audience
                    };
                    return <div key={`${call.startTime}-${idx}`} className="absolute left-0 right-2 z-10" style={{
                      top: `${topOffset}px`,
                      height: `${cardHeight}px`
                    }}>
                              <SimplifiedMeetingCard meeting={callAsMeeting} currentTime={currentTime} duration={durationHours} showDurationBadge={durationHours >= 2} startPosition="top" militaryTime={true} isYesterday={!isToday && isViewingPastDay} absolutePositioned={true} expandable={true} isCall={true} />
                            </div>;
                  })}
                      </div>;
              })}
                </div>
              </div>;
        })}
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="mt-4 mb-2 flex justify-center gap-4">
        <Link to="/main-wall" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold md:inline-flex hidden">
          <span>Main Wall</span>
        </Link>
        <Link to="/side-wall" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold md:inline-flex hidden">
          <span>Side Wall</span>
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>;
};
export default CallsMainWall;