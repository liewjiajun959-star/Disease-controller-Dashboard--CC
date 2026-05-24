'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { YouTubeVideoItem } from '@/types';
import { fetchCountryVideos } from '@/services/youtubeVideoService';
import VideoNewsCard from './VideoNewsCard';
import { useUsageLogger } from '@/hooks/useUsageLogger';

interface CountryVideoNewsPanelProps {
  countryCode: string;
  countryName: string;
}

export default function CountryVideoNewsPanel({ countryCode, countryName }: CountryVideoNewsPanelProps) {
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { log } = useUsageLogger();

  useEffect(() => {
    fetchCountryVideos(countryCode).then((vids) => {
      setVideos(vids);
      setSelectedId(null);
      if (vids.length > 0) {
        log('country_video_section_viewed', 'videos', 'success', {
          countryCode,
          videoCount: vids.length,
        });
      }
    });
  }, [countryCode, log]);

  if (videos.length === 0) return null;

  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/[0.06]">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-red-500">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
          </svg>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {countryName} Hantavirus Videos
          </span>
          <span className="text-[9px] font-mono text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded">
            {videos.length}
          </span>
        </div>
        <span className="text-slate-600 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {/* Demo disclaimer */}
              <div className="mb-2 px-2 py-1.5 rounded bg-amber-500/[0.06] border border-amber-500/20">
                <p className="text-[9px] font-mono text-amber-600/70">
                  Demo data — Video entries are simulated for illustration. No real YouTube API connection in demo mode.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {videos.map((video) => (
                  <VideoNewsCard
                    key={video.id}
                    video={video}
                    isSelected={selectedId === video.id}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
