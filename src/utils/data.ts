export interface Meeting {
  name: string;
  startTime: string;
  endTime: string;
  room: string;
  status?: 'active' | 'upcoming' | 'past' | 'available';
  avSupport?: boolean;
  isHighProfile?: boolean; // New flag for VIP meetings
}
export const getMeetingData = (): Meeting[] => {
  return [
  // 7:00 AM (New time slot)
  {
    name: 'Early Planning',
    startTime: '7:00AM',
    endTime: '7:45AM',
    room: 'FDR',
    status: 'active'
  }, {
    name: 'Executive Breakfast',
    startTime: '7:15AM',
    endTime: '8:00AM',
    room: 'Executive',
    status: 'active',
    avSupport: true,
    // AV Support needed
    isHighProfile: true // High profile meeting
  }, {
    name: 'Remote Team Sync',
    startTime: '7:00AM',
    endTime: '7:30AM',
    room: 'Breakout 1',
    status: 'active',
    avSupport: true // Added AV Support - same time slot as Executive Breakfast
  },
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
    status: 'active',
    avSupport: true // AV Support needed
  }, {
    name: 'Vendor Call',
    startTime: '9:15AM',
    endTime: '10:00AM',
    room: 'Executive',
    status: 'active',
    avSupport: true // Added AV Support - same time slot as Standup & Priorities
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
    status: 'upcoming',
    avSupport: true // Added AV Support - same time slot as Quarterly Planning
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
    status: 'upcoming',
    avSupport: true,
    // AV Support needed
    isHighProfile: true // High profile meeting
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
    status: 'upcoming',
    avSupport: true // AV Support needed
  }, {
    name: 'Incident Review',
    startTime: '2:45PM',
    endTime: '3:45PM',
    room: 'Breakout 2',
    status: 'upcoming'
  },
  // 3:00 PM
  {
    name: 'Long Strategy Session',
    startTime: '3:00PM',
    endTime: '7:00PM',
    room: 'FDR',
    status: 'upcoming',
    avSupport: true // AV Support needed
  }, {
    name: 'Leadership Sync',
    startTime: '3:30PM',
    endTime: '4:15PM',
    room: 'Executive',
    status: 'upcoming',
    avSupport: true // AV Support needed
  }, {
    name: 'Security Brief',
    startTime: '3:30PM',
    endTime: '4:30PM',
    room: 'Breakout 2',
    status: 'upcoming'
  },
  // 5:00 PM
  {
    name: 'Team Retro',
    startTime: '5:00PM',
    endTime: '6:00PM',
    room: 'Breakout 1',
    status: 'upcoming',
    avSupport: true // Added AV Support - same time slot as EOD Sync
  }, {
    name: 'EOD Sync',
    startTime: '5:30PM',
    endTime: '6:00PM',
    room: 'Executive',
    status: 'upcoming',
    avSupport: true,
    // AV Support needed
    isHighProfile: true // High profile meeting
  },
  // 6:00 PM
  {
    name: 'Late Client Demo',
    startTime: '6:15PM',
    endTime: '7:00PM',
    room: 'Breakout 1',
    status: 'upcoming',
    avSupport: true // AV Support needed
  }, {
    name: 'APAC Planning',
    startTime: '6:30PM',
    endTime: '7:15PM',
    room: 'Breakout 2',
    status: 'upcoming'
  }, {
    name: 'Executive Debrief',
    startTime: '6:00PM',
    endTime: '6:45PM',
    room: 'Executive',
    status: 'upcoming',
    isHighProfile: true // High profile meeting
  },
  // 7:00 PM
  {
    name: 'After-Hours Training',
    startTime: '7:00PM',
    endTime: '8:00PM',
    room: 'Breakout 1',
    status: 'upcoming',
    avSupport: true // AV Support needed
  }, {
    name: 'Remote Social',
    startTime: '7:00PM',
    endTime: '8:00PM',
    room: 'Executive',
    status: 'upcoming',
    avSupport: true // AV Support needed
  }];
};