import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';
import { useTheme } from '@/components/theme/useTheme';

export default function SaveStatusDot() {
  const { theme } = useTheme();
  const accentA = theme?.colors?.accentA || '#00E5FF';
  const [status, setStatus] = useState('idle'); // idle, pending, saved, failed
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    // Listen for autosave events
    const handleAutoSave = () => {
      setStatus('pending');
      setTimeout(() => setStatus('saved'), 100);
      
      // Blink green for 30s
      const timeout = setTimeout(() => setStatus('idle'), 30000);
      return () => clearTimeout(timeout);
    };

    const handleSaveSuccess = () => {
      setStatus('saved');
      const timeout = setTimeout(() => setStatus('idle'), 30000);
      return () => clearTimeout(timeout);
    };

    const handleSaveFailed = (e) => {
      setStatus('failed');
      setAlertMessage(e.detail?.message || 'Save failed. Please check your connection.');
      setShowAlert(true);
    };

    const handleOffline = () => {
      setStatus('failed');
      setAlertMessage('Server is offline. Your changes will sync when connection is restored.');
      setShowAlert(true);
    };

    window.addEventListener('appSaved', handleAutoSave);
    window.addEventListener('saveSuccess', handleSaveSuccess);
    window.addEventListener('saveFailed', handleSaveFailed);
    window.addEventListener('appOffline', handleOffline);

    return () => {
      window.removeEventListener('appSaved', handleAutoSave);
      window.removeEventListener('saveSuccess', handleSaveSuccess);
      window.removeEventListener('saveFailed', handleSaveFailed);
      window.removeEventListener('appOffline', handleOffline);
    };
  }, []);

  const isBlinking = status === 'pending' || status === 'failed';
  const dotColor = status === 'failed' ? '#FF3B3B' : accentA;

  return (
    <>
      <div className="relative">
        <motion.div
          className="h-2.5 w-2.5 rounded-full cursor-pointer"
          style={{
            background: dotColor,
            boxShadow: `0 0 8px ${dotColor}`,
          }}
          animate={
            isBlinking
              ? { opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }
              : { opacity: 1, scale: 1 }
          }
          transition={{
            duration: 1.2,
            repeat: isBlinking ? Infinity : 0,
            ease: 'easeInOut',
          }}
          onClick={() => status === 'failed' && setShowAlert(true)}
          title={
            status === 'saved' ? 'Recently saved' :
            status === 'pending' ? 'Autosave in progress' :
            status === 'failed' ? 'Save failed - click for details' :
            'Waiting to save'
          }
        />
        {status === 'saved' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ borderWidth: '1px', borderColor: accentA }}
          />
        )}
      </div>

      {/* Alert Popup */}
      <AnimatePresence>
        {showAlert && status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="fixed bottom-24 right-4 md:bottom-auto md:top-20 md:right-6 z-50"
          >
            <div
              className="rounded-lg p-4 flex items-start gap-3 shadow-lg backdrop-blur-sm max-w-xs"
              style={{
                background: 'rgba(15, 18, 22, 0.95)',
                border: `1px solid rgba(255, 59, 59, 0.4)`,
              }}
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-red-300 font-semibold">Save Error</div>
                <div className="text-xs font-mono text-red-200/80 mt-1 leading-relaxed">
                  {alertMessage}
                </div>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="text-red-400 hover:text-red-300 flex-shrink-0 mt-0.5"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}