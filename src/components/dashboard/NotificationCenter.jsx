import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle, ShieldAlert, Settings, Mail, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PREFS_KEY = 'cc_notif_prefs';
const NOTIFS_KEY = 'cc_notifications';

const defaultPrefs = {
  inApp: true,
  email: false,
  security: true,
  system: true,
  updates: true,
};

function loadPrefs() {
  try { return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; }
  catch { return defaultPrefs; }
}

function loadNotifications() {
  try { return JSON.parse(localStorage.getItem(NOTIFS_KEY) || '[]'); }
  catch { return []; }
}

function saveNotifications(notifs) {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs.slice(0, 50)));
}

const typeStyle = {
  security: { icon: ShieldAlert, color: '#FF3B3B' },
  warning:  { icon: AlertTriangle, color: '#FFC857' },
  system:   { icon: Info,          color: '#00E5FF' },
  success:  { icon: CheckCircle,   color: '#00D1B2' },
  update:   { icon: Bell,          color: '#9C27B0' },
};

export default function NotificationCenter({ accentA, panel0, panel1, text0, text1, muted, bg0 }) {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [notifications, setNotifications] = useState(loadNotifications);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [toast, setToast] = useState(null);

  const unread = notifications.filter(n => !n.read).length;

  // Persist prefs
  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  // Subscribe to real-time entity changes and generate notifications
  useEffect(() => {
    if (!prefs.inApp) return;

    const unsubs = [];

    // GameEvent notifications
    if (prefs.system) {
      unsubs.push(base44.entities.GameEvent.subscribe((event) => {
        if (event.type !== 'create') return;
        addNotification({
          type: 'system',
          title: 'New Game Event',
          body: `Event type: ${event.data?.type || 'UNKNOWN'}`,
        });
      }));
    }

    // PlayerSignal → security-ish
    if (prefs.security) {
      unsubs.push(base44.entities.PlayerSignal.subscribe((event) => {
        if (event.type !== 'create') return;
        if (event.data?.type === 'BUG') {
          addNotification({ type: 'warning', title: 'Player Bug Report', body: `Signal from player` });
        }
        if (event.data?.type === 'HELP') {
          addNotification({ type: 'security', title: 'Player Needs Help', body: `Help signal received` });
        }
      }));
    }

    return () => unsubs.forEach(u => u?.());
  }, [prefs]);

  const addNotification = useCallback((notif) => {
    const n = { id: Date.now() + Math.random(), ...notif, read: false, time: new Date().toISOString() };
    setNotifications(prev => {
      const next = [n, ...prev].slice(0, 50);
      saveNotifications(next);
      return next;
    });
    // Toast popup
    setToast(n);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Expose addNotification globally so other parts of the app can push notifications
  useEffect(() => {
    window.__ccNotify = addNotification;
    return () => { delete window.__ccNotify; };
  }, [addNotification]);

  const markAllRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      saveNotifications(next);
      return next;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const markRead = (id) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(next);
      return next;
    });
  };

  const togglePref = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const border = `1px solid ${accentA}30`;

  return (
    <>
      {/* Bell button */}
      <div className="relative">
        <button
          onClick={() => { setOpen(o => !o); setShowPrefs(false); }}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all"
          style={{ background: open ? accentA + '20' : 'transparent' }}
        >
          <Bell className="h-4 w-4" style={{ color: accentA }} />
          {unread > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold px-1"
              style={{ background: '#FF3B3B', color: '#fff' }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute right-0 top-11 z-[200] w-80 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: panel0, border }}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: accentA + '25' }}>
                <span className="text-xs font-mono font-bold tracking-widest" style={{ color: text0 }}>
                  NOTIFICATIONS {unread > 0 && <span style={{ color: accentA }}>({unread})</span>}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowPrefs(p => !p)} className="p-1 rounded hover:opacity-70" title="Preferences">
                    <Settings className="h-3.5 w-3.5" style={{ color: muted }} />
                  </button>
                  {notifications.length > 0 && (
                    <>
                      <button onClick={markAllRead} className="text-[9px] font-mono px-1.5 py-0.5 rounded hover:opacity-70" style={{ color: accentA }}>ALL READ</button>
                      <button onClick={clearAll} className="p-1 rounded hover:opacity-70" title="Clear all">
                        <Trash2 className="h-3.5 w-3.5" style={{ color: muted }} />
                      </button>
                    </>
                  )}
                  <button onClick={() => setOpen(false)} className="p-1 rounded hover:opacity-70">
                    <X className="h-3.5 w-3.5" style={{ color: muted }} />
                  </button>
                </div>
              </div>

              {/* Preferences panel */}
              <AnimatePresence>
                {showPrefs && (
                  <motion.div
                    className="px-4 py-3 border-b space-y-2"
                    style={{ borderColor: accentA + '20', background: panel1 }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <p className="text-[9px] font-mono tracking-widest mb-2" style={{ color: muted }}>NOTIFICATION PREFERENCES</p>
                    {[
                      { key: 'inApp',    label: 'In-App Alerts',    icon: Bell },
                      { key: 'email',    label: 'Email Alerts',     icon: Mail },
                      { key: 'security', label: 'Security Events',  icon: ShieldAlert },
                      { key: 'system',   label: 'System Events',    icon: Info },
                      { key: 'updates',  label: 'Game Updates',     icon: CheckCircle },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => togglePref(key)}
                        className="flex items-center justify-between w-full text-[10px] font-mono"
                        style={{ color: text1 }}
                      >
                        <span className="flex items-center gap-2"><Icon className="h-3 w-3" style={{ color: accentA }} />{label}</span>
                        <span
                          className="w-8 h-4 rounded-full flex items-center transition-all relative"
                          style={{ background: prefs[key] ? accentA : muted + '50' }}
                        >
                          <span
                            className="absolute w-3 h-3 rounded-full bg-white transition-all"
                            style={{ left: prefs[key] ? '17px' : '2px' }}
                          />
                        </span>
                      </button>
                    ))}
                    {prefs.email && (
                      <p className="text-[9px] font-mono mt-1" style={{ color: muted }}>
                        Email alerts use your registered account email.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notification list */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-[10px] font-mono text-center py-8" style={{ color: muted }}>NO NOTIFICATIONS</p>
                ) : notifications.map(n => {
                  const ts = typeStyle[n.type] || typeStyle.system;
                  const Icon = ts.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left border-b last:border-0 hover:opacity-80 transition-opacity"
                      style={{
                        borderColor: accentA + '12',
                        background: n.read ? 'transparent' : accentA + '07',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: ts.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono font-bold truncate" style={{ color: n.read ? muted : text0 }}>{n.title}</div>
                        <div className="text-[9px] font-mono truncate mt-0.5" style={{ color: muted }}>{n.body}</div>
                      </div>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: accentA }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-24 right-4 z-[300] w-72 rounded-xl shadow-2xl flex items-start gap-3 px-4 py-3"
            style={{ background: panel0, border: `1px solid ${(typeStyle[toast.type] || typeStyle.system).color}50` }}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              const ts = typeStyle[toast.type] || typeStyle.system;
              const Icon = ts.icon;
              return <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: ts.color }} />;
            })()}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono font-bold" style={{ color: text0 }}>{toast.title}</div>
              <div className="text-[9px] font-mono mt-0.5" style={{ color: muted }}>{toast.body}</div>
            </div>
            <button onClick={() => setToast(null)} className="p-0.5 hover:opacity-60">
              <X className="h-3.5 w-3.5" style={{ color: muted }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}