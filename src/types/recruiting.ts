export type CampType = 'Single-School ID' | 'Multi-College Showcase' | 'GK-Specific Clinic';
export type CampStatus = 'Interested' | 'Registered' | 'Attended' | 'Declined';

export interface IdCamp {
  id: string;
  programId?: string;
  schoolName: string;
  campName: string;
  location: string;
  startDate: string;
  endDate?: string;
  cost: number;
  campType: CampType;
  status: CampStatus;
  registrationUrl: string;
  confirmedAttendingColleges?: string[];
  notes?: string;
}

export type OutreachCategory =
  | 'Introductory'
  | 'Showcase Schedule'
  | 'ID Camp Inquiry'
  | 'Post-Camp Follow-up'
  | 'Video Update';

export type OutreachStatus =
  | 'Drafted'
  | 'Sent'
  | 'Coach Replied'
  | 'Pre-Contact Logged'
  | 'Archived';

export interface OutreachLog {
  id: string;
  programId: string;
  schoolName: string;
  division?: 'D1' | 'D2' | 'D3';
  coachName: string;
  coachEmail: string;
  dateSent: string;
  category: OutreachCategory;
  status: OutreachStatus;
  isPreContactRule: boolean;
  subjectLine: string;
  bodyText: string;
  notes?: string;
}

export interface AthleteProfile {
  playerName: string;
  clubName: string;
  jerseyNumber: string;
  gpa: string;
  height: string;
  weight: string;
  highSchool: string;
  playerPhone: string;
  playerEmail: string;
  ncaaId: string;
  highlightLink: string;
  fullGameLink: string;
}

export interface ShowcaseGame {
  date: string;
  time: string;
  opponent: string;
  fieldNumber: string;
}

export interface ShowcaseSchedule {
  eventName: string;
  cityState: string;
  locationName: string;
  game1: ShowcaseGame;
  game2: ShowcaseGame;
  game3: ShowcaseGame;
}
