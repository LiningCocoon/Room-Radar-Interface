import { Meeting } from './data';
/**
 * Parses a time string (e.g., "10:30AM") into hours and minutes
 */
export const parseTime = (timeStr: string) => {
  // For military time format (24-hour)
  if (timeStr.includes(':') && !timeStr.includes('AM') && !timeStr.includes('PM')) {
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
    return {
      hours,
      minutes: minutes || 0
    };
  }
  // For AM/PM format
  const [time, period] = timeStr.split(/(?=[AP]M)/);
  const [hours, minutes] = time.split(':').map(num => parseInt(num));
  const isPM = period === 'PM' && hours !== 12;
  return {
    hours: isPM ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours,
    minutes: minutes || 0
  };
};
/**
 * Converts time to minutes for easier comparison
 */
export const timeToMinutes = (hours: number, minutes: number) => {
  return hours * 60 + minutes;
};
/**
 * Determines if a meeting is more than 2 hours old
 */
export const isOldMeeting = (meeting: Meeting, currentTime: Date) => {
  if (meeting.name === 'Available') return false;
  const startTime = parseTime(meeting.startTime);
  const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
  return currentTimeInMinutes - startTimeInMinutes >= 120;
};
/**
 * Calculates the duration of a meeting in minutes
 */
export const getMeetingDurationMinutes = (meeting: Meeting) => {
  if (meeting.name === 'Available' || !meeting.endTime) return 60;
  const startTime = parseTime(meeting.startTime);
  const endTime = parseTime(meeting.endTime);
  const startMinutes = timeToMinutes(startTime.hours, startTime.minutes);
  const endMinutes = timeToMinutes(endTime.hours, endTime.minutes);
  return endMinutes - startMinutes;
};
/**
 * Calculates the duration of a meeting in hours
 */
export const getMeetingDurationHours = (meeting: Meeting) => {
  return Math.round(getMeetingDurationMinutes(meeting) / 60);
};
/**
 * Calculates the vertical position based on time
 * @param time Time string (e.g., "10:30" or "10:30AM")
 * @param startHour First hour to display (e.g., 7 for 7:00AM)
 * @param hourHeight Height in pixels for one hour
 * @returns Position in pixels from the top
 */
export const calculateTimePosition = (time: string, startHour: number = 7, hourHeight: number = 60) => {
  const {
    hours,
    minutes
  } = parseTime(time);
  const hourDiff = hours - startHour;
  const minutePercentage = minutes / 60;
  return (hourDiff + minutePercentage) * hourHeight;
};
/**
 * Finds gaps between meetings to create available blocks
 * @param meetings Array of meetings for a specific room
 * @param startHour First hour of the day to display
 * @param endHour Last hour of the day to display
 * @returns Array of available time blocks
 */
export const findAvailableBlocks = (meetings: Meeting[], startHour: number = 7, endHour: number = 20) => {
  // Sort meetings by start time
  const sortedMeetings = [...meetings].sort((a, b) => {
    const aStart = parseTime(a.startTime);
    const bStart = parseTime(b.startTime);
    const aMinutes = timeToMinutes(aStart.hours, aStart.minutes);
    const bMinutes = timeToMinutes(bStart.hours, bStart.minutes);
    return aMinutes - bMinutes;
  });
  const availableBlocks: {
    startTime: string;
    endTime: string;
    room: string;
  }[] = [];
  // Start time of the day
  let currentTime = timeToMinutes(startHour, 0);
  const endTime = timeToMinutes(endHour, 0);
  // Room is the same for all meetings in this array
  const room = sortedMeetings.length > 0 ? sortedMeetings[0].room : '';
  // Find gaps between meetings
  for (const meeting of sortedMeetings) {
    const meetingStart = parseTime(meeting.startTime);
    const meetingStartMinutes = timeToMinutes(meetingStart.hours, meetingStart.minutes);
    // If there's a gap before this meeting, create an available block
    if (meetingStartMinutes > currentTime) {
      const startHours = Math.floor(currentTime / 60);
      const startMinutes = currentTime % 60;
      const endHours = Math.floor(meetingStartMinutes / 60);
      const endMinutes = meetingStartMinutes % 60;
      availableBlocks.push({
        startTime: `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`,
        endTime: `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`,
        room
      });
    }
    // Update current time to the end of this meeting
    if (meeting.endTime) {
      const meetingEnd = parseTime(meeting.endTime);
      currentTime = timeToMinutes(meetingEnd.hours, meetingEnd.minutes);
    } else {
      // If no end time, assume 1 hour
      currentTime = meetingStartMinutes + 60;
    }
  }
  // If there's time left after the last meeting, add one more available block
  if (currentTime < endTime) {
    const startHours = Math.floor(currentTime / 60);
    const startMinutes = currentTime % 60;
    const endHours = Math.floor(endTime / 60);
    const endMinutes = endTime % 60;
    availableBlocks.push({
      startTime: `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`,
      endTime: `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`,
      room
    });
  }
  return availableBlocks;
};