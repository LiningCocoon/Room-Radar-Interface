import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { getMeetingData } from '../utils/data';
import ProportionalMeetingCard from './ProportionalMeetingCard';
import AvailableBlock from './AvailableBlock';
import { parseTime, calculateTimePosition, findAvailableBlocks, getMeetingDurationMinutes } from '../utils/timeUtils';
interface ProportionalMeetingViewProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const ProportionalMeetingView: React.FC<ProportionalMeetingViewProps> = ({
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
  // Define constants for layout
  const START_HOUR = 7; // 7:00 AM
  const END_HOUR = 20; // 8:00 PM
  const HOUR_HEIGHT = 60; // pixels per hour
  const ROOM_WIDTH = 200; // width of each room column
  const TIME_COLUMN_WIDTH = 80; // width of time column
  const GUTTER = 10; // gap between columns
  // Updated room names
  const rooms = ['JFK', 'Executive', 'Small', 'Breakout A', 'Breakout B'];
  // Generate time labels for the left column
  const timeLabels = Array.from({
    length: END_HOUR - START_HOUR + 1
  }, (_, i) => {
    const hour = START_HOUR + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });
  // Reference for auto-scrolling
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
  // Group meetings by room
  const meetingsByRoom: Record<string, any[]> = {};
  rooms.forEach(room => {
    meetingsByRoom[room] = convertedMeetings.filter(meeting => meeting.room === room);
  });
  // Find available blocks for each room
  const availableBlocksByRoom: Record<string, any[]> = {};
  rooms.forEach(room => {
    availableBlocksByRoom[room] = findAvailableBlocks(meetingsByRoom[room], START_HOUR, END_HOUR);
  });
  // Auto-scroll to current time on load (only for current day view)
  useEffect(() => {
    if (isToday && containerRef.current) {
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      // Calculate position to scroll to (2 hours before current time)
      const scrollHour = Math.max(START_HOUR, currentHour - 2);
      const scrollPosition = (scrollHour - START_HOUR) * HOUR_HEIGHT;
      // Scroll to the calculated position
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [isToday, currentTime]);
  // Calculate the total height of the timeline
  const timelineHeight = (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT;
  // Calculate current time position for the "now" indicator
  const currentTimePosition = calculateTimePosition(`${currentTime.getHours()}:${currentTime.getMinutes()}`, START_HOUR, HOUR_HEIGHT);
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
          {/* Room headers - using grid layout to match the content grid layout below */}
          <div className="grid grid-cols-5 gap-2 flex-1 ml-6">
            {rooms.map(room => <div key={room} className="text-center">
                <h2 className="text-[2.6rem] font-bold dark:text-white truncate">
                  {room}
                </h2>
              </div>)}
          </div>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden under the fixed header */}
      <div className="pt-[80px] p-2 flex flex-col h-full">
        {/* Scrollable container for the meetings */}
        <div ref={containerRef} className="flex-1 overflow-y-auto relative">
          <div style={{
          height: timelineHeight,
          position: 'relative'
        }}>
            {/* Time labels column - 30% larger text */}
            <div className="absolute left-0 top-0 bottom-0" style={{
            width: TIME_COLUMN_WIDTH
          }}>
              {timeLabels.map((time, index) => <div key={time} className="absolute font-bold text-[1.95rem] dark:text-white" style={{
              top: index * HOUR_HEIGHT,
              width: TIME_COLUMN_WIDTH - 10
            }}>
                  {time}
                </div>)}
            </div>
            {/* Current time indicator (horizontal line) */}
            {isToday && <div className="absolute left-0 right-0 border-t-2 border-blue-500 z-40" style={{
            top: currentTimePosition,
            left: TIME_COLUMN_WIDTH
          }}>
                <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-blue-500"></div>
              </div>}
            {/* Hour gridlines */}
            {timeLabels.map((_, index) => <div key={`grid-${index}`} className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-800" style={{
            top: index * HOUR_HEIGHT,
            left: TIME_COLUMN_WIDTH
          }}></div>)}
            {/* Room columns with meetings */}
            {rooms.map((room, roomIndex) => {
            const left = TIME_COLUMN_WIDTH + roomIndex * (ROOM_WIDTH + GUTTER) + GUTTER;
            return <div key={room} className="absolute top-0 bottom-0" style={{
              left,
              width: ROOM_WIDTH
            }}>
                  {/* Render meetings for this room */}
                  {meetingsByRoom[room].map((meeting, meetingIndex) => {
                const top = calculateTimePosition(meeting.startTime, START_HOUR, HOUR_HEIGHT);
                const duration = getMeetingDurationMinutes(meeting);
                const height = duration / 60 * HOUR_HEIGHT;
                const durationHours = Math.round(duration / 60);
                return <ProportionalMeetingCard key={`meeting-${roomIndex}-${meetingIndex}`} meeting={meeting} currentTime={currentTime} top={top} left={0} width={ROOM_WIDTH} height={height} duration={durationHours} militaryTime={true} isYesterday={!isToday && isViewingPastDay} />;
              })}
                  {/* Render available blocks for this room */}
                  {availableBlocksByRoom[room].map((block, blockIndex) => {
                const top = calculateTimePosition(block.startTime, START_HOUR, HOUR_HEIGHT);
                const endTop = calculateTimePosition(block.endTime, START_HOUR, HOUR_HEIGHT);
                const height = endTop - top;
                // Only show blocks with meaningful height
                if (height < 15) return null;
                return <AvailableBlock key={`available-${roomIndex}-${blockIndex}`} startTime={block.startTime} endTime={block.endTime} room={room} top={top} left={0} width={ROOM_WIDTH} height={height} currentTime={currentTime} isYesterday={!isToday && isViewingPastDay} militaryTime={true} />;
              })}
                </div>;
          })}
          </div>
        </div>
        {/* Navigation Buttons */}
        <div className="mt-4 mb-2 flex justify-center gap-4">
          <Link to="/alternative" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 md:inline-flex hidden text-xl">
            <span>Alternative view</span>
            <ArrowRightIcon size={20} />
          </Link>
          <Link to="/simplified" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 md:inline-flex hidden text-xl">
            <span>Simplified view</span>
            <ArrowRightIcon size={20} />
          </Link>
          <Link to="/past-meetings" className="text-[#005ea2] hover:text-[#003d6a] dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 py-1 px-3 rounded-lg border border-[#005ea2] dark:border-blue-400 hover:bg-[#f0f7fc] dark:hover:bg-gray-800 md:inline-flex hidden text-xl">
            <span>Past meetings</span>
            <ArrowRightIcon size={20} />
          </Link>
        </div>
      </div>
    </div>;
};
export default ProportionalMeetingView;