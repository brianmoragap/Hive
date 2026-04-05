import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, shadows } from '../theme/tokens';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GlassPanel({ children, style }: GlassPanelProps) {
  return (
    <View style={[styles.shell, style]}>
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={24}
        style={StyleSheet.absoluteFill}
        tint="light"
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.82)', 'rgba(255, 244, 244, 0.62)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    backgroundColor: colors.surfaceSoft,
    ...shadows.card,
  },
  content: {
    padding: 28,
  },
});
