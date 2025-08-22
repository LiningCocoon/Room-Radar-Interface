import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import SimplifiedTimeSlot from './SimplifiedTimeSlot';
import SimplifiedMeetingCard from './SimplifiedMeetingCard';
import { isOldMeeting, parseTime, timeToMinutes } from '../utils/timeUtils';
interface SimplifiedViewProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const SimplifiedView: React.FC<SimplifiedViewProps> = ({
  currentTime,
  isYesterday = false
}) => {
  // State for tracking the selected date
  const [selectedDate, setSelectedDate] = useState<Date>(isYesterday ? new Date(currentTime.getTime() - 24 * 60 * 60 * 1000) : new Date(currentTime));
  // Initialize the selected date once on component mount
  // but don't update it when isYesterday changes to allow manual navigation
  useEffect(() => {
    // Only set initial date on first render
    const initialDate = isYesterday ? new Date(currentTime.getTime() - 24 * 60 * 60 * 1000) : new Date(currentTime);
    setSelectedDate(initialDate);
  }, []); // Empty dependency array means this only runs once on mount
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
  // Updated room names: Reordered to put Small after Executive and before Breakout A
  const rooms = ['JFK', 'Executive', 'Small', 'Breakout A', 'Breakout B'];
  // Updated time slots to military time
  const allTimeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  // Reference for auto-scrolling
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  // Function to calculate the 2-hour cutoff time slot
  const getTwoHourCutoffTimeSlot = () => {
    const currentHour = currentTime.getHours();
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
  // Get meetings data
  const allMeetings = getMeetingData();
  // Convert legacy room names to new names for compatibility
  const convertedMeetings = allMeetings.map(meeting => {
    let newRoom = meeting.room;
    if (meeting.room === 'Breakout 1') newRoom = 'Breakout A';
    if (meeting.room === 'Breakout 2') newRoom = 'Breakout B';
    return {
      ...meeting,
      room: newRoom
    };
  });
  // Find the first VIP meeting across all rooms and time slots
  const allVipMeetings = convertedMeetings.filter(m => m.isHighProfile);
  const firstVipMeeting = allVipMeetings.length > 0 ? allVipMeetings[0] : null;
  // Helper to get hour from time string
  const getHourFromTimeString = (timeStr: string) => {
    // For military time format
    if (timeStr.includes(':') && !timeStr.includes('AM') && !timeStr.includes('PM')) {
      return parseInt(timeStr.split(':')[0]);
    }
    // For AM/PM format
    const time = parseTime(timeStr);
    return time.hours;
  };
  // Helper to check if a meeting spans across the given time slot
  const meetingSpansTimeSlot = (meeting: any, timeSlotStr: string) => {
    const timeSlotHour = getHourFromTimeString(timeSlotStr);
    const startHour = getHourFromTimeString(meeting.startTime);
    const endHour = getHourFromTimeString(meeting.endTime);
    // If meeting starts at this hour
    if (startHour === timeSlotHour) return true;
    // If meeting spans this hour (starts before and ends after)
    if (startHour < timeSlotHour && endHour > timeSlotHour) return true;
    return false;
  };
  // Calculate the duration of a meeting in hours
  const getMeetingDurationHours = (meeting: any) => {
    if (meeting.name === 'Available') return 0;
    const startTime = parseTime(meeting.startTime);
    const endTime = parseTime(meeting.endTime);
    const startMinutes = startTime.hours * 60 + startTime.minutes;
    const endMinutes = endTime.hours * 60 + endTime.minutes;
    return Math.round((endMinutes - startMinutes) / 60);
  };
  // Function to determine chairperson based on meeting type
  const getChairperson = (meeting: any): string | null => {
    // High-profile meetings and Executive room meetings
    if (meeting.isHighProfile || meeting.room === 'Executive') {
      if (meeting.name.includes('Board')) return 'Devon Black';
      if (meeting.name.includes('Review')) return 'Devon Black';
      if (meeting.name.includes('Planning')) return 'Nick Trees';
      if (meeting.name.includes('Client')) return 'Nick Trees';
      if (meeting.name.includes('Emergency')) return 'Carlos Salazar';
      if (meeting.name.includes('Investor')) return 'Carlos Salazar';
      if (meeting.name.includes('Leadership')) return 'Patty Smith';
      if (meeting.name.includes('All-Hands')) return 'Patty Smith';
      return 'Devon Black';
    }
    // JFK room meetings
    if (meeting.room === 'JFK') {
      if (meeting.name.includes('Leadership')) return 'Devon Black';
      if (meeting.name.includes('Strategy')) return 'Nick Trees';
      if (meeting.name.includes('Team')) return 'Carlos Salazar';
      if (meeting.name.includes('Stakeholder')) return 'Patty Smith';
      return 'Devon Black';
    }
    // Small room meetings
    if (meeting.room === 'Small') {
      if (meeting.name.includes('Design')) return 'Nick Trees';
      if (meeting.name.includes('Product')) return 'Carlos Salazar';
      if (meeting.name.includes('Requirements')) return 'Patty Smith';
      return 'Nick Trees';
    }
    // Breakout A meetings
    if (meeting.room === 'Breakout A') {
      if (meeting.name.includes('All-Hands')) return 'Devon Black';
      if (meeting.name.includes('Investor')) return 'Nick Trees';
      if (meeting.name.includes('Budget')) return 'Carlos Salazar';
      return 'Patty Smith';
    }
    // Breakout B meetings
    if (meeting.room === 'Breakout B') {
      if (meeting.name.includes('Training')) return 'Carlos Salazar';
      if (meeting.name.includes('Partner')) return 'Patty Smith';
      if (meeting.name.includes('Market')) return 'Devon Black';
      return 'Nick Trees';
    }
    // Default chairperson for any other meetings
    return 'Devon Black';
  };
  // Function to get the meeting for a room at a specific time slot
  const getMeetingForRoomAndTime = (room: string, timeSlot: string) => {
    // Get all meetings for this room
    const roomMeetings = convertedMeetings.filter(meeting => meeting.room === room);
    // Find meetings that start in or span across this time slot
    const relevantMeetings = roomMeetings.filter(meeting => meetingSpansTimeSlot(meeting, timeSlot));
    if (relevantMeetings.length === 0) {
      // Return null instead of "Available" placeholder
      return null;
    }
    // Return the meeting with chairperson information and duration
    const meeting = relevantMeetings[0];
    const duration = getMeetingDurationHours(meeting);
    return {
      ...meeting,
      chairperson: getChairperson(meeting),
      duration: duration
    };
  };
  // Determine if a meeting should be displayed in this time slot
  // We only want to show a meeting card at its starting time slot
  const shouldDisplayMeetingInTimeSlot = (meeting: any, timeSlot: string) => {
    if (!meeting) return false; // Skip if no meeting
    const meetingStartHour = getHourFromTimeString(meeting.startTime);
    const timeSlotHour = getHourFromTimeString(timeSlot);
    return meetingStartHour === timeSlotHour;
  };
  // Determine if a meeting starts in the first half (:00/:15) or second half (:30/:45) of the hour
  const getStartPositionInHour = (meeting: any) => {
    if (!meeting) return 'top'; // Default for empty slots
    const minutesPart = parseTime(meeting.startTime).minutes;
    return minutesPart < 30 ? 'top' : 'bottom';
  };
  // Check if this is the current time slot
  const isCurrentTimeSlot = (timeSlot: string) => {
    const timeSlotHour = parseInt(timeSlot.split(':')[0]);
    return timeSlotHour === currentTime.getHours() && isToday;
  };
  // Calculate the exact position based on minutes within the hour
  const calculatePositionOffset = (meeting: any) => {
    const startTime = parseTime(meeting.startTime);
    return startTime.minutes;
  };
  // Calculate the precise duration in minutes
  const getMeetingDurationMinutes = (meeting: any) => {
    if (!meeting || !meeting.endTime) return 60; // Default to 1 hour
    const startTime = parseTime(meeting.startTime);
    const endTime = parseTime(meeting.endTime);
    const startMinutes = startTime.hours * 60 + startTime.minutes;
    const endMinutes = endTime.hours * 60 + endTime.minutes;
    return endMinutes - startMinutes;
  };
  // Calculate grid opacity based on proximity to current hour
  const calculateGridOpacity = (timeSlotHour: number, currentHour: number, isToday: boolean) => {
    if (!isToday) return 0.15; // Consistent grounding for past/future days
    const distance = Math.abs(timeSlotHour - currentHour);
    if (distance === 0) return 0.6; // Current hour
    if (distance === 1) return 0.45; // Adjacent hours
    if (distance === 2) return 0.3; // Near current time
    if (distance === 3) return 0.2; // Supporting structure
    return 0.1; // Distant grounding
  };
  // Function to determine if a meeting is far in the future (more than 2 hours away)
  const isFarFutureMeeting = (meeting: any) => {
    if (!isToday || isYesterday) return false; // Only apply to today's view
    const meetingStartTime = parseTime(meeting.startTime);
    const meetingStartMinutes = meetingStartTime.hours * 60 + meetingStartTime.minutes;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    // More than 2 hours away (120 minutes)
    return meetingStartMinutes - currentMinutes > 120;
  };
  return <div className="flex-1 overflow-auto flex flex-col h-full">
      {/* New minimal context-aware header with vertically centered elements */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 shadow-md">
        <div className="flex items-center px-4 py-3">
          {/* Navigation arrows with tooltips */}
          <button onClick={goToPreviousDay} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="View previous day" title="View previous day">
            <ChevronLeftIcon className="h-7 w-7 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Only show next day button if we're not on today */}
          {isViewingPastDay && <button onClick={goToNextDay} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="View next day" title="View next day">
              <ChevronRightIcon className="h-7 w-7 text-gray-700 dark:text-gray-300" />
            </button>}

          {/* Current date display - enlarged for better readability */}
          <h2 className="text-3xl font-bold dark:text-white mr-6">
            {formattedDate}
          </h2>

          {/* Today button - only show when not viewing today */}
          {!isToday && <button onClick={goToToday} className="mr-6 px-3 py-1 text-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors" aria-label="Return to today" title="Return to today">
              Today
            </button>}

          {/* Room headers - using grid layout that EXACTLY matches the content grid layout below */}
          <div className="grid grid-cols-6 gap-2 flex-1 ml-6">
            {/* Empty cell for time column */}
            <div className="col-span-1"></div>
            {rooms.map((room, index) => <div key={room} className="col-span-1 text-center relative" style={{
            paddingLeft: '0.5rem',
            paddingRight: '0.5rem'
          }}>
                <h2 className="text-[1.7325rem] font-bold dark:text-white truncate">
                  {room}
                </h2>
              </div>)}
          </div>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden under the fixed header */}
      <div className="pt-[70px]">
        {/* Meeting Grid - Show all time slots */}
        <div className="space-y-0 flex-1">
          {allTimeSlots.map((timeSlot, index) => {
          // Only use dark blue for current time slot
          const isActive = isCurrentTimeSlot(timeSlot);
          const timeSlotHour = parseInt(timeSlot.split(':')[0]);
          const currentHour = currentTime.getHours();
          const opacity = calculateGridOpacity(timeSlotHour, currentHour, isToday);
          const rowBgColor = isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900';
          // Determine if this is the cutoff slot for auto-scrolling
          const isCutoffSlot = isToday && timeSlot === getTwoHourCutoffTimeSlot();
          return <div key={timeSlot} className={`${rowBgColor} w-full py-2 border-b border-gray-200 dark:border-gray-800 relative meeting-grid-row hour-grid-line grid-transition`} ref={isCutoffSlot ? scrollTargetRef : null} style={{
            minHeight: '100px',
            position: 'relative',
            '--grid-opacity': opacity
          }}>
                {/* Half-hour guide */}
                <div className="half-hour-guide"></div>

                {/* Current time indicator with glow effect */}
                {isActive && isToday && <>
                    <div className="current-time-line" style={{
                top: `${currentTime.getMinutes() / 60 * 100}px`
              }}></div>
                    <div className="current-time-glow" style={{
                top: `${currentTime.getMinutes() / 60 * 100}px`
              }}></div>
                  </>}

                {/* Enhanced grid with vertical lines */}
                <div className="grid grid-cols-6 gap-2 relative vertical-grid">
                  <SimplifiedTimeSlot time={timeSlot} currentTime={currentTime} militaryTime={true} className="time-labels col-span-1" />

                  {/* Vertical column separators - ensure perfect alignment */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-6 gap-2" style={{
                zIndex: 1
              }}>
                    <div className="col-span-1"></div>{' '}
                    {/* Time column - no left border */}
                    {rooms.map((room, roomIndex) => <div key={`${room}-border`} className="col-span-1 h-full" style={{
                  borderLeft: `1px dashed rgba(156, 163, 175, ${opacity * 0.5})`
                }} />)}
                  </div>

                  {/* Room columns with meetings */}
                  {rooms.map(room => {
                // Get all meetings that start in this hour for this room
                const roomMeetings = convertedMeetings.filter(meeting => meeting.room === room);
                // Find meetings that start in this hour
                const meetingsInHour = roomMeetings.filter(meeting => {
                  const meetingStartHour = getHourFromTimeString(meeting.startTime);
                  return meetingStartHour === timeSlotHour;
                });
                // If no meetings start in this hour, return empty div
                if (meetingsInHour.length === 0) {
                  return <div key={`${room}-${timeSlot}-empty`} className="col-span-1 relative calendar-vertical-grid column-separator" style={{
                    '--grid-opacity': opacity,
                    minHeight: '100px'
                  }}></div>;
                }
                // Render all meetings that start in this hour with precise positioning
                return <div key={`${room}-${timeSlot}`} className="col-span-1 relative calendar-vertical-grid column-separator" style={{
                  minHeight: '100px',
                  '--grid-opacity': opacity
                }}>
                        {meetingsInHour.map((meeting, idx) => {
                    // Get chairperson and add to meeting
                    const meetingWithChair = {
                      ...meeting,
                      chairperson: getChairperson(meeting)
                    };
                    // Calculate precise position and height
                    const startMinutes = calculatePositionOffset(meeting);
                    const durationMinutes = getMeetingDurationMinutes(meeting);
                    const durationHours = durationMinutes / 60;
                    // Calculate position within the hour (1.67px per minute)
                    const topOffset = startMinutes * 1.67;
                    // Calculate height based on exact duration (1.67px per minute)
                    const cardHeight = Math.max(100, durationMinutes * 1.67);
                    // Determine if this meeting is far in the future
                    const isFarFuture = isFarFutureMeeting(meeting);
                    return <div key={`${meeting.startTime}-${idx}`} className="absolute left-0 right-2 z-10 meeting-cards" style={{
                      top: `${topOffset}px`,
                      height: `${cardHeight}px`
                    }}>
                              <SimplifiedMeetingCard meeting={meetingWithChair} currentTime={currentTime} duration={durationHours} showDurationBadge={durationHours >= 2} startPosition="top" militaryTime={true} isYesterday={!isToday && isViewingPastDay} absolutePositioned={true} expandable={true} isFarFuture={isFarFuture} />
                            </div>;
                  })}
                      </div>;
              })}
                </div>
              </div>;
        })}
        </div>
      </div>

      {/* Navigation Buttons - Updated to Operations Dashboard instead of Proportional view */}
      <div className="mt-4 mb-2 flex justify-center gap-4">
        <Link to="/calls-wall" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold md:inline-flex hidden">
          <span>Calls Radar</span>
          <ArrowRightIcon size={16} />
        </Link>
        <Link to="/side-wall" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 text-xl font-bold md:inline-flex hidden">
          <span>Side Wall</span>
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>;
};
export default SimplifiedView;