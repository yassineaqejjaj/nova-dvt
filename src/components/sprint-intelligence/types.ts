export interface TeamMember {
  id: string;
  name: string;
  role: string;
  pointsPerDay: number;
  contributionRate: number; // 0 to 1 (e.g. 0.8 = 80%)
}

export interface Absence {
  id: string;
  memberId: string;
  startDate: string;
  endDate: string;
  type: 'congés' | 'RTT' | 'formation' | 'maladie' | 'autre';
  label?: string;
}

export interface Meeting {
  id: string;
  name: string;
  durationMinutes: number;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'once';
  participantIds: string[]; // 'all' or specific member IDs
  allParticipants?: boolean;
}

export interface SprintConfig {
  name: string;
  startDate: string;
  endDate: string;
  holidays: string[];
  hoursPerDay: number;
}

export interface MemberCapacity {
  memberId: string;
  memberName: string;
  role: string;
  totalWorkDays: number;
  absenceDays: number;
  meetingDays: number;
  availableDays: number;
  points: number;
  contributionRate: number;
}

export interface CapacityResult {
  members: MemberCapacity[];
  totalPoints: number;
  totalWorkDays: number;
  totalMeetingHours: number;
  productivePercent: number;
  prudentPoints: number;
  normalPoints: number;
  aggressivePoints: number;
}

export interface VelocityEntry {
  sprintName: string;
  committed: number;
  completed: number;
}

export type FlowStep = 'sprint-setup' | 'team' | 'absences' | 'meetings' | 'result';
