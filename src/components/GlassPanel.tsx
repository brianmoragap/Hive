import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '../providers/ThemeProvider';
import { radii, shadows } from '../theme/tokens';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GlassPanel({ children, style }: GlassPanelProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.shell,
        {
          backgroundColor: theme.colors.surfaceSoft,
          borderColor: theme.colors.panelBorder,
        },
        style,
      ]}
    >
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={24}
        style={StyleSheet.absoluteFill}
        tint={theme.blurTint}
      />
      <LinearGradient
        colors={[theme.colors.panelGradientStart, theme.colors.panelGradientEnd]}
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
    ...shadows.card,
  },
  content: {
    padding: 28,
  },
});
