'use client';

import { motion } from 'framer-motion';
import AlertCard from './AlertCard';
import type { AlertCard as AlertCardType } from '@/types';

// Mock alert data for the top intelligence bar
const ALERTS: AlertCardType[] = [
  {
    id: 'a-001',
    type: 'patient_zero',
    title: 'Patient Zero Identified',
    subtitle: 'Udon Thani, Thailand',
    detail: 'First case linked to agricultural rodent exposure — genomic sequencing ongoing.',
    countryCode: 'TH',
    severity: 'HIGH',
    timestamp: '2025-05-24T06:14:00Z',
    isNew: true,
  },
  {
    id: 'a-002',
    type: 'new_cluster',
    title: 'New Cluster Detected',
    subtitle: '3 new cases — Santa Cruz, Bolivia',
    detail: 'Andes Virus cluster expanding in Santa Cruz Province. Contact tracing active.',
    countryCode: 'BO',
    severity: 'HIGH',
    timestamp: '2025-05-24T05:00:00Z',
    isNew: true,
  },
  {
    id: 'a-003',
    type: 'country_alert',
    title: 'Country Alert: Rising Cases',
    subtitle: 'South Korea — Gyeonggi Province',
    detail: 'Hantaan Virus cases rising. Field rodent surveys underway.',
    countryCode: 'KR',
    severity: 'ELEVATED',
    timestamp: '2025-05-23T22:10:00Z',
    isNew: false,
  },
  {
    id: 'a-004',
    type: 'country_alert',
    title: 'Outbreak Acceleration',
    subtitle: 'Germany — Rapid Risk Assessment',
    detail: 'ECDC issued rapid risk assessment on novel Thailand strain.',
    countryCode: 'DE',
    severity: 'LOW',
    timestamp: '2025-05-24T10:00:00Z',
    isNew: false,
  },
  {
    id: 'a-005',
    type: 'new_cluster',
    title: 'New Signal: Chile',
    subtitle: 'Araucanía Region — 3 linked cases',
    detail: 'Possible common exposure site under investigation.',
    countryCode: 'CL',
    severity: 'ELEVATED',
    timestamp: '2025-05-23T16:00:00Z',
    isNew: true,
  },
  {
    id: 'a-006',
    type: 'global_update',
    title: 'Global Situation Update',
    subtitle: '10 countries — 446 total cases',
    detail: 'WHO weekly situation report published. Southeast Asia on elevated watch.',
    countryCode: null,
    severity: 'MODERATE',
    timestamp: '2025-05-24T08:00:00Z',
    isNew: false,
  },
];

export default function TopIntelligenceBar() {
  return (
    <header className="flex-shrink-0 border-b border-white/[0.05] bg-[#0a0e1a]/90 backdrop-blur-sm">
      <div className="flex items-stretch h-[68px]">
        {/* Brand */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 border-r border-white/[0.05] min-w-[180px]">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-cyan-400">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                <circle cx="12" cy="12" r="3" fill="currentColor" className="text-cyan-500" />
              </svg>
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-[#0a0e1a] animate-pulse-slow" />
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-100 leading-none">GLOBAL</div>
            <div className="font-semibold text-sm text-cyan-400 leading-none">INTELLIGENCE</div>
            <div className="text-[9px] font-mono text-slate-600 mt-0.5 uppercase tracking-wider">Real-time outbreak signals</div>
          </div>
        </div>

        {/* Scrollable alert cards */}
        <div className="flex-1 overflow-hidden relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0a0e1a] to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0e1a] to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex items-center gap-2 px-4 h-full overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {ALERTS.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <AlertCard alert={alert} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* System status + View All */}
        <div className="flex-shrink-0 flex items-center gap-4 px-4 border-l border-white/[0.05]">
          <div className="text-right hidden xl:block">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
              <span className="text-[10px] font-mono text-green-400 uppercase">Operational</span>
            </div>
            <div className="text-[9px] text-slate-600 font-mono mt-0.5">
              {new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC
            </div>
            <div className="text-[9px] text-slate-600 font-mono">DATA SOURCES: 8</div>
          </div>
          <button className="px-3 py-1.5 rounded border border-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-wider hover:bg-cyan-500/10 transition-colors whitespace-nowrap">
            View All →
          </button>
        </div>
      </div>
    </header>
  );
}
