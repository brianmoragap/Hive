import { LinearGradient } from 'expo-linear-gradient';
import {
  ImageBackground,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, heroBackgroundImage } from '../theme/tokens';

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
  return (
    <View style={styles.root}>
      {variant === 'photo' ? (
        <ImageBackground
          resizeMode="cover"
          source={{ uri: heroBackgroundImage }}
          style={StyleSheet.absoluteFill}
        >
          <LinearGradient
            colors={[
              'rgba(25, 12, 18, 0.55)',
              'rgba(74, 28, 38, 0.28)',
              'rgba(255, 244, 244, 0.12)',
            ]}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={[colors.background, colors.backgroundWarm, '#FFEFE8']}
          style={StyleSheet.absoluteFill}
        >
          <View style={[styles.blob, styles.blobCoral]} />
          <View style={[styles.blob, styles.blobMint]} />
          <View style={[styles.blob, styles.blobLilac]} />
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
    backgroundColor: colors.background,
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
    backgroundColor: 'rgba(255, 94, 94, 0.16)',
  },
  blobMint: {
    width: 220,
    height: 220,
    bottom: 120,
    left: -70,
    backgroundColor: 'rgba(188, 231, 222, 0.28)',
  },
  blobLilac: {
    width: 180,
    height: 180,
    top: 220,
    left: 220,
    backgroundColor: 'rgba(232, 215, 255, 0.22)',
  },
});
