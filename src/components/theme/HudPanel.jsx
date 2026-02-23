/**
 * HudPanel — the single source of truth for all themed panel surfaces.
 * Provides consistent corner brackets, header bar, and content padding.
 */
import React from 'react';
import { useTheme } from './useTheme';
import { cn } from '@/lib/utils';

export default function HudPanel({
  title,
  icon: Icon,
  children,
  className = '',
  headerRight,
  noPad = false,
  danger = false,
  style = {},
}) {
  const { theme } = useTheme();
  const c = theme?.colors || {};
  const accentA = c.accentA || '#00E5FF';
  const panel0 = c.panel0 || '#1A1F26';
  const text0 = c.text0 || '#E6F1FF';
  const muted = c.muted || '#5F6E80';
  const dangerColor = c.danger || '#FF3B3B';
  const borderColor = danger ? dangerColor + '50' : accentA + '22';
  const headerBorder = danger ? dangerColor + '30' : accentA + '18';
  const accentDisplay = danger ? dangerColor : accentA;

  return (
    <div
      className={cn('relative rounded-lg border overflow-hidden', className)}
      style={{ background: panel0, borderColor, ...style }}
    >
      {/* Corner brackets — GPU positioned, no layout impact */}
      <span
        className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l pointer-events-none z-10"
        style={{ borderColor: accentDisplay + '45' }}
        aria-hidden
      />
      <span
        className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r pointer-events-none z-10"
        style={{ borderColor: accentDisplay + '45' }}
        aria-hidden
      />

      {/* Header */}
      {title && (
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0"
          style={{ borderColor: headerBorder }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentDisplay }} />}
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] truncate"
              style={{ color: text0 }}
            >
              {title}
            </span>
          </div>
          {headerRight && (
            <div className="flex-shrink-0 ml-3">{headerRight}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={noPad ? '' : 'p-3 sm:p-4'}>
        {children}
      </div>
    </div>
  );
}