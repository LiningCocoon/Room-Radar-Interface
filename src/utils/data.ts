export interface Meeting {
  name: string;
  startTime: string;
  endTime: string;
  room: string;
  status?: 'active' | 'upcoming' | 'past' | 'available';
  avSupport?: boolean;
  isHighProfile?: boolean; // New flag for VIP meetings
  isCall?: boolean; // New flag for calls
  callType?: string; // Type of call: "Conference Call", "One-on-One", etc.
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
  // Adding a VIP call at 7:30
  {
    name: 'Global Leadership Call',
    startTime: '07:30',
    endTime: '08:15',
    room: 'Breakout A',
    status: 'active',
    avSupport: true,
    isHighProfile: true,
    isCall: true,
    callType: 'Conference Call'
  },
  // 8:00 AM
  {
    name: 'Ops Kickoff',
    startTime: '08:00',
    endTime: '08:45',
    room: 'JFK',
    status: 'past'
  },
  // Support Handoff removed - will show as Available
  {
    name: 'Team Sync',
    startTime: '08:00',
    endTime: '08:30',
    room: 'Breakout 2',
    status: 'past'
  },
  // Adding a regular call at 8:30
  {
    name: 'IT Support Call',
    startTime: '08:30',
    endTime: '09:15',
    room: 'Small',
    status: 'active',
    isCall: true,
    callType: 'Conference Call'
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
    avSupport: true,
    isCall: true,
    callType: 'Conference Call'
  },
  // 10:00 AM - VIP call
  {
    name: 'Board Update',
    startTime: '10:00',
    endTime: '11:00',
    room: 'Executive',
    status: 'upcoming',
    avSupport: true,
    isHighProfile: true,
    isCall: true,
    callType: 'Conference Call'
  },
  // 11:00 AM - Regular call
  {
    name: 'Marketing Strategy',
    startTime: '11:00',
    endTime: '11:45',
    room: 'Breakout 1',
    status: 'upcoming',
    isCall: true,
    callType: 'One-on-One'
  },
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
  // 1:00 PM - VIP call
  {
    name: 'CEO All-Hands',
    startTime: '13:00',
    endTime: '14:00',
    room: 'Breakout A',
    status: 'upcoming',
    avSupport: true,
    isHighProfile: true,
    isCall: true,
    callType: 'Conference Call'
  },
  // 2:00 PM
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
  // 2:30 PM - Regular call
  {
    name: 'Partner Discussion',
    startTime: '14:30',
    endTime: '15:15',
    room: 'Small',
    status: 'upcoming',
    isCall: true,
    callType: 'Conference Call'
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
  // 3:30 PM - VIP call
  {
    name: 'Investor Relations',
    startTime: '15:30',
    endTime: '16:15',
    room: 'Breakout A',
    status: 'upcoming',
    avSupport: true,
    isHighProfile: true,
    isCall: true,
    callType: 'Conference Call'
  },
  // 4:00 PM - Adding new meeting
  {
    name: 'Tech Review',
    startTime: '16:00',
    endTime: '17:00',
    room: 'JFK',
    status: 'upcoming'
  },
  // 4:30 PM - Regular call
  {
    name: 'Support Escalation',
    startTime: '16:30',
    endTime: '17:15',
    room: 'Small',
    status: 'upcoming',
    isCall: true,
    callType: 'One-on-One'
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
  // 5:30 PM - VIP call
  {
    name: 'Executive Committee',
    startTime: '17:30',
    endTime: '18:15',
    room: 'JFK',
    status: 'upcoming',
    avSupport: true,
    isHighProfile: true,
    isCall: true,
    callType: 'Conference Call'
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
  // 6:30 PM - Regular call
  {
    name: 'APAC Team Call',
    startTime: '18:30',
    endTime: '19:15',
    room: 'Small',
    status: 'upcoming',
    isCall: true,
    callType: 'Conference Call'
  },
  // 7:00 PM
  {
    name: 'After-Hours Training',
    startTime: '19:00',
    endTime: '20:00',
    room: 'Breakout 1',
    status: 'upcoming',
    avSupport: true // AV Support needed
  },
  // 7:30 PM - VIP call
  {
    name: 'International Board Call',
    startTime: '19:30',
    endTime: '20:15',
    room: 'Executive',
    status: 'upcoming',
    avSupport: true,
    isHighProfile: true,
    isCall: true,
    callType: 'Conference Call'
  }];
};