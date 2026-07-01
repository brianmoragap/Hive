import { LinearGradient } from 'expo-linear-gradient';
import {
  ImageBackground,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../providers/ThemeProvider';
import { heroBackgroundImage } from '../theme/tokens';

interface ScreenFrameProps {
  children: React.ReactNode;
  variant?: 'photo' | 'gradient';
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenFrame({
  children,
  variant = 'gradient',
  contentStyle,
}: ScreenFrameProps) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {variant === 'photo' ? (
        <ImageBackground
          resizeMode="cover"
          source={{ uri: heroBackgroundImage }}
          style={StyleSheet.absoluteFill}
        >
          <LinearGradient
            colors={theme.photoOverlay}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={[
            theme.colors.background,
            theme.colors.backgroundWarm,
            theme.colors.backgroundWarm,
          ]}
          style={StyleSheet.absoluteFill}
        >
          <View
            style={[
              styles.blob,
              styles.blobCoral,
              { backgroundColor: theme.colors.blobCoral },
            ]}
          />
          <View
            style={[
              styles.blob,
              styles.blobMint,
              { backgroundColor: theme.colors.blobMint },
            ]}
          />
          <View
            style={[
              styles.blob,
              styles.blobLilac,
              { backgroundColor: theme.colors.blobLilac },
            ]}
          />
        </LinearGradient>
      )}

      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, contentStyle]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobCoral: {
    width: 280,
    height: 280,
    top: -80,
    right: -60,
  },
  blobMint: {
    width: 220,
    height: 220,
    bottom: 120,
    left: -70,
  },
  blobLilac: {
    width: 180,
    height: 180,
    top: 220,
    left: 220,
  },
});
