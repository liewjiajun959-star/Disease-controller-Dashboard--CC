'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '@/context/DashboardContext';
import { useUsageLogger } from '@/hooks/useUsageLogger';
import type { PanelTab } from '@/types';
import NewsPanel from './NewsPanel';
import BreakthroughPanel from './BreakthroughPanel';
import HealthAnnouncementPanel from './HealthAnnouncementPanel';

const TABS: { id: PanelTab; label: string; icon: string }[] = [
  { id: 'news', label: 'News', icon: '◉' },
  { id: 'breakthroughs', label: 'Breakthroughs', icon: '⬡' },
  { id: 'announcements', label: 'Health Guide', icon: '⊕' },
];

export default function LeftInfoPanel() {
  const { state, setActiveTab } = useDashboard();
  const { log } = useUsageLogger();

  function handleTabChange(tab: PanelTab) {
    log('panel_switched', 'left_panel', 'success', {
      fromTab: state.activeTab,
      toTab: tab,
    });
    setActiveTab(tab);
  }

  return (
    <div className="flex flex-col h-full bg-[#0f1628]/60">
      {/* Panel header */}
      <div className="flex-shrink-0 px-3 pt-2 pb-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
            INFORMATION FEEDS
          </span>
          <div className="flex-1 h-px bg-white/[0.04]" />
          <button className="text-slate-600 hover:text-slate-400 transition-colors text-xs">
            ⇅
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.02]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono font-medium transition-all relative ${
                state.activeTab === tab.id
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-slate-600 hover:text-slate-400 hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-[11px] leading-none">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {state.activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeTab}
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
          >
            {state.activeTab === 'news' && <NewsPanel />}
            {state.activeTab === 'breakthroughs' && <BreakthroughPanel />}
            {state.activeTab === 'announcements' && <HealthAnnouncementPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
