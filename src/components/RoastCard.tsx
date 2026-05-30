'use client';

import { useState } from 'react';
import { RoastResult, RoastTone } from '@/types/chat';
import { Flame, Smile, Film, Trophy, Briefcase, RefreshCw } from 'lucide-react';

interface RoastCardProps {
  roast: RoastResult;
  rank: number;
}

const TONE_ICONS: Record<RoastTone, { icon: React.ReactNode; label: string }> = {
  savage: { icon: <Flame className="w-3.5 h-3.5" />, label: 'Savage' },
  friendly: { icon: <Smile className="w-3.5 h-3.5" />, label: 'Friendly' },
  bollywood: { icon: <Film className="w-3.5 h-3.5" />, label: 'Bollywood' },
  cricket: { icon: <Trophy className="w-3.5 h-3.5" />, label: 'Cricket' },
  corporate: { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Corporate' },
};

export default function RoastCard({ roast, rank }: RoastCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-muted transition-colors">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
              #{rank}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{roast.realName}</h3>
              <span className="text-[10px] text-muted uppercase tracking-wide inline-flex items-center gap-1">
                {TONE_ICONS[roast.tone].icon}
                {TONE_ICONS[roast.tone].label} Roast
              </span>
            </div>
          </div>
        </div>

        {/* Roast text */}
        <div className={`${expanded ? '' : 'line-clamp-3'} text-sm leading-relaxed`}>
          {roast.roast}
        </div>

        {roast.roast.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-accent mt-1 hover:underline"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  );
}

interface RoastPanelProps {
  roasts: RoastResult[];
  selectedTone: RoastTone;
  onToneChange: (tone: RoastTone) => void;
  onRegenerate: () => void;
  loading: boolean;
}

export function RoastPanel({
  roasts,
  selectedTone,
  onToneChange,
  onRegenerate,
  loading,
}: RoastPanelProps) {
  const tones: RoastTone[] = ['savage', 'friendly', 'bollywood', 'cricket', 'corporate'];

  return (
    <div className="space-y-4">
      {/* Tone selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted mr-1">Tone:</span>
        {tones.map((tone) => (
          <button
            key={tone}
            onClick={() => onToneChange(tone)}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedTone === tone
                ? 'bg-accent text-slate-900'
                : 'bg-card border border-border text-muted hover:text-foreground hover:border-muted'
            }`}
          >
            {TONE_ICONS[tone].icon}
            {TONE_ICONS[tone].label}
          </button>
        ))}
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50 transition-all"
        >
          {loading ? 'Roasting...' : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </>
          )}
        </button>
      </div>

      {/* Roast cards */}
      {loading && roasts.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted">AI is cooking up some roasts...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roasts.map((roast, i) => (
            <RoastCard key={roast.realName} roast={roast} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
