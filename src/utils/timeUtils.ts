import { Meeting } from './data';
/**
 * Parses a time string (e.g., "10:30AM") into hours and minutes
 */
export const parseTime = (timeStr: string) => {
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