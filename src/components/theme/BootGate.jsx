import React, { useEffect } from 'react';
import { useBiometricAuth } from './useBiometricAuth';
import BootSequence from './BootSequence';
import { useTheme } from './useTheme';
import { useSettings } from '@/components/utils/useSettings';

export default function BootGate({ children }) {
  const { isAuthenticated } = useBiometricAuth();
  const { theme } = useTheme();
  const { settings } = useSettings();

  // Control body overflow during boot
  useEffect(() => {
    if (!isAuthenticated) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isAuthenticated]);

  // Boot not enabled or already authenticated
  if (isAuthenticated) {
    return children;
  }

  // Check if boot is disabled in settings
  try {
    const settings_stored = JSON.parse(localStorage.getItem('catalystCoreSettings') || '{}');
    if (settings_stored.bootEnabled === false) {
      return children;
    }
  } catch {}

  // Render full-screen boot gate
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: theme?.background?.gradient || '#0F1216',
        overflow: 'hidden',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <BootSequence theme={theme} reducedMotion={settings?.reducedMotion} />
    </div>
  );
}