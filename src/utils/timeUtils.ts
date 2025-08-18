// Time utility functions for the meeting room application
export interface ParsedTime {
  hours: number;
  minutes: number;
}
export const parseTime = (timeStr: string): ParsedTime => {
  // Handle military time format (HH:MM)
  if (timeStr.includes(':') && !timeStr.includes('AM') && !timeStr.includes('PM')) {
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
    return {
      hours: hours || 0,
      minutes: minutes || 0
    };
  }
  // Handle AM/PM format
  const [time, period] = timeStr.split(/(?=[AP]M)/);
  const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
  const isPM = period === 'PM' && hours !== 12;
  const isAM = period === 'AM' && hours === 12;
  return {
    hours: isPM ? hours + 12 : isAM ? 0 : hours,
    minutes: minutes || 0
  };
};
export const timeToMinutes = (timeStr: string): number => {
  const parsed = parseTime(timeStr);
  return parsed.hours * 60 + parsed.minutes;
};
export const isOldMeeting = (meeting: any, currentTime: Date): boolean => {
  if (!meeting.endTime) return false;
  const endTime = parseTime(meeting.endTime);
  const endTimeInMinutes = endTime.hours * 60 + endTime.minutes;
  const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  // Meeting is old if it ended more than 2 hours ago
  return currentTimeInMinutes - endTimeInMinutes > 120;
};
export const calculateTimePosition = (timeStr: string, startHour: number, hourHeight: number): number => {
  const time = parseTime(timeStr);
  const totalMinutes = (time.hours - startHour) * 60 + time.minutes;
  return totalMinutes / 60 * hourHeight;
};
export const getMeetingDurationMinutes = (meeting: any): number => {
  if (!meeting.endTime) return 60; // Default 1 hour
  const startTime = parseTime(meeting.startTime);
  const endTime = parseTime(meeting.endTime);
  const startMinutes = startTime.hours * 60 + startTime.minutes;
  const endMinutes = endTime.hours * 60 + endTime.minutes;
  return endMinutes - startMinutes;
};
export const findAvailableBlocks = (meetings: any[], startHour: number, endHour: number): any[] => {
  const blocks: any[] = [];
  const sortedMeetings = meetings.filter(m => m.name !== 'Available').sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  let currentTime = startHour * 60; // in minutes
  for (const meeting of sortedMeetings) {
    const meetingStart = timeToMinutes(meeting.startTime);
    const meetingEnd = timeToMinutes(meeting.endTime || meeting.startTime) + 60;
    // If there's a gap before this meeting
    if (currentTime < meetingStart) {
      const gapStartHour = Math.floor(currentTime / 60);
      const gapStartMinute = currentTime % 60;
      const gapEndHour = Math.floor(meetingStart / 60);
      const gapEndMinute = meetingStart % 60;
      blocks.push({
        startTime: `${gapStartHour.toString().padStart(2, '0')}:${gapStartMinute.toString().padStart(2, '0')}`,
        endTime: `${gapEndHour.toString().padStart(2, '0')}:${gapEndMinute.toString().padStart(2, '0')}`,
        room: meeting.room
      });
    }
    currentTime = Math.max(currentTime, meetingEnd);
  }
  // Add final block if there's time left
  const endTimeMinutes = endHour * 60;
  if (currentTime < endTimeMinutes) {
    const finalStartHour = Math.floor(currentTime / 60);
    const finalStartMinute = currentTime % 60;
    blocks.push({
      startTime: `${finalStartHour.toString().padStart(2, '0')}:${finalStartMinute.toString().padStart(2, '0')}`,
      endTime: `${endHour.toString().padStart(2, '0')}:00`,
      room: meetings[0]?.room || 'Unknown'
    });
  }
  return blocks;
};