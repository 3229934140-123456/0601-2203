export type ActivityStatus = 'upcoming' | 'ongoing' | 'ended' | 'cancelled';

export interface VolunteerPosition {
  id: string;
  name: string;
  description: string;
  requiredCount: number;
  signedCount: number;
  signedMembers: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizerName: string;
  location: string;
  startTime: string;
  endTime: string;
  signUpDeadline: string;
  maxParticipants: number;
  signedParticipants: string[];
  positions: VolunteerPosition[];
  status: ActivityStatus;
  checkInCode?: string;
  checkInStartTime?: string;
  absentMembers: string[];
  reminded: boolean;
  createdAt: string;
}

export interface SignUpRecord {
  id: string;
  userId: string;
  activityId: string;
  activityTitle: string;
  positionId?: string;
  positionName?: string;
  signedAt: string;
  checkedIn: boolean;
  checkInTime?: string;
}
