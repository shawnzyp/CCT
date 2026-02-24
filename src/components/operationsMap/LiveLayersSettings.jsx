// ── LIVE LAYERS SETTINGS PANEL ──────────────────────────────────────────────
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Settings2, ChevronDown, ChevronUp, Zap, Activity, Radio, Layers } from 'lucide-react';

function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200',
        checked ? 'border-transparent' : 'border-transparent'
      )}
      style={{
        background: checked ? 'var(--cc-accent-a, #00E5FF)' : 'var(--cc-panel1, #202833)',
      }}
      aria-label={label}
    >
      <span
        className="pointer-events-none inline-block h-4 w-4 rounded-full shadow transition-transform duration-200"
        style={{
          background: checked ? '#000' : 'var(--cc-muted, #5F6E80)',
          transform: checked ? 'translateX(16px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}

function Slider({ value, onChange, min = 0, max = 100, step = 5 }) {
  return (
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1 rounded-full appearance-none cursor-pointer"
      style={{ accentColor: 'var(--cc-accent-a, #00E5FF)' }}
    />
  );
}

function SegmentPicker({ value, onChange, options }) {
  return (
    <div className="flex gap-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 py-0.5 rounded text-[10px] font-mono font-bold transition-all"
          style={{
            background: value === opt.value ? 'var(--cc-accent-a, #00E5FF)' : 'var(--cc-panel1, #202833)',
            color: value === opt.value ? '#000' : 'var(--cc-muted, #5F6E80)',
            border: `1px solid ${value === opt.value ? 'transparent' : 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 15%, transparent)'}`,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, right, children }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--cc-muted, #5F6E80)' }}>{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

function Section({ icon: Icon, title, enabled, onToggle, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-lg overflow-hidden"
      style={{ borderColor: 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 15%, transparent)', background: 'var(--cc-panel1, #202833)' }}>
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <Icon className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--cc-accent-a, #00E5FF)' }} />
        <span className="flex-1 text-xs font-mono font-bold tracking-wide" style={{ color: 'var(--cc-text0, #E6F1FF)' }}>{title}</span>
        <Toggle checked={enabled} onChange={onToggle} label={title} />
        {open ? <ChevronUp className="h-3 w-3 ml-1" style={{ color: 'var(--cc-muted)' }} />
               : <ChevronDown className="h-3 w-3 ml-1" style={{ color: 'var(--cc-muted)' }} />}
      </button>
      {open && enabled && (
        <div className="px-3 pb-3 space-y-3 border-t"
          style={{ borderColor: 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 10%, transparent)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function LiveLayersSettings({ settings, onUpdate, onClose }) {
  return (
    <div
      className="absolute top-12 right-0 z-30 w-64 rounded-xl shadow-2xl overflow-hidden"
      style={{
        background: 'var(--cc-panel0, #1A1F26)',
        border: '1px solid color-mix(in srgb, var(--cc-accent-a, #00E5FF) 25%, transparent)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 15%, transparent)' }}>
        <Settings2 className="h-3.5 w-3.5" style={{ color: 'var(--cc-accent-a)' }} />
        <span className="text-xs font-mono font-bold tracking-widest" style={{ color: 'var(--cc-text0)' }}>MAP FEED SETTINGS</span>
        <button onClick={onClose} className="ml-auto text-xs font-mono" style={{ color: 'var(--cc-muted)' }}>✕</button>
      </div>

      <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">

        {/* SATELLITE SWEEP */}
        <Section icon={Radio} title="Satellite Sweep" enabled={settings.sweep.enabled}
          onToggle={v => onUpdate('sweep', { enabled: v })}>
          <Row label="Intensity">
            <Slider value={settings.sweep.intensity} onChange={v => onUpdate('sweep', { intensity: v })} />
          </Row>
          <Row label="Speed">
            <SegmentPicker value={settings.sweep.speed} onChange={v => onUpdate('sweep', { speed: v })}
              options={[{ value: 'slow', label: 'Slow' }, { value: 'normal', label: 'Norm' }, { value: 'fast', label: 'Fast' }]} />
          </Row>
        </Section>

        {/* FACTION HEATMAP */}
        <Section icon={Layers} title="Faction Heatmap" enabled={settings.heatmap.enabled}
          onToggle={v => onUpdate('heatmap', { enabled: v })}>
          <Row label="Opacity">
            <Slider value={settings.heatmap.opacity} onChange={v => onUpdate('heatmap', { opacity: v })} />
          </Row>
          <Row label="Mode">
            <SegmentPicker value={settings.heatmap.mode} onChange={v => onUpdate('heatmap', { mode: v })}
              options={[
                { value: 'blend', label: 'Blend' },
                { value: 'exclusive', label: 'Excl' },
                { value: 'outline', label: 'Outln' },
              ]} />
          </Row>
          <Row label="Legend" right={
            <Toggle checked={settings.heatmap.showLegend} onChange={v => onUpdate('heatmap', { showLegend: v })} label="Legend" />
          } />
        </Section>

        {/* LIVE PULSES */}
        <Section icon={Zap} title="Live Event Pulses" enabled={settings.pulses.enabled}
          onToggle={v => onUpdate('pulses', { enabled: v })}>
          <Row label="Intensity">
            <Slider value={settings.pulses.intensity} onChange={v => onUpdate('pulses', { intensity: v })} />
          </Row>
          <Row label="Detail">
            <SegmentPicker value={settings.pulses.detail} onChange={v => onUpdate('pulses', { detail: v })}
              options={[{ value: 'low', label: 'Low' }, { value: 'standard', label: 'Std' }, { value: 'high', label: 'High' }]} />
          </Row>
        </Section>

        {/* AMBIENT ACTIVITY */}
        <Section icon={Activity} title="Ambient Activity" enabled={settings.ambient.enabled}
          onToggle={v => onUpdate('ambient', { enabled: v })}>
          <Row label="Density">
            <SegmentPicker value={settings.ambient.density} onChange={v => onUpdate('ambient', { density: v })}
              options={[{ value: 'low', label: 'Low' }, { value: 'standard', label: 'Std' }, { value: 'high', label: 'High' }]} />
          </Row>
          {[
            { key: 'specks',      label: 'Signal Specks' },
            { key: 'drift',       label: 'Maritime Drift' },
            { key: 'blooms',      label: 'District Blooms' },
            { key: 'noise',       label: 'Scan Noise' },
            { key: 'gridFlicker', label: 'Grid Flicker' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[10px] font-mono" style={{ color: 'var(--cc-text1, #8EA0B5)' }}>{label}</span>
              <Toggle checked={settings.ambient[key]} onChange={v => onUpdate('ambient', { [key]: v })} label={label} />
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}