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
    startTime: '07:00',
    endTime: '07:45',
    room: 'JFK',
    status: 'active'
  }, {
    name: 'Executive Breakfast',
    startTime: '07:15',
    endTime: '08:00',
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
    startTime: '08:00',
    endTime: '08:45',
    room: 'JFK',
    status: 'past'
  },
  // Removed: Daily Briefing - creating a low activity window at 8AM for Executive
  // Support Handoff removed - will show as Available
  {
    name: 'Team Sync',
    startTime: '08:00',
    endTime: '08:30',
    room: 'Breakout 2',
    status: 'past'
  },
  // 9:00 AM
  {
    name: 'Standup & Priorities',
    startTime: '09:00',
    endTime: '09:45',
    room: 'JFK',
    status: 'active',
    avSupport: true // AV Support needed
  }, {
    name: 'Vendor Call',
    startTime: '09:15',
    endTime: '10:00',
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
    startTime: '12:00',
    endTime: '13:00',
    room: 'JFK',
    status: 'upcoming',
    avSupport: true
  }, {
    name: 'Budget Review',
    startTime: '12:30',
    endTime: '13:30',
    room: 'Breakout 2',
    status: 'upcoming'
  }, {
    name: 'Quarterly Planning',
    startTime: '12:00',
    endTime: '14:00',
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
    startTime: '14:00',
    endTime: '14:45',
    room: 'Executive',
    status: 'upcoming'
  },
  // Adding new meetings at 2:00 PM
  {
    name: 'Product Demo',
    startTime: '14:00',
    endTime: '15:00',
    room: 'JFK',
    status: 'upcoming',
    avSupport: true
  }, {
    name: 'UX Workshop',
    startTime: '14:30',
    endTime: '15:30',
    room: 'Breakout 1',
    status: 'upcoming'
  },
  // 3:00 PM - Adding new meetings
  {
    name: 'Strategy Session',
    startTime: '15:00',
    endTime: '16:30',
    room: 'Breakout 2',
    status: 'upcoming',
    avSupport: true
  }, {
    name: 'Client Meeting',
    startTime: '15:15',
    endTime: '16:00',
    room: 'Executive',
    status: 'upcoming',
    isHighProfile: true
  },
  // 4:00 PM - Adding new meeting
  {
    name: 'Tech Review',
    startTime: '16:00',
    endTime: '17:00',
    room: 'JFK',
    status: 'upcoming'
  },
  // 5:00 PM
  {
    name: 'Team Retro',
    startTime: '17:00',
    endTime: '18:00',
    room: 'Breakout 1',
    status: 'upcoming',
    avSupport: true
  }, {
    name: 'EOD Sync',
    startTime: '17:30',
    endTime: '18:00',
    room: 'Executive',
    status: 'upcoming',
    avSupport: true,
    // AV Support needed
    isHighProfile: true // High profile meeting
  },
  // 6:00 PM
  {
    name: 'Late Client Demo',
    startTime: '18:15',
    endTime: '19:00',
    room: 'Breakout 1',
    status: 'upcoming',
    avSupport: true // AV Support needed
  }, {
    name: 'APAC Planning',
    startTime: '18:30',
    endTime: '19:15',
    room: 'Breakout 2',
    status: 'upcoming'
  }, {
    name: 'Executive Debrief',
    startTime: '18:00',
    endTime: '18:45',
    room: 'Executive',
    status: 'upcoming',
    isHighProfile: true // High profile meeting
  },
  // 7:00 PM
  {
    name: 'After-Hours Training',
    startTime: '19:00',
    endTime: '20:00',
    room: 'Breakout 1',
    status: 'upcoming',
    avSupport: true // AV Support needed
  }
  // Removed: Remote Social - creating a low activity window at 7PM for Executive
  ];
};