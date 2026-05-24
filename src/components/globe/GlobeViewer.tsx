'use client';

import dynamic from 'next/dynamic';
import LoadingState from '@/components/ui/LoadingState';

const GlobeCore = dynamic(() => import('./GlobeCore'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <LoadingState label="Initializing globe..." />
    </div>
  ),
});

export default function GlobeViewer() {
  return (
    <div className="flex flex-1 w-full items-center justify-center min-h-0 overflow-hidden">
      <GlobeCore />
    </div>
  );
}
