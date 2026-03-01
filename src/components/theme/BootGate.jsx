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

  // Check if boot is disabled in settings
  const bootEnabled = (() => {
    try {
      const s = JSON.parse(localStorage.getItem('catalystCoreSettings') || '{}');
      return s.bootEnabled !== false;
    } catch { return true; }
  })();

  // Boot not enabled or already authenticated — show children
  if (isAuthenticated || !bootEnabled) {
    return children;
  }

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
      <BootSequence theme={theme} reducedMotion={settings?.reducedMotion} onComplete={() => {}} />
    </div>
  );
}