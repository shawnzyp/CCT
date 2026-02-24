// ── LIVE LAYERS CANVAS: Satellite Sweep + Ambient Activity (CSS/Canvas) ────
// The faction heatmap and pulses live in Mapbox layers (OperationsMapView).
// This component handles the CSS/canvas overlay layers on top of the map.
import React, { useRef, useEffect, useCallback } from 'react';
import { OPERATIONAL_POLYGON } from './mapConfig';

const MASK_BG = '#0F1216';

// Build an SVG clip path string from the polygon coords projected via mapboxgl
function buildSVGPath(map, polygon, w, h) {
  try {
    const pts = polygon.map(([lng, lat]) => {
      const p = map.project([lng, lat]);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    });
    return `polygon(${pts.join(', ')})`;
  } catch { return 'none'; }
}

// Get theme colors from CSS vars
function themeColor(varName, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
}

// ── SATELLITE SWEEP CANVAS ─────────────────────────────────────────────────
function useSweepCanvas(canvasRef, settings, reducedMotion) {
  const rafRef = useRef(null);
  const stateRef = useRef({ progress: 0, loopDur: 22000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastTs = null;

    // Speed multiplier
    const speedMul = settings.speed === 'slow' ? 0.55 : settings.speed === 'fast' ? 1.8 : 1.0;
    const baseDur = 22000;
    stateRef.current.loopDur = baseDur / speedMul;

    function draw(ts) {
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (!reducedMotion && settings.enabled) {
        stateRef.current.progress = (stateRef.current.progress + dt / stateRef.current.loopDur) % 1;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (!settings.enabled) { rafRef.current = requestAnimationFrame(draw); return; }

      const t = stateRef.current.progress;
      const intensityF = settings.intensity / 100;

      const accentA = themeColor('--cc-accent-a', '#00E5FF');
      const accentB = themeColor('--cc-accent-b', '#5CCFFF');

      // Diagonal sweep: 30-degree band moving across the canvas
      const angle = 30 * Math.PI / 180;
      const diagLen = Math.sqrt(w * w + h * h);
      const offset = (t * diagLen * 2.4) - diagLen * 0.7;

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-angle);

      // Trailing glow (wider, softer)
      const trailGrad = ctx.createLinearGradient(-diagLen, offset - 120, -diagLen, offset);
      trailGrad.addColorStop(0, 'rgba(0,0,0,0)');
      trailGrad.addColorStop(1, hexToRgba(accentA, 0.025 * intensityF));
      ctx.fillStyle = trailGrad;
      ctx.fillRect(-diagLen, offset - 120, diagLen * 2, 120);

      // Leading edge (sharp bright line)
      const edgeGrad = ctx.createLinearGradient(-diagLen, offset, -diagLen, offset + 18);
      edgeGrad.addColorStop(0, hexToRgba(accentB, 0.28 * intensityF));
      edgeGrad.addColorStop(0.3, hexToRgba(accentA, 0.12 * intensityF));
      edgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(-diagLen, offset, diagLen * 2, 18);

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [settings.enabled, settings.intensity, settings.speed, reducedMotion]);
}

// ── AMBIENT CANVAS ─────────────────────────────────────────────────────────
function useAmbientCanvas(canvasRef, settings, reducedMotion, mapRef) {
  const rafRef = useRef(null);
  const stateRef = useRef({
    specks: [],
    blooms: [],
    bloomTs: 0,
    gridFlickerTs: 0,
    gridAlpha: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const densityMul = settings.density === 'low' ? 0.4 : settings.density === 'high' ? 2 : 1;
    const speckCount = Math.floor(40 * densityMul);
    const s = stateRef.current;

    // Init specks
    s.specks = Array.from({ length: speckCount }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() * 0.0002 + 0.00005) * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() * 0.0001 - 0.00005),
      alpha: Math.random() * 0.4 + 0.1,
      size: Math.random() * 1.5 + 0.5,
    }));

    s.blooms = [];
    let lastTs = null;

    function draw(ts) {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (!settings.enabled) { rafRef.current = requestAnimationFrame(draw); return; }

      const accentA = themeColor('--cc-accent-a', '#00E5FF');
      const intensityF = 1;

      // ── SPECKS ──────────────────────────────────────────────────────
      if (settings.specks && !reducedMotion) {
        ctx.save();
        s.specks.forEach(sp => {
          sp.x = (sp.x + sp.vx + 1) % 1;
          sp.y = (sp.y + sp.vy + 1) % 1;
          ctx.beginPath();
          ctx.arc(sp.x * w, sp.y * h, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(accentA, sp.alpha * 0.25);
          ctx.fill();
        });
        ctx.restore();
      }

      // ── DISTRICT BLOOMS ──────────────────────────────────────────────
      if (settings.blooms) {
        // Spawn new bloom every 8–15s, max 2
        if (ts - s.bloomTs > 8000 + Math.random() * 7000 && s.blooms.length < 2) {
          s.bloomTs = ts;
          s.blooms.push({
            x: 0.15 + Math.random() * 0.7,
            y: 0.15 + Math.random() * 0.7,
            r: 40 + Math.random() * 60,
            alpha: 0,
            phase: 'in',
            startTs: ts,
            dur: 3000 + Math.random() * 2000,
          });
        }
        ctx.save();
        s.blooms = s.blooms.filter(b => {
          const elapsed = ts - b.startTs;
          const halfDur = b.dur / 2;
          if (b.phase === 'in') {
            b.alpha = Math.min(elapsed / halfDur, 1);
            if (elapsed > halfDur) b.phase = 'out';
          } else {
            b.alpha = Math.max(1 - (elapsed - halfDur) / halfDur, 0);
          }
          if (b.alpha <= 0 && b.phase === 'out') return false;
          const rGrad = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, b.r);
          rGrad.addColorStop(0, hexToRgba(accentA, b.alpha * 0.08));
          rGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rGrad;
          ctx.beginPath();
          ctx.arc(b.x * w, b.y * h, b.r, 0, Math.PI * 2);
          ctx.fill();
          return true;
        });
        ctx.restore();
      }

      // ── GRID FLICKER ──────────────────────────────────────────────────
      if (settings.gridFlicker) {
        if (ts - s.gridFlickerTs > 25000 + Math.random() * 15000) {
          s.gridFlickerTs = ts;
          s.gridAlpha = 0.06;
        }
        if (s.gridAlpha > 0) {
          ctx.save();
          ctx.globalAlpha = s.gridAlpha;
          ctx.strokeStyle = accentA;
          ctx.lineWidth = 0.5;
          const gStep = reducedMotion ? 60 : 50;
          for (let x = 0; x < w; x += gStep) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
          }
          for (let y = 0; y < h; y += gStep) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
          }
          ctx.restore();
          s.gridAlpha = Math.max(0, s.gridAlpha - dt * 0.00015);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [settings.enabled, settings.density, settings.specks, settings.blooms, settings.gridFlicker, reducedMotion]);
}

