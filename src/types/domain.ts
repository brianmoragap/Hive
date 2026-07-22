export type SportType =
  | 'road_cycling'
  | 'mtb'
  | 'running'
  | 'trekking'
  | 'trail_running';

export type AppTab = 'home' | 'activity' | 'community' | 'profile';
export type EventVisibility = 'public' | 'private';
export type EventStatus = 'scheduled' | 'completed' | 'cancelled';
export type EventActivityType =
  | 'created'
  | 'updated'
  | 'invited'
  | 'completed'
  | 'cancelled';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

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
  birthDate: string;
  onboardingCompleted: boolean;
  isVerified: boolean;
  phoneNumber: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string | null;
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

export interface OnboardingDraftPayload {
  birthDate: string;
  phoneNumber: string;
  selfieUri: string;
}

export interface CompleteOnboardingPayload extends OnboardingDraftPayload {
  verificationCode: string;
}

export interface EventDraftPayload {
  title: string;
  sport: SportType;
  skillLevel: SkillLevel;
  date: string;
  time: string;
  meetingPoint: string;
  lat?: number | null;
  lng?: number | null;
  participantLimit: number;
  visibility: EventVisibility;
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

export interface HiveMember {
  id: string;
  fullName: string;
  handle: string;
  city: string;
  favoriteSport: SportType;
  isVerified: boolean;
  avatarUrl?: string | null;
}

export interface EventActivityLog {
  id: string;
  type: EventActivityType;
  createdAt: string;
  audienceCount: number;
  note?: string | null;
}

export interface EventAttendancePass {
  id: string;
  userId: string;
  token: string;
  manualCode: string;
  issuedAt: string;
  revokedAt?: string | null;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
}

export interface EventReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  eventRating: number;
  organizerRating: number;
  createdAt: string;
}

export interface RatingStats {
  average: number;
  count: number;
}

export interface EventPassPayload {
  type: 'hive_event_pass';
  version: 1;
  eventId: string;
  userId: string;
  token: string;
  issuedAt: string;
}

export interface EventRecord extends EventDraftPayload {
  id: string;
  creatorId: string;
  creatorName: string;
  attendeeIds: string[];
  attendancePasses: EventAttendancePass[];
  reviews: EventReview[];
  shareToken: string;
  status: EventStatus;
  completedAt?: string | null;
  cancellationReason?: string | null;
  activityLog: EventActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface EventMessage {
  id: string;
  eventId: string;
  userId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  body: string;
  createdAt: string;
  isMine: boolean;
  pending?: boolean;
}

export type NotificationPerspective = 'organizer' | 'attendee';

export type VerificationDecisionAction = 'verification_approved' | 'verification_rejected';

export interface NotificationDigest {
  id: string;
  action: Exclude<EventActivityType, 'created'> | VerificationDecisionAction;
  eventId: string;
  eventTitle: string;
  audienceCount: number;
  createdAt: string;
  read: boolean;
  perspective: NotificationPerspective;
}
