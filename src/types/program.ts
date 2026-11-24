export type Division = 'D1' | 'D2' | 'D3';
export type StateCode = 'PA' | 'NJ' | 'DE' | 'MD';
export type ClassNeedScore = 'High' | 'Medium' | 'Low' | 'Unverified';

export interface GoalkeeperEntry {
  name: string;
  classYear: 'FR' | 'SO' | 'JR' | 'SR' | 'GR';
  height?: string;
  hometown?: string;
}

export interface CoachContact {
  name: string;
  title: string;
  email?: string;
  phone?: string;
}

export interface FinancialProfile {
  estimatedCostOfAttendanceInState: number;
  estimatedCostOfAttendanceOutOfState: number;
  averageNetPrice: number;
  financialAidNotes: string;
}

export interface SoccerProgram {
  id: string;
  schoolName: string;
  division: Division;
  state: StateCode;
  city: string;
  conference: string;
  estimatedDriveHoursFromDelco?: number;
  mensSoccerUrl: string;
  rosterUrl: string;
  campUrl?: string;
  headCoach: CoachContact;
  gkCoach?: CoachContact;
  goalkeepers: GoalkeeperEntry[];
  classOf2029NeedScore: ClassNeedScore;
  financialProfile: FinancialProfile;
  notes?: string;
}
