import { useCallback } from 'react';

export function useHaptic() {
  const haptic = useCallback((intensity = 'medium') => {
    // Check if device supports haptic feedback
    if ('vibrate' in navigator) {
      switch (intensity) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([20, 10, 20]);
          break;
        case 'error':
          navigator.vibrate([50, 30, 50, 30, 50]);
          break;
        case 'dice':
          navigator.vibrate([10, 5, 15, 5, 20, 5, 15, 5, 10]);
          break;
        default:
          navigator.vibrate(20);
      }
    }
  }, []);

  return { haptic };
}