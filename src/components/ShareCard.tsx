'use client';

import { useCallback, useRef } from 'react';
import { Download } from 'lucide-react';
import { CardSize, CardTheme, getCardDimensions, THEME_COLORS } from '@/lib/shareCard';
import { captureElementToPng } from '@/lib/shareCard';

interface ShareCardProps {
  type: 'roast' | 'stats' | 'group' | 'comparison';
  data: Record<string, unknown>;
  size?: CardSize;
  theme?: CardTheme;
}

export default function ShareCard({
  type,
  data,
  size = 'square',
  theme = 'dark',
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const dimensions = getCardDimensions(size);
  const colors = THEME_COLORS[theme];

  const download = useCallback(async () => {
    if (!cardRef.current) return;
    const filename = `burnread-${type}-card-${Date.now()}.png`;
    await captureElementToPng(cardRef.current, filename);
  }, [type]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={download}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-slate-900 text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Card
        </button>
      </div>

      {/* The shareable card (hidden, captured by html2canvas) */}
      <div
        ref={cardRef}
        className="card-container"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          background: colors.bg,
          color: colors.text,
        }}
      >
        <div
          style={{
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            height: '100%',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 8,
              color: colors.text,
            }}
          >
            Burn Read
          </h1>
          <p
            style={{
              fontSize: 18,
              color: colors.accent,
              marginBottom: 32,
            }}
          >
            {type === 'roast' && 'AI Roast Card'}
            {type === 'stats' && 'Personal Stats'}
            {type === 'group' && 'Group Wrapped'}
            {type === 'comparison' && 'Who Loves This Chat More?'}
          </p>
          <div
            style={{
              fontSize: 14,
              color: colors.text,
              opacity: 0.6,
              marginTop: 'auto',
            }}
          >
            burnread.vercel.app
          </div>
        </div>
      </div>
    </div>
  );
}
