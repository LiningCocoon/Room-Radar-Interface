export interface Meeting {
  name: string;
  startTime: string;
  endTime: string;
  room: string;
  status?: 'active' | 'upcoming' | 'past' | 'available';
}
export const getMeetingData = (): Meeting[] => {
  return [
  // 8:00 AM
  {
    name: 'Ops Kickoff',
    startTime: '8:00AM',
    endTime: '8:45AM',
    room: 'FDR',
    status: 'past'
  }, {
    name: 'Daily Briefing',
    startTime: '8:15AM',
    endTime: '8:45AM',
    room: 'Executive',
    status: 'past'
  },
  // Support Handoff removed - will show as Available
  {
    name: 'Team Sync',
    startTime: '8:00AM',
    endTime: '8:30AM',
    room: 'Breakout 2',
    status: 'past'
  },
  // 9:00 AM
  {
    name: 'Standup & Priorities',
    startTime: '9:00AM',
    endTime: '9:45AM',
    room: 'FDR',
    status: 'active'
  }, {
    name: 'Vendor Call',
    startTime: '9:15AM',
    endTime: '10:00AM',
    room: 'Executive',
    status: 'active'
  }, {
    name: 'Hiring Panel',
    startTime: '9:30AM',
    endTime: '10:30AM',
    room: 'Breakout 1',
    status: 'active'
  },
  // QA Standup removed - will show as Available
  // 10:00 AM
  {
    name: 'Sprint Planning',
    startTime: '10:00AM',
    endTime: '11:00AM',
    room: 'Executive',
    status: 'upcoming'
  }, {
    name: 'API Review',
    startTime: '10:15AM',
    endTime: '11:15AM',
    room: 'Breakout 1',
    status: 'upcoming'
  },
  // Product Strategy removed - will show as Available
  // 12:00 PM
  {
    name: 'Design Critique',
    startTime: '12:00PM',
    endTime: '1:00PM',
    room: 'FDR',
    status: 'upcoming'
  }, {
    name: 'Budget Review',
    startTime: '12:30PM',
    endTime: '1:30PM',
    room: 'Breakout 2',
    status: 'upcoming'
  }, {
    name: 'Quarterly Planning',
    startTime: '12:00PM',
    endTime: '2:00PM',
    room: 'Executive',
    status: 'upcoming'
  }, {
    name: 'User Research',
    startTime: '12:15PM',
    endTime: '1:15PM',
    room: 'Breakout 1',
    status: 'upcoming'
  },
  // 2:00 PM
  // Client Prep removed - will show as Available
  {
    name: 'Data Sync',
    startTime: '2:00PM',
    endTime: '2:45PM',
    room: 'Executive',
    status: 'upcoming'
  }, {
    name: 'Roadmap Update',
    startTime: '2:30PM',
    endTime: '3:30PM',
    room: 'Breakout 1',
    status: 'upcoming'
  }, {
    name: 'Incident Review',
    startTime: '2:45PM',
    endTime: '3:45PM',
    room: 'Breakout 2',
    status: 'upcoming'
  },
  // 3:00 PM
  {
    name: 'Client Check-in',
    startTime: '3:00PM',
    endTime: '4:00PM',
    room: 'FDR',
    status: 'upcoming'
  }, {
    name: 'Security Brief',
    startTime: '3:30PM',
    endTime: '4:30PM',
    room: 'Breakout 2',
    status: 'upcoming'
  },
  // Tech All-Hands removed - will show as Available
  // 5:00 PM
  {
    name: 'Release Planning',
    startTime: '5:00PM',
    endTime: '6:00PM',
    room: 'FDR',
    status: 'upcoming'
  }, {
    name: 'Team Retro',
    startTime: '5:00PM',
    endTime: '6:00PM',
    room: 'Breakout 1',
    status: 'upcoming'
  }, {
    name: 'EOD Sync',
    startTime: '5:30PM',
    endTime: '6:00PM',
    room: 'Executive',
    status: 'upcoming'
  }];
};