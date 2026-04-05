export type SportType =
  | 'road_cycling'
  | 'mtb'
  | 'running'
  | 'trekking'
  | 'trail_running';

export type VerificationStatus =
  | 'unsubmitted'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface SessionUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  rut: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  eventsAttended: number;
  favoriteSports: SportType[];
  idFrontUri?: string | null;
  idSerialUri?: string | null;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface VerificationPayload {
  fullName: string;
  rut: string;
  idFrontUri: string;
  idSerialUri: string;
}

export interface SportOption {
  id: SportType;
  label: string;
  subtitle: string;
  iconName: string;
  accent: [string, string];
}

export interface EventPreview {
  id: string;
  title: string;
  sport: string;
  schedule: string;
  location: string;
  organizer: string;
  participants: number;
}
