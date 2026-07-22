import { createElement, useEffect, useMemo, useRef } from 'react';

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

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only trust messages coming from our own iframe document.
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
        return;
      }
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'location' && typeof data.lat === 'number' && typeof data.lng === 'number') {
          onChangeRef.current({ latitude: data.lat, longitude: data.lng });
        }
      } catch {
        // Ignore malformed messages.
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return createElement('iframe', {
    ref: iframeRef,
    srcDoc: html,
    title: 'location-picker',
    style: {
      width: '100%',
      height,
      border: 'none',
      borderRadius,
      backgroundColor,
      display: 'block',
    },
  });
}
