// Mock meeting data for the Room Radar application
export interface Meeting {
  name: string;
  startTime: string;
  endTime: string;
  room: string;
  avSupport?: boolean;
  isHighProfile?: boolean;
  isCall?: boolean;
  callType?: string;
}
export const getMeetingData = (): Meeting[] => {
  return [
  // JFK Room meetings
  {
    name: 'Strategic Planning Session',
    startTime: '9:00AM',
    endTime: '10:30AM',
    room: 'JFK',
    avSupport: true,
    isHighProfile: false
  }, {
    name: 'Client Presentation',
    startTime: '11:00AM',
    endTime: '12:00PM',
    room: 'JFK',
    avSupport: true,
    isHighProfile: true
  }, {
    name: 'Team Sync',
    startTime: '2:00PM',
    endTime: '3:00PM',
    room: 'JFK',
    avSupport: false,
    isHighProfile: false
  }, {
    name: 'Stakeholder Strategy Meeting',
    startTime: '4:30PM',
    endTime: '5:30PM',
    room: 'JFK',
    avSupport: true,
    isHighProfile: false
  }, {
    name: 'Emergency Response Drill',
    startTime: '9:00PM',
    endTime: '10:30PM',
    room: 'JFK',
    avSupport: true,
    isHighProfile: true
  },
  // Executive Room meetings
  {
    name: 'Board Review',
    startTime: '10:00AM',
    endTime: '11:30AM',
    room: 'Executive',
    avSupport: true,
    isHighProfile: true
  }, {
    name: 'Executive Meeting',
    startTime: '1:00PM',
    endTime: '2:30PM',
    room: 'Executive',
    avSupport: false,
    isHighProfile: false
  }, {
    name: 'Leadership Sync',
    startTime: '4:00PM',
    endTime: '5:00PM',
    room: 'Executive',
    avSupport: true,
    isHighProfile: false
  }, {
    name: 'Order Implementation Workshop',
    startTime: '5:30PM',
    endTime: '6:30PM',
    room: 'Executive',
    avSupport: true,
    isHighProfile: true
  }, {
    name: 'International Board Call',
    startTime: '8:30PM',
    endTime: '9:30PM',
    room: 'Executive',
    avSupport: true,
    isHighProfile: true,
    isCall: true
  },
  // Small Room meetings
  {
    name: 'Design Workshop',
    startTime: '9:30AM',
    endTime: '11:00AM',
    room: 'Small',
    avSupport: false,
    isHighProfile: false
  }, {
    name: 'Product Demo',
    startTime: '1:30PM',
    endTime: '2:30PM',
    room: 'Small',
    avSupport: true,
    isHighProfile: false
  }, {
    name: 'Cross-functional Requirements Discussion',
    startTime: '3:00PM',
    endTime: '4:30PM',
    room: 'Small',
    avSupport: false,
    isHighProfile: false
  }, {
    name: 'Late Night Testing Session',
    startTime: '8:00PM',
    endTime: '10:00PM',
    room: 'Small',
    avSupport: true,
    isHighProfile: false
  },
  // Breakout A meetings
  {
    name: 'All-Hands Meeting',
    startTime: '8:00AM',
    endTime: '9:00AM',
    room: 'Breakout 1',
    avSupport: true,
    isHighProfile: false
  }, {
    name: 'Investor Relations',
    startTime: '3:00PM',
    endTime: '4:30PM',
    room: 'Breakout 1',
    avSupport: false,
    isHighProfile: true
  }, {
    name: 'Quarterly Budget Planning & Review Session',
    startTime: '5:00PM',
    endTime: '6:00PM',
    room: 'Breakout 1',
    avSupport: true,
    isHighProfile: false
  }, {
    name: 'APAC Team Standup',
    startTime: '9:15PM',
    endTime: '10:00PM',
    room: 'Breakout 1',
    avSupport: true,
    isHighProfile: false,
    isCall: true
  },
  // Breakout B meetings
  {
    name: 'Training Session',
    startTime: '10:30AM',
    endTime: '12:00PM',
    room: 'Breakout 2',
    avSupport: false,
    isHighProfile: false
  }, {
    name: 'Partner Meeting',
    startTime: '3:30PM',
    endTime: '4:30PM',
    room: 'Breakout 2',
    avSupport: true,
    isHighProfile: false
  }, {
    name: 'International Market Expansion Strategy',
    startTime: '5:00PM',
    endTime: '6:30PM',
    room: 'Breakout 2',
    avSupport: true,
    isHighProfile: true
  }, {
    name: 'Global Security Briefing',
    startTime: '8:45PM',
    endTime: '9:45PM',
    room: 'Breakout 2',
    avSupport: true,
    isHighProfile: true
  }];
};