import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useSession } from '../providers/SessionProvider';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { PendingReviewScreen } from '../screens/PendingReviewScreen';
import { VerificationScreen } from '../screens/VerificationScreen';

export type RootStackParamList = {
  Auth: undefined;
  Verification: undefined;
  PendingReview: undefined;
  Home: undefined;
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
      ) : !profile ||
        profile.verificationStatus === 'unsubmitted' ||
        profile.verificationStatus === 'rejected' ? (
        <Stack.Screen component={VerificationScreen} name="Verification" />
      ) : profile.verificationStatus === 'pending' ? (
        <Stack.Screen component={PendingReviewScreen} name="PendingReview" />
      ) : (
        <Stack.Screen component={HomeScreen} name="Home" />
      )}
    </Stack.Navigator>
  );
}
