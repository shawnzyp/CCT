import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TutorialTooltip({ 
  content, 
  children, 
  position = 'top',
  icon = 'help',
  showOnHover = true 
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        className="inline-flex items-center gap-1 cursor-help"
        onMouseEnter={() => showOnHover && setIsVisible(true)}
        onMouseLeave={() => showOnHover && setIsVisible(false)}
        onClick={() => !showOnHover && setIsVisible(!isVisible)}
      >
        {children}
        {icon === 'help' ? (
          <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-violet-400 transition-colors" />
        ) : (
          <Info className="h-3.5 w-3.5 text-slate-400 hover:text-violet-400 transition-colors" />
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 w-64 pointer-events-none",
              position === 'top' && "bottom-full left-1/2 -translate-x-1/2 mb-2",
              position === 'bottom' && "top-full left-1/2 -translate-x-1/2 mt-2",
              position === 'left' && "right-full top-1/2 -translate-y-1/2 mr-2",
              position === 'right' && "left-full top-1/2 -translate-y-1/2 ml-2"
            )}
          >
            <div className="bg-slate-900 border border-violet-500/50 rounded-lg shadow-xl p-3">
              <p className="text-xs text-slate-200 leading-relaxed">{content}</p>
            </div>
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-2 h-2 bg-slate-900 border-violet-500/50 rotate-45",
                position === 'top' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-r border-b",
                position === 'bottom' && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-t",
                position === 'left' && "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-t border-r",
                position === 'right' && "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-b border-l"
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}