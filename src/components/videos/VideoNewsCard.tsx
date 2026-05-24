'use client';

import { motion } from 'framer-motion';
import type { YouTubeVideoItem } from '@/types';
import { getSafeVideoOpenUrl, sanitizeVideoTitle, sanitizeRelevanceTags } from '@/utils/youtubeUrlValidation';
import { formatShortDate } from '@/utils/dateUtils';
import { useUsageLogger } from '@/hooks/useUsageLogger';

interface VideoNewsCardProps {
  video: YouTubeVideoItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function VideoNewsCard({ video, isSelected, onSelect }: VideoNewsCardProps) {
  const { log } = useUsageLogger();

  const safeTitle = sanitizeVideoTitle(video.title);
  const safeTags = sanitizeRelevanceTags(video.relevanceTags);
  const openUrl = getSafeVideoOpenUrl(video);

  function handleSelect() {
    onSelect(video.id);
    log('youtube_video_selected', 'videos', 'success', {
      countryCode: video.countryCode,
      videoId: video.id,
      sourceType: video.sourceType,
    });
  }

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    if (!openUrl) return;
    log('youtube_video_opened', 'videos', 'success', {
      countryCode: video.countryCode,
      videoId: video.id,
      action: 'open_external',
    });
    // Opens in new tab with safety attributes — set via rel on the anchor
  }

  return (
    <motion.div
      onClick={handleSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-cyan-500/30 bg-cyan-500/[0.06]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
      }`}
    >
      {/* Thumbnail placeholder */}
      <div className="relative rounded-t-lg overflow-hidden bg-[#0a0e1a] aspect-video flex items-center justify-center border-b border-white/[0.04]">
        <div className="flex flex-col items-center gap-1 opacity-40">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-cyan-500">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">
            {video.sourceType === 'mock' ? 'DEMO VIDEO' : 'VIDEO'}
          </span>
        </div>

        {/* Channel badge */}
        <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
          <span className="text-[8px] font-mono text-slate-400 truncate max-w-[120px] block">
            {video.channelName}
          </span>
        </div>

        {/* Mock label */}
        {video.sourceType === 'mock' && (
          <div className="absolute top-1.5 right-1.5 bg-slate-800/80 rounded px-1 py-0.5">
            <span className="text-[7px] font-mono text-slate-500 uppercase">DEMO</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <h4 className="text-[11px] font-medium text-slate-200 leading-snug line-clamp-2 mb-1">
          {safeTitle}
        </h4>

        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
              {video.summary}
            </p>
          </motion.div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-0.5 mb-1.5">
          {safeTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[8px] font-mono text-slate-700 bg-white/[0.03] border border-white/[0.05] px-1 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-600">
            {formatShortDate(video.publishedAt)}
          </span>

          {openUrl && (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpen}
              className="text-[9px] font-mono text-cyan-600 hover:text-cyan-400 transition-colors flex items-center gap-0.5"
            >
              Open ↗
            </a>
          )}
        </div>

        {/* Safety label */}
        {isSelected && video.safetyLabel && (
          <p className="text-[8px] text-slate-700 font-mono mt-1 border-t border-white/[0.04] pt-1">
            ⓘ {video.safetyLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
