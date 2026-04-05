# Hive App Blueprint

## 1. Product states

Hive needs a hard gate before community access. The app should always move users through one of these states:

1. `signed_out`
   Email + password only. User can create account or sign in.
2. `unsubmitted`
   Auth exists, but profile and identity verification are missing.
3. `pending_review`
   Identity was submitted. Main community features stay locked.
4. `approved`
   User can access home, events, groups, and notifications.
5. `rejected`
   User returns to verification with reviewer feedback and resubmits.

## 2. Core navigation map

### Phase 1 implemented now

- `AuthScreen`
  Login and registration entry point.
- `VerificationScreen`
  Mandatory profile completion: full name, RUT, front ID, serial number image.
- `PendingReviewScreen`
  Shows "en revision" state and keeps the app locked.
- `HomeScreen`
  First approved-state preview with sports selection and event cards.

### Phase 2 next screens

- `SportEventsScreen`
  One list per sport, sourced from `events`.
- `EventDetailScreen`
  Event detail, map, organizer, participants, join CTA.
- `CreateEventScreen`
  New event flow with visibility, meeting point, schedule, code generation.
- `MyEventsScreen`
  Joined and created events.
- `NotificationsScreen`
  Local structure ready for later push integration.
- `ProfileScreen`
  Avatar, verified badge, attended events, safety tips.

### Phase 3 private community

- `GroupsFeedScreen`
  Private groups by leader/influencer.
- `GroupDetailScreen`
  Membership state, invite URL, members, private events.
- `GroupRequestsScreen`
  Accept/reject member requests.

### Phase 4 moderation and trust

- `ReviewQueueScreen`
  Admin-only verification review queue.
- `SafetyActionsScreen`
  Remove participants, block users, inspect incidents.

## 3. Modules

- `auth`
  Supabase Auth session, registration, login, logout.
- `verification`
  Profile completion, document uploads, pending/approved/rejected state.
- `sports-home`
  Large sport buttons that open filtered event lists.
- `events`
  Public events, private event codes, participant management.
- `groups`
  Invite-only communities with verified-only membership.
- `notifications`
  Event joined, reminders, group approvals, verification results.
- `trust`
  Verified badge, attendance count, safety tips, moderation actions.

## 4. Roles

- `athlete`
  Regular verified member.
- `leader`
  Group creator or influencer who can manage private communities.
- `moderator`
  Reviews identity submissions and intervenes in trust incidents.

## 5. Data notes

- `profiles` should mirror the app state needed immediately after auth.
- `verification_submissions` should be append-only so resubmissions are auditable.
- `events.private_code` is only visible to organizer and accepted participants.
- `group_members.status` is the gate for private communities.
- `notifications` should exist now even if push delivery comes later.
- `user_safety_blocks` is necessary because organizers must remove or block users.

## 6. Recommended next implementation order

1. Connect the current mobile flow to a live Supabase project.
2. Build `SportEventsScreen` using the approved-state home buttons.
3. Add `EventDetailScreen` + `event_participants` join action.
4. Add group flows and leader moderation.
5. Add reviewer/admin surfaces outside the athlete app or behind role checks.