// ── PULSE CANVAS ────────────────────────────────────────────────────────────
function usePulseCanvas(canvasRef, activePulses, settings, reducedMotion, mapRef) {
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastTs = null;

    const PULSE_COLORS = {
      SOS:      '#FF3B3B',
      SUPPLY:   '#00D1B2',
      MISSION:  '#00E5FF',
      LOCKDOWN: '#FFC857',
      ANOMALY:  '#8B5CF6',
    };

    function draw(ts) {
      if (!lastTs) lastTs = ts;
      lastTs = ts;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (!settings.enabled || activePulses.length === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const intensityF = settings.intensity / 100;
      const ripples = settings.detail === 'low' ? 1 : settings.detail === 'high' ? 3 : 2;

      activePulses.forEach(pulse => {
        const map = mapRef?.current;
        if (!map) return;

        let px, py;
        try {
          const projected = map.project([pulse.location.lng, pulse.location.lat]);
          px = projected.x; py = projected.y;
        } catch { return; }

        const elapsed = ts - pulse.createdAt;
        const dur = pulse.durationMs || 8000;
        const progress = Math.min(elapsed / dur, 1);
        const color = PULSE_COLORS[pulse.type] || '#00E5FF';
        const maxR = (pulse.radiusMiles || 1) * 80; // rough px radius per mile at zoom 12

        for (let r = 0; r < ripples; r++) {
          const rippleOffset = r / ripples;
          const t = (progress + rippleOffset) % 1;
          const radius = t * maxR;
          const alpha = (1 - t) * 0.5 * intensityF;
          if (alpha <= 0) continue;

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(color, alpha);
          ctx.lineWidth = reducedMotion ? 1 : 2;
          ctx.stroke();

          // Inner fill
          const rGrad = ctx.createRadialGradient(px, py, 0, px, py, radius);
          rGrad.addColorStop(0, hexToRgba(color, alpha * 0.08));
          rGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rGrad;
          ctx.fill();
          ctx.restore();
        }

        // Static blink for reduced motion
        if (reducedMotion) {
          ctx.save();
          const blinkAlpha = Math.sin(ts / 300) > 0 ? 0.7 : 0;
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(color, blinkAlpha * intensityF);
          ctx.fill();
          ctx.restore();
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activePulses, settings.enabled, settings.intensity, settings.detail, reducedMotion]);
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function LiveLayersCanvas({ settings, activePulses, reducedMotion, mapRef, containerRef }) {
  const sweepCanvasRef = useRef(null);
  const ambientCanvasRef = useRef(null);
  const pulseCanvasRef = useRef(null);

  // Sync canvas size to container
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;
    const resize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      [sweepCanvasRef, ambientCanvasRef, pulseCanvasRef].forEach(ref => {
        if (ref.current) { ref.current.width = w; ref.current.height = h; }
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef]);

  useSweepCanvas(sweepCanvasRef, settings.sweep, reducedMotion);
  useAmbientCanvas(ambientCanvasRef, settings.ambient, reducedMotion, mapRef);
  usePulseCanvas(pulseCanvasRef, activePulses, settings.pulses, reducedMotion, mapRef);

  const canvasStyle = {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: 5,
  };

  return (
    <>
      {/* Ambient — below sweep */}
      <canvas ref={ambientCanvasRef} style={{ ...canvasStyle, zIndex: 3, opacity: settings.ambient.enabled ? 1 : 0 }} />
      {/* Sweep — above ambient */}
      <canvas ref={sweepCanvasRef} style={{ ...canvasStyle, zIndex: 4, opacity: settings.sweep.enabled ? 1 : 0 }} />
      {/* Pulses — above sweep, below UI */}
      <canvas ref={pulseCanvasRef} style={{ ...canvasStyle, zIndex: 6 }} />
    </>
  );
}

// Hex to rgba helper
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}