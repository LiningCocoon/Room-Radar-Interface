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
    room: 'JFK',
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
  },
  // Removed: Remote Team Sync - creating a low activity window at 7AM for Breakout 1
  // 8:00 AM
  {
    name: 'Ops Kickoff',
    startTime: '8:00AM',
    endTime: '8:45AM',
    room: 'JFK',
    status: 'past'
  },
  // Removed: Daily Briefing - creating a low activity window at 8AM for Executive
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
    room: 'JFK',
    status: 'active',
    avSupport: true // AV Support needed
  }, {
    name: 'Vendor Call',
    startTime: '9:15AM',
    endTime: '10:00AM',
    room: 'Executive',
    status: 'active',
    avSupport: true
  },
  // Removed: Hiring Panel - creating a low activity window at 9AM for Breakout 1
  // QA Standup removed - will show as Available
  // 10:00 AM - Creating a low activity window from 10-11AM
  // Removed: Sprint Planning
  // Removed: API Review
  // Product Strategy removed - will show as Available
  // 12:00 PM
  {
    name: 'Design Critique',
    startTime: '12:00PM',
    endTime: '1:00PM',
    room: 'JFK',
    status: 'upcoming',
    avSupport: true
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
  },
  // Removed: User Research - creating a low activity window at 12PM for Breakout 1
  // 2:00 PM
  // Client Prep removed - will show as Available
  {
    name: 'Data Sync',
    startTime: '2:00PM',
    endTime: '2:45PM',
    room: 'Executive',
    status: 'upcoming'
  },
  // Adding new meetings at 2:00 PM
  {
    name: 'Product Demo',
    startTime: '2:00PM',
    endTime: '3:00PM',
    room: 'JFK',
    status: 'upcoming',
    avSupport: true
  }, {
    name: 'UX Workshop',
    startTime: '2:30PM',
    endTime: '3:30PM',
    room: 'Breakout 1',
    status: 'upcoming'
  },
  // 3:00 PM - Adding new meetings
  {
    name: 'Strategy Session',
    startTime: '3:00PM',
    endTime: '4:30PM',
    room: 'Breakout 2',
    status: 'upcoming',
    avSupport: true
  }, {
    name: 'Client Meeting',
    startTime: '3:15PM',
    endTime: '4:00PM',
    room: 'Executive',
    status: 'upcoming',
    isHighProfile: true
  },
  // 4:00 PM - Adding new meeting
  {
    name: 'Tech Review',
    startTime: '4:00PM',
    endTime: '5:00PM',
    room: 'JFK',
    status: 'upcoming'
  },
  // 5:00 PM
  {
    name: 'Team Retro',
    startTime: '5:00PM',
    endTime: '6:00PM',
    room: 'Breakout 1',
    status: 'upcoming',
    avSupport: true
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
  }
  // Removed: Remote Social - creating a low activity window at 7PM for Executive
  ];
};