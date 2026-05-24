'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'hw_disclaimer_accepted';

export default function SecurityDisclaimer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = sessionStorage.getItem(SESSION_KEY);
      if (!accepted) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative max-w-lg w-full glass-elevated rounded-xl border border-cyan-500/20 p-6 shadow-[0_0_60px_rgba(6,182,212,0.1)]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-cyan-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-slate-100 text-base">HantaWatch Intelligence Dashboard</h2>
                <p className="text-xs text-slate-500 font-mono">v1.0 — Demo Mode</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
              <p>
                This dashboard is for <span className="text-cyan-400 font-medium">informational and visualization purposes only</span>. It does not provide medical diagnosis or personal medical advice.
              </p>
              <p>
                <span className="text-amber-400 font-medium">Demo data shown in this application is simulated</span> unless explicitly connected to verified official sources. Case counts, locations, and dates are for demonstration purposes only.
              </p>
              <p>
                Always verify outbreak information with official health authorities:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-500 text-xs ml-2">
                <li>World Health Organization (WHO) — who.int</li>
                <li>U.S. CDC — cdc.gov</li>
                <li>Your local or national public health agency</li>
              </ul>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <button
                onClick={accept}
                className="w-full py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                I Understand — Enter Dashboard
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
