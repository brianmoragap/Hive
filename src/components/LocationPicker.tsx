import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { buildLocationPickerHtml, type LocationPickerProps } from './locationPickerHtml';

export function LocationPicker({
  initialLatitude,
  initialLongitude,
  onChange,
  height = 200,
  borderRadius = 28,
  backgroundColor = '#e9e5e2',
}: LocationPickerProps) {
  const html = useMemo(
    () => buildLocationPickerHtml(initialLatitude, initialLongitude),
    [initialLatitude, initialLongitude],
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data?.type === 'location' && typeof data.lat === 'number' && typeof data.lng === 'number') {
          onChange({ latitude: data.lat, longitude: data.lng });
        }
      } catch {
        // Ignore malformed messages.
      }
    },
    [onChange],
  );

  return (
    <View style={[styles.container, { height, borderRadius, backgroundColor }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        style={styles.web}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  web: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
