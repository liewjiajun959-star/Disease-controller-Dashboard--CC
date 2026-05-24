'use client';

import { useEffect } from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import { ClusterProvider } from '@/context/ClusterContext';
import TopIntelligenceBar from '@/components/top-bar/TopIntelligenceBar';
import LeftInfoPanel from '@/components/left-panel/LeftInfoPanel';
import GlobeViewer from '@/components/globe/GlobeViewer';
import RightCountryPanel from '@/components/right-panel/RightCountryPanel';
import AddressRadiusSearch from '@/components/address-search/AddressRadiusSearch';
import DevUsageLogPanel from '@/components/dev/DevUsageLogPanel';
import SecurityDisclaimer from '@/components/ui/SecurityDisclaimer';
import { logAppEvent } from '@/services/usageLogService';

function DashboardContent() {
  useEffect(() => {
    logAppEvent('app_loaded', 'app', 'info', { dataSource: 'mock', version: '1.0.0' });
    logAppEvent('mock_data_loaded', 'data', 'info', { countries: 10, clusters: 8, newsItems: 15 });
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0e1a] grid-bg">
      {/* Top intelligence bar */}
      <TopIntelligenceBar />

      {/* Main three-column layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left panel */}
        <div className="w-[300px] min-w-[280px] flex-shrink-0 overflow-hidden border-r border-white/[0.05]">
          <LeftInfoPanel />
        </div>

        {/* Center — globe + address search */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-hidden relative min-w-0">
          {/* Address search bar */}
          <div className="w-full max-w-2xl px-4 pt-3 pb-2 z-10">
            <AddressRadiusSearch />
          </div>

          {/* Globe */}
          <div className="flex-1 flex items-center justify-center w-full min-h-0">
            <GlobeViewer />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[340px] min-w-[320px] flex-shrink-0 overflow-hidden border-l border-white/[0.05]">
          <RightCountryPanel />
        </div>
      </div>

      {/* Footer / dev panel */}
      <DevUsageLogPanel />
    </div>
  );
}

export default function AppShell() {
  return (
    <DashboardProvider>
      <ClusterProvider>
        <DashboardContent />
        <SecurityDisclaimer />
      </ClusterProvider>
    </DashboardProvider>
  );
}
