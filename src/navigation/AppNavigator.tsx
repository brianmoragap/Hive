import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useSession } from '../providers/SessionProvider';
import { ActivityScreen } from '../screens/ActivityScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { CreateEventScreen } from '../screens/CreateEventScreen';
import { EventChatScreen } from '../screens/EventChatScreen';
import { EventCheckInScreen } from '../screens/EventCheckInScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InviteMembersScreen } from '../screens/InviteMembersScreen';
import { JoinEventScreen } from '../screens/JoinEventScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { MyEventsScreen } from '../screens/MyEventsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PendingReviewScreen } from '../screens/PendingReviewScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { VerificationScreen } from '../screens/VerificationScreen';
import type { EventActivityType, SportType } from '../types/domain';

export type RootStackParamList = {
  Activity: undefined;
  Auth: undefined;
  CreateEvent: { eventId?: string; prefillSport?: SportType } | undefined;
  EventChat: { eventId: string };
  EventCheckIn: { eventId: string };
  EventDetail: { eventId: string };
  InviteMembers: { eventId: string };
  JoinEvent: { token: string };
  Onboarding: undefined;
  Verification: undefined;
  PendingReview: undefined;
  Home: undefined;
  MyEvents:
    | {
        focusEventId?: string;
        freshAction?: EventActivityType;
      }
    | undefined;
  Profile: undefined;
  Settings: undefined;
  Loading: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { initializing, user, profile } = useSession();

  return (
    <Stack.Navigator screenOptions={{ animation: 'fade', headerShown: false }}>
      {initializing ? (
        <Stack.Screen component={LoadingScreen} name="Loading" />
      ) : !user ? (
        <Stack.Screen component={AuthScreen} name="Auth" />
      ) : profile?.verificationStatus === 'pending' ? (
        <Stack.Screen component={PendingReviewScreen} name="PendingReview" />
      ) : profile?.verificationStatus === 'approved' ? (
        <>
          <Stack.Screen component={HomeScreen} name="Home" />
          <Stack.Screen
            component={ActivityScreen}
            name="Activity"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            component={CreateEventScreen}
            name="CreateEvent"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            component={EventCheckInScreen}
            name="EventCheckIn"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            component={EventDetailScreen}
            name="EventDetail"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            component={EventChatScreen}
            name="EventChat"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            component={MyEventsScreen}
            name="MyEvents"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            component={InviteMembersScreen}
            name="InviteMembers"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            component={JoinEventScreen}
            name="JoinEvent"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            component={ProfileScreen}
            name="Profile"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            component={SettingsScreen}
            name="Settings"
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : !profile || !profile.onboardingCompleted ? (
        <Stack.Screen component={OnboardingScreen} name="Onboarding" />
      ) : (
        <Stack.Screen component={VerificationScreen} name="Verification" />
      )}
    </Stack.Navigator>
  );
}
