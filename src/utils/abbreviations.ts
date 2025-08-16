/**
 * Returns an abbreviated version of a string if it's longer than the maxLength
 * @param text The text to abbreviate
 * @param maxLength The maximum length before abbreviation
 * @returns The abbreviated text or the original if it's short enough
 */
export const getSimpleAbbreviation = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  // If the text contains common words that can be abbreviated
  const withAbbreviations = text.replace('Meeting', 'Mtg').replace('meeting', 'mtg').replace('Planning', 'Plan').replace('planning', 'plan').replace('Review', 'Rev').replace('review', 'rev').replace('Session', 'Sess').replace('session', 'sess').replace('Workshop', 'Wkshp').replace('workshop', 'wkshp').replace('Presentation', 'Pres').replace('presentation', 'pres').replace('Discussion', 'Disc').replace('discussion', 'disc').replace('Quarterly', 'Qtrly').replace('quarterly', 'qtrly').replace('Executive', 'Exec').replace('executive', 'exec').replace('Strategy', 'Strat').replace('strategy', 'strat');
  // If abbreviations made it short enough, return that
  if (withAbbreviations.length <= maxLength) return withAbbreviations;
  // Otherwise truncate with ellipsis
  return `${withAbbreviations.substring(0, maxLength - 3)}...`;
};

// Dictionary of common meeting name abbreviations
export const meetingAbbreviations: Record<string, string> = {
  // Common meeting type abbreviations
  'Quarterly Business Review': 'QBR',
  'One-on-One': '1:1',
  'Daily Standup': 'Standup',
  'Strategic Planning': 'Strategy',
  'Quarterly Planning': 'Q-Planning',
  'Executive Breakfast': 'Exec Breakfast',
  'Standup & Priorities': 'Standup',
  'Product Demo': 'Demo',
  'Data Sync': 'Data Sync',
  'Client Meeting': 'Client Mtg',
  'Tech Review': 'Tech Rev',
  'Team Retro': 'Retro',
  'EOD Sync': 'EOD',
  'Late Client Demo': 'Client Demo',
  'Executive Debrief': 'Exec Debrief',
  'After-Hours Training': 'Training',
  'APAC Planning': 'APAC',
  'Budget Review': 'Budget',
  'Design Critique': 'Design',
  'UX Workshop': 'UX',
  'Strategy Session': 'Strategy'
};

// Get abbreviation for a meeting name, with fallback to original name
export const getAbbreviation = (name: string, maxLength: number = 0): string => {
  // Check for exact match in dictionary
  if (meetingAbbreviations[name]) {
    return meetingAbbreviations[name];
  }
  // Look for partial matches
  for (const [fullName, abbr] of Object.entries(meetingAbbreviations)) {
    if (name.includes(fullName)) {
      return abbr;
    }
  }
  // Smart abbreviation for names not in dictionary
  if (maxLength > 0 && name.length > maxLength) {
    // Remove common words
    let abbreviated = name.replace(/Meeting|Session|Discussion/gi, '').trim();
    // If still too long, use initials
    if (abbreviated.length > maxLength) {
      const words = abbreviated.split(' ');
      if (words.length > 1) {
        abbreviated = words.map(word => word[0]).join('');
      } else {
        // Just truncate if it's a single word
        abbreviated = abbreviated.substring(0, maxLength);
      }
    }
    return abbreviated;
  }
  // Return original if no abbreviation needed
  return name;
};