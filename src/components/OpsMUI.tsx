import React, { useEffect, useState, Component } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Chip, Badge, Card, CardContent, Button, Alert, AlertTitle, ThemeProvider, createTheme, CssBaseline, useMediaQuery, Stack, Divider } from '@mui/material';
import { Star as StarIcon, Phone as PhoneIcon, PhoneInTalk as PhoneInTalkIcon, Warning as WarningIcon, CheckCircle as CheckCircleIcon, Info as InfoIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, AccessTime as AccessTimeIcon, PersonOutline as PersonOutlineIcon, MeetingRoom as MeetingRoomIcon } from '@mui/icons-material';
import { getMeetingData } from '../utils/data';
import { parseTime } from '../utils/timeUtils';
// TypeScript interfaces
interface Meeting {
  name: string;
  startTime: string;
  endTime: string;
  room: string;
  avSupport?: boolean;
  isHighProfile?: boolean;
  isCall?: boolean;
  callType?: string;
}
interface RoomStatus {
  room: string;
  status: 'busy' | 'available';
  activeMeeting?: Meeting | null;
  nextMeeting?: Meeting | null;
  isVip: boolean;
  needsAv: boolean;
  isCall: boolean;
  callType?: string | null;
}
interface AlertStatus {
  type: string;
  meeting?: Meeting;
  message: string;
  color: string;
  icon: React.ReactNode;
}
// USWDS color palette
const uswdsColors = {
  primary: {
    main: '#005ea2',
    dark: '#1a4480',
    light: '#73b3e7',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#5c5c5c',
    dark: '#323a45',
    light: '#8d9297',
    contrastText: '#ffffff'
  },
  error: {
    main: '#d83933',
    dark: '#981b1e',
    light: '#f2938c',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#ffbe2e',
    dark: '#e5a000',
    light: '#ffe396',
    contrastText: '#1b1b1b'
  },
  info: {
    main: '#00bde3',
    dark: '#009ec1',
    light: '#97d4ea',
    contrastText: '#1b1b1b'
  },
  success: {
    main: '#4caf50',
    dark: '#2e8540',
    light: '#9bdaa1',
    contrastText: '#1b1b1b'
  },
  grey: {
    50: '#f9f9f9',
    100: '#f0f0f0',
    200: '#e6e6e6',
    300: '#c9c9c9',
    400: '#adadad',
    500: '#757575',
    600: '#5c5c5c',
    700: '#454545',
    800: '#2e2e2e',
    900: '#1b1b1b'
  },
  background: {
    default: '#f0f0f0',
    paper: '#ffffff'
  },
  text: {
    primary: '#1b1b1b',
    secondary: '#5c5c5c',
    disabled: '#c9c9c9'
  }
};
// Create MUI theme with USWDS colors and improved readability
const theme = createTheme({
  palette: {
    primary: uswdsColors.primary,
    secondary: uswdsColors.secondary,
    error: uswdsColors.error,
    warning: uswdsColors.warning,
    info: uswdsColors.info,
    success: uswdsColors.success,
    grey: uswdsColors.grey,
    background: uswdsColors.background,
    text: uswdsColors.text
  },
  typography: {
    fontFamily: '"Source Sans Pro", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '0.02em'
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 700
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 700,
      letterSpacing: '0.01em'
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 700
    },
    subtitle1: {
      fontSize: '1.25rem',
      fontWeight: 400
    },
    subtitle2: {
      fontSize: '1.125rem',
      fontWeight: 500
    },
    body1: {
      fontSize: '1.125rem',
      fontWeight: 400
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 400
    },
    button: {
      fontSize: '1.125rem',
      fontWeight: 700,
      textTransform: 'none'
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          boxShadow: '0 3px 6px rgba(0,0,0,0.15)'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          padding: '10px 20px',
          fontWeight: 700,
          borderWidth: '2px'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 3px 6px rgba(0,0,0,0.15)'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontSize: '1.125rem'
        }
      }
    }
  }
});
// Helper functions
const formatTimeToMilitary = (timeStr: string) => {
  const time = parseTime(timeStr);
  return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
};
const getVipTitle = (meeting: Meeting) => {
  if (meeting.room === 'Executive') {
    if (meeting.name.includes('Review')) return 'CEO';
    if (meeting.name.includes('Planning')) return 'COO';
    if (meeting.name.includes('Client')) return 'SVP';
    if (meeting.name.includes('Board')) return 'Chairman';
    return 'Executive';
  }
  if (meeting.room === 'JFK') {
    if (meeting.name.includes('Planning')) return 'Director';
    if (meeting.name.includes('Brief')) return 'VP';
    return 'Senior Manager';
  }
  return 'VIP';
};
const getAudience = (meeting: Meeting) => {
  if (meeting.name.includes('Board')) return 'Executive Team';
  if (meeting.name.includes('Client')) return 'External, Sales';
  if (meeting.name.includes('Team')) return 'Team Members';
  if (meeting.name.includes('Planning')) return 'Department Leads';
  return 'Internal';
};
const isSecureCall = (meeting: Meeting) => {
  return meeting.name.includes('Board') || meeting.name.includes('Executive') || meeting.name.includes('Investor');
};
interface OpsMUIProps {
  currentTime: Date;
  isYesterday?: boolean;
}
const OpsMUI: React.FC<OpsMUIProps> = ({
  currentTime,
  isYesterday = false
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isTomorrow, setIsTomorrow] = useState(false);
  const [isYesterdayView, setIsYesterdayView] = useState(isYesterday);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // Keep isYesterdayView in sync with the prop
  useEffect(() => {
    setIsYesterdayView(isYesterday);
  }, [isYesterday]);
  // Navigation functions
  const goToPreviousDay = () => {
    if (isTomorrow) {
      setIsTomorrow(false);
      setIsYesterdayView(false);
    } else if (!isYesterdayView) {
      setIsYesterdayView(true);
    }
  };
  const goToNextDay = () => {
    if (isYesterdayView) {
      setIsYesterdayView(false);
    } else if (!isTomorrow) {
      setIsTomorrow(true);
    }
  };
  // Format current time as HH:MM:SS in military time (24-hour format)
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  // Format the date (yesterday, today, or tomorrow based on state)
  const dateToShow = new Date(currentDateTime);
  if (isYesterdayView) {
    dateToShow.setDate(dateToShow.getDate() - 1);
  } else if (isTomorrow) {
    dateToShow.setDate(dateToShow.getDate() + 1);
  }
  const formattedDate = dateToShow.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  // Updated room names
  const rooms = ['JFK', 'Executive', 'Small', 'Breakout A', 'Breakout B'];
  // Get meeting data and convert room names
  const meetingData = getMeetingData();
  const convertedMeetings = meetingData.map(meeting => {
    let newRoom = meeting.room;
    if (meeting.room === 'Breakout 1') newRoom = 'Breakout A';
    if (meeting.room === 'Breakout 2') newRoom = 'Breakout B';
    if (meeting.room === 'FDR') newRoom = 'JFK';
    return {
      ...meeting,
      room: newRoom
    };
  });
  // Add additional meeting data for Operations Dashboard demonstration
  const additionalMeetings = [{
    name: 'Executive Briefing',
    startTime: '14:30',
    endTime: '15:30',
    room: 'Executive',
    isHighProfile: true,
    avSupport: true,
    isCall: false
  }, {
    name: 'International Call',
    startTime: '15:15',
    endTime: '16:00',
    room: 'Small',
    isHighProfile: false,
    avSupport: true,
    isCall: true,
    callType: 'Conference'
  }, {
    name: 'Emergency Response Review',
    startTime: '16:00',
    endTime: '17:00',
    room: 'JFK',
    isHighProfile: true,
    avSupport: true,
    isCall: false
  }];
  // Tomorrow's meetings
  const tomorrowMeetings = [{
    name: 'Board Review',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Executive',
    isHighProfile: true,
    avSupport: true,
    isCall: false
  }, {
    name: 'Leadership Sync',
    startTime: '11:00',
    endTime: '12:00',
    room: 'JFK',
    isHighProfile: true,
    avSupport: false,
    isCall: false
  }, {
    name: 'Product Demo',
    startTime: '13:30',
    endTime: '14:30',
    room: 'Small',
    isHighProfile: false,
    avSupport: true,
    isCall: false
  }];
  // Combine original and additional meetings
  const enhancedMeetings = [...convertedMeetings, ...additionalMeetings];
  // Use the appropriate meetings based on which day is selected
  const getMeetingsForSelectedDay = () => {
    if (isYesterdayView) {
      return enhancedMeetings; // Using same data for yesterday for simplicity
    } else if (isTomorrow) {
      return tomorrowMeetings;
    } else {
      return enhancedMeetings;
    }
  };
  const meetingsToUse = getMeetingsForSelectedDay();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  // Calculate meeting status
  const getMeetingStatus = (meeting: Meeting) => {
    // If showing tomorrow or yesterday, adjust accordingly
    if (isTomorrow) return 'upcoming';
    if (isYesterdayView) return 'past';
    const startTime = parseTime(meeting.startTime);
    const endTime = meeting.endTime ? parseTime(meeting.endTime) : null;
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    const endTimeInMinutes = endTime ? endTime.hours * 60 + endTime.minutes : startTimeInMinutes + 60;
    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
      return 'active';
    } else if (currentTimeInMinutes >= endTimeInMinutes) {
      return 'past';
    } else {
      return 'upcoming';
    }
  };
  // Get minutes until a meeting starts
  const getMinutesUntilMeeting = (meeting: Meeting) => {
    const startTime = parseTime(meeting.startTime);
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
    return startTimeInMinutes - currentTimeInMinutes;
  };
  // Filter meetings by status
  const activeMeetings = meetingsToUse.filter(m => getMeetingStatus(m) === 'active');
  const upcomingMeetings = meetingsToUse.filter(m => getMeetingStatus(m) === 'upcoming');
  // Find active or soon VIP meetings
  const activeVipMeetings = activeMeetings.filter(m => m.isHighProfile);
  const soonVipMeetings = upcomingMeetings.filter(m => m.isHighProfile && getMinutesUntilMeeting(m) <= 10 && getMinutesUntilMeeting(m) > 0);
  // Get room status for each room
  const roomStatuses: RoomStatus[] = rooms.map(room => {
    const activeInRoom = activeMeetings.find(m => m.room === room);
    const nextInRoom = upcomingMeetings.filter(m => m.room === room).sort((a, b) => getMinutesUntilMeeting(a) - getMinutesUntilMeeting(b))[0];
    return {
      room,
      status: activeInRoom ? 'busy' : 'available',
      activeMeeting: activeInRoom,
      nextMeeting: nextInRoom,
      isVip: activeInRoom?.isHighProfile || false,
      needsAv: activeInRoom?.avSupport || false,
      isCall: activeInRoom?.isCall || false,
      callType: activeInRoom?.callType || null
    };
  });
  // Calculate alert status
  const getAlertStatus = (): AlertStatus | AlertStatus[] | null => {
    if (isTomorrow) {
      // For tomorrow view, show planning alert instead of VIP alert
      const vipMeetingsTomorrow = meetingsToUse.filter(m => m.isHighProfile);
      if (vipMeetingsTomorrow.length > 0) {
        return {
          type: 'planning',
          message: `PLANNING FOR TOMORROW: ${vipMeetingsTomorrow.length} VIP meetings scheduled`,
          color: 'info',
          icon: <InfoIcon />
        };
      }
      return null;
    } else if (isYesterdayView) {
      // For yesterday view, show a recap alert
      const vipMeetingsYesterday = meetingsToUse.filter(m => m.isHighProfile);
      if (vipMeetingsYesterday.length > 0) {
        return {
          type: 'recap',
          message: `YESTERDAY'S RECAP: ${vipMeetingsYesterday.length} VIP meetings occurred`,
          color: 'secondary',
          icon: <CheckCircleIcon />
        };
      }
      return null;
    }
    // Find upcoming VIP meetings starting within 15 minutes
    const upcomingVipMeetings = upcomingMeetings.filter(m => m.isHighProfile && getMinutesUntilMeeting(m) <= 15 && getMinutesUntilMeeting(m) > 0);
    if (upcomingVipMeetings.length > 0) {
      // Return array of upcoming VIP meetings
      return upcomingVipMeetings.map(meeting => ({
        type: 'vip-upcoming',
        meeting,
        message: `${meeting.room}: ${meeting.name} at ${formatTimeToMilitary(meeting.startTime)} - ${getVipTitle(meeting)}`,
        color: 'error',
        icon: meeting.isCall ? <PhoneInTalkIcon /> : <WarningIcon />
      }));
    }
    return null;
  };
  const alertStatuses = getAlertStatus();
  // Generate call information
  const generateCallInformation = () => {
    return meetingsToUse.filter(m => m.isCall && getMeetingStatus(m) !== 'past').sort((a, b) => {
      const aTime = parseTime(a.startTime).hours * 60 + parseTime(a.startTime).minutes;
      const bTime = parseTime(b.startTime).hours * 60 + parseTime(b.startTime).minutes;
      return aTime - bTime;
    });
  };
  const callInformation = generateCallInformation();
  // Simplified upcoming activity generation
  const generateUpcomingActivity = () => {
    const threeHoursFromNow = currentTimeInMinutes + 180;
    return [...activeMeetings, ...upcomingMeetings].filter(m => {
      const startTime = parseTime(m.startTime);
      const startTimeInMinutes = startTime.hours * 60 + startTime.minutes;
      return startTimeInMinutes < threeHoursFromNow;
    }).sort((a, b) => {
      const aTime = parseTime(a.startTime).hours * 60 + parseTime(a.startTime).minutes;
      const bTime = parseTime(b.startTime).hours * 60 + parseTime(b.startTime).minutes;
      return aTime - bTime;
    });
  };
  const upcomingActivities = generateUpcomingActivity();
  return <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
        {/* Header */}
        <Box sx={{
        bgcolor: '#1a2235',
        color: 'white',
        py: 2,
        px: 3,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80
      }}>
          <Typography variant="h4" component="div">
            {formattedTime}
          </Typography>
          <Box sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center'
        }}>
            <Button onClick={goToPreviousDay} disabled={isYesterdayView} sx={{
            minWidth: 48,
            height: 48,
            mr: 2,
            bgcolor: 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)'
            },
            '&.Mui-disabled': {
              opacity: 0.5,
              color: 'rgba(255,255,255,0.5)'
            }
          }}>
              <ChevronLeftIcon fontSize="large" />
            </Button>
            <Typography variant="h3" component="div">
              {formattedDate}
            </Typography>
            <Button onClick={goToNextDay} disabled={isTomorrow} sx={{
            minWidth: 48,
            height: 48,
            ml: 2,
            bgcolor: 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)'
            },
            '&.Mui-disabled': {
              opacity: 0.5,
              color: 'rgba(255,255,255,0.5)'
            }
          }}>
              <ChevronRightIcon fontSize="large" />
            </Button>
          </Box>
          <Typography variant="h3" component="div">
            Room Radar
          </Typography>
        </Box>
        {/* Main Content */}
        <Box sx={{
        p: 3,
        flex: 1
      }}>
          {/* Alert Section */}
          {alertStatuses && <Box sx={{
          mb: 4
        }}>
              {Array.isArray(alertStatuses) ? <Stack spacing={2}>
                  {alertStatuses.map((status, index) => <Alert key={`alert-${index}`} severity={status.color as 'error' | 'warning' | 'info' | 'success'} icon={status.icon} sx={{
              '& .MuiAlert-icon': {
                fontSize: 32,
                alignItems: 'center'
              },
              py: 2
            }}>
                      <AlertTitle sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                        {status.message}
                      </AlertTitle>
                    </Alert>)}
                </Stack> : <Alert severity={alertStatuses.color as 'error' | 'warning' | 'info' | 'success'} icon={alertStatuses.icon} sx={{
            '& .MuiAlert-icon': {
              fontSize: 32,
              alignItems: 'center'
            },
            py: 2
          }}>
                  <AlertTitle sx={{
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
                    {alertStatuses.message}
                  </AlertTitle>
                </Alert>}
            </Box>}
          {/* Room Status Grid */}
          <Typography variant="h5" component="h2" sx={{
          mb: 3,
          fontWeight: 'bold',
          letterSpacing: '0.05em'
        }}>
            ROOM STATUS
          </Typography>
          <Grid container spacing={3} sx={{
          mb: 5
        }}>
            {roomStatuses.map(status => <Grid item xs={12} sm={6} md={4} key={status.room}>
                <Paper elevation={3} sx={{
              p: 3,
              borderRadius: 1,
              position: 'relative',
              borderLeft: '10px solid',
              borderLeftColor: status.isVip ? 'error.main' : status.status === 'busy' ? 'primary.main' : 'success.main',
              bgcolor: status.isVip ? 'error.light' : status.status === 'busy' ? 'background.paper' : 'success.light',
              opacity: status.isVip ? 0.95 : status.status === 'busy' ? 1 : 0.9
            }}>
                  {status.isVip && <Box sx={{
                position: 'absolute',
                top: 12,
                right: 12
              }}>
                      <StarIcon sx={{
                  color: 'error.main',
                  fontSize: 36
                }} />
                    </Box>}
                  <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1.5
              }}>
                    {status.status === 'busy' && status.isCall && <PhoneInTalkIcon sx={{
                  mr: 1.5,
                  color: 'primary.main',
                  fontSize: 32
                }} />}
                    <Typography variant="h3" component="h3" sx={{
                  fontWeight: 'bold'
                }}>
                      {status.room}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{
                fontWeight: 'bold',
                color: status.isVip ? 'error.dark' : status.status === 'busy' ? 'primary.main' : 'success.dark',
                mb: 1.5
              }}>
                    {status.status === 'busy' ? 'BUSY' : 'AVAILABLE'}
                  </Typography>
                  {status.status === 'busy' && status.activeMeeting && <Box>
                      <Typography variant="h6" sx={{
                  fontWeight: 'medium',
                  mb: 1,
                  fontSize: '1.35rem'
                }}>
                        {status.activeMeeting.name}
                        {status.needsAv && <Chip label="AV" size="small" color="primary" sx={{
                    ml: 1,
                    height: 24,
                    fontSize: '0.85rem'
                  }} />}
                      </Typography>
                      {status.isCall && <Box sx={{
                  display: 'flex',
                  mb: 1.5
                }}>
                          <Chip label={status.callType} size="small" color="info" sx={{
                    fontSize: '0.9rem',
                    py: 0.5
                  }} />
                        </Box>}
                      <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                        <Typography variant="body1" sx={{
                    fontSize: '1.2rem'
                  }}>
                          Until{' '}
                          {formatTimeToMilitary(status.activeMeeting.endTime)}
                        </Typography>
                        {status.isVip && <Box sx={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                            <StarIcon sx={{
                      fontSize: 20,
                      color: 'error.main',
                      mr: 0.5
                    }} />
                            <Typography variant="body1" sx={{
                      fontWeight: 'bold',
                      color: 'error.main',
                      fontSize: '1.2rem'
                    }}>
                              VIP
                            </Typography>
                          </Box>}
                      </Box>
                    </Box>}
                  {status.status === 'available' && status.nextMeeting && <Box>
                      <Box sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                        {status.nextMeeting.isCall && <PhoneIcon sx={{
                    mr: 1,
                    color: 'text.secondary',
                    fontSize: 20
                  }} />}
                        <Typography variant="body1" sx={{
                    fontSize: '1.2rem'
                  }}>
                          Next:{' '}
                          {formatTimeToMilitary(status.nextMeeting.startTime)} -{' '}
                          {status.nextMeeting.name}
                        </Typography>
                      </Box>
                      {status.nextMeeting.isHighProfile && <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1
                }}>
                          <StarIcon sx={{
                    fontSize: 20,
                    color: 'error.main',
                    mr: 0.5
                  }} />
                          <Typography variant="body1" sx={{
                    fontWeight: 'bold',
                    color: 'error.main',
                    fontSize: '1.2rem'
                  }}>
                            VIP
                          </Typography>
                        </Box>}
                    </Box>}
                </Paper>
              </Grid>)}
          </Grid>
          {/* Call Information Section */}
          {callInformation.length > 0 && <Box sx={{
          mb: 5
        }}>
              <Typography variant="h5" component="h2" sx={{
            mb: 3,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '0.05em'
          }}>
                CALLS
                <PhoneInTalkIcon sx={{
              ml: 1.5,
              color: 'primary.main',
              fontSize: 32
            }} />
              </Typography>
              <Paper elevation={3} sx={{
            p: 3,
            borderRadius: 1
          }}>
                <Stack spacing={3}>
                  {callInformation.map((call, index) => {
                const formattedTime = formatTimeToMilitary(call.startTime);
                const audience = getAudience(call);
                const isSecure = isSecureCall(call);
                return <Box key={`call-${index}`} sx={{
                  p: 3,
                  borderRadius: 1,
                  borderLeft: '8px solid',
                  borderLeftColor: 'primary.main',
                  bgcolor: 'background.paper'
                }}>
                        <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                          <Typography variant="h5" sx={{
                      fontWeight: 'bold'
                    }}>
                            {formattedTime}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{
                      fontSize: '1.2rem'
                    }}>
                            {audience}
                          </Typography>
                          <Chip label={isSecure ? 'SECURE' : 'NON-SECURE'} color={isSecure ? 'success' : 'warning'} sx={{
                      ml: 'auto',
                      fontWeight: 'bold',
                      border: 2,
                      borderColor: isSecure ? 'success.main' : 'warning.main',
                      py: 1,
                      fontSize: '1rem'
                    }} />
                        </Box>
                      </Box>;
              })}
                </Stack>
              </Paper>
            </Box>}
          {/* Upcoming Activity Section */}
          <Box sx={{
          mb: 5
        }}>
            <Typography variant="h5" component="h2" sx={{
            mb: 3,
            fontWeight: 'bold',
            letterSpacing: '0.05em'
          }}>
              {isTomorrow ? 'SCHEDULED' : isYesterdayView ? 'PAST' : 'UPCOMING'}
            </Typography>
            <Paper elevation={3} sx={{
            p: 3,
            borderRadius: 1
          }}>
              {upcomingActivities.length > 0 ? <Stack spacing={3}>
                  {upcomingActivities.map((meeting, index) => {
                const formattedTime = formatTimeToMilitary(meeting.startTime);
                const audience = getAudience(meeting);
                const isCall = meeting.isCall;
                const isVip = meeting.isHighProfile;
                const isSecure = isCall ? isSecureCall(meeting) : false;
                return <Box key={`activity-${index}`} sx={{
                  p: 3,
                  borderRadius: 1,
                  borderLeft: '8px solid',
                  borderLeftColor: isVip ? 'error.main' : 'grey.400',
                  bgcolor: isVip ? 'error.light' : 'background.paper'
                }}>
                        <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                          <Typography variant="h5" sx={{
                      fontWeight: 'bold'
                    }}>
                            {formattedTime}
                          </Typography>
                          <Divider orientation="vertical" flexItem sx={{
                      mx: 0.5,
                      borderRightWidth: 2
                    }} />
                          <Typography variant="body1" sx={{
                      fontWeight: 'medium',
                      fontSize: '1.2rem'
                    }}>
                            {isCall ? audience : meeting.room}
                          </Typography>
                          <Divider orientation="vertical" flexItem sx={{
                      mx: 0.5,
                      borderRightWidth: 2
                    }} />
                          {isCall && <PhoneInTalkIcon sx={{
                      color: 'primary.main',
                      fontSize: 28
                    }} />}
                          <Typography variant="body1" sx={{
                      fontWeight: 'medium',
                      fontSize: '1.2rem'
                    }}>
                            {meeting.name}
                          </Typography>
                          {isVip && <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      ml: 1
                    }}>
                              <StarIcon sx={{
                        color: 'error.main',
                        fontSize: 28,
                        mr: 0.5
                      }} />
                              <Typography variant="body1" sx={{
                        fontWeight: 'bold',
                        color: 'error.main',
                        fontSize: '1.2rem'
                      }}>
                                VIP
                              </Typography>
                            </Box>}
                          {isCall && <Chip label={isSecure ? 'SECURE' : 'NON-SECURE'} color={isSecure ? 'success' : 'warning'} size="medium" sx={{
                      ml: 'auto',
                      fontWeight: 'bold',
                      py: 0.75,
                      fontSize: '0.95rem'
                    }} />}
                        </Box>
                      </Box>;
              })}
                </Stack> : <Box sx={{
              py: 4,
              textAlign: 'center'
            }}>
                  <Typography variant="h6" color="text.secondary">
                    No {isYesterdayView ? 'past' : 'upcoming'} meetings or calls
                    scheduled{' '}
                    {isTomorrow ? 'for tomorrow' : isYesterdayView ? 'from yesterday' : 'in the next 3 hours'}
                  </Typography>
                </Box>}
            </Paper>
          </Box>
          {/* Navigation Buttons */}
          <Box sx={{
          mt: 'auto',
          mb: 2,
          display: 'flex',
          justifyContent: 'center',
          gap: 3
        }}>
            <Button component={Link} to="/simplified" variant="outlined" color="primary" startIcon={<ArrowBackIcon fontSize="large" />} sx={{
            fontWeight: 'bold',
            py: 1.5,
            fontSize: '1.2rem'
          }}>
              Simplified view
            </Button>
            <Button component={Link} to="/operations" variant="outlined" color="primary" endIcon={<ArrowForwardIcon fontSize="large" />} sx={{
            fontWeight: 'bold',
            py: 1.5,
            fontSize: '1.2rem'
          }}>
              Operations Dashboard
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>;
};
export default OpsMUI;