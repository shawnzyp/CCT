/**
 * PageWrapper — applies the active CC theme background to any page.
 * Use this instead of hardcoded `bg-gradient-to-br from-slate-950 ...`
 */
import React from 'react';
import { useTheme } from '@/components/theme/useTheme';

export default function PageWrapper({ children, className = '', style = {} }) {
  const { theme } = useTheme();
  const bg = theme?.background?.gradient || '#0F1216';
  const bg0 = theme?.colors?.bg0 || '#0F1216';

  return (
    <div
      className={`min-h-screen ${className}`}
      style={{ background: bg, ...style }}
    >
      {children}
    </div>
  );
}