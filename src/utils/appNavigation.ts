import { Alert } from 'react-native';

import type { AppCopy } from '../i18n/copy';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { AppTab } from '../types/domain';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export function handleAppTabPress(
  activeTab: AppTab | null | undefined,
  nextTab: AppTab,
  copy: AppCopy,
  navigation: RootNavigation,
) {
  if (nextTab === activeTab) {
    return;
  }

  if (nextTab === 'home') {
    navigation.navigate('Home');
    return;
  }

  if (nextTab === 'activity') {
    navigation.navigate('Activity');
    return;
  }

  if (nextTab === 'profile') {
    navigation.navigate('Profile');
    return;
  }

  Alert.alert(copy.home.tabSoonTitle, `${copy.home.tabCommunity} ${copy.home.tabSoonBody}`);
}
