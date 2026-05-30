'use client';

import { useMemo } from 'react';

interface WordCloudProps {
  words: { word: string; count: number }[];
  label: string;
}

export default function WordCloud({
  words,
  label,
}: WordCloudProps) {
  const sortedWords = useMemo(() => {
    return [...words].sort((a, b) => b.count - a.count).slice(0, 20);
  }, [words]);

  // Shuffle for a more "cloud-like" feel
  const shuffledWords = useMemo(() => {
    // We use a simple pseudo-random sort that's stable for the same input
    // To satisfy "purity" we avoid naked Math.random() if the linter is strict,
    // but here we just want a non-linear visual.
    return [...sortedWords].sort((a, b) => {
      const hashA = a.word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = b.word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hashA % 7) - (hashB % 7);
    });
  }, [sortedWords]);

  const maxCount = sortedWords[0]?.count ?? 1;
  const minCount = sortedWords[sortedWords.length - 1]?.count ?? 1;

  const getFontSize = (count: number) => {
    if (maxCount === minCount) return '1rem';
    // Normalize count to a 0.75rem to 2rem range
    const size = 0.75 + ((count - minCount) / (maxCount - minCount)) * 1.25;
    return `${size}rem`;
  };

  const getOpacity = (count: number) => {
    if (maxCount === minCount) return 1;
    return 0.5 + ((count - minCount) / (maxCount - minCount)) * 0.5;
  };

  if (words.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">{label}</h3>
        <p className="text-muted text-sm text-center py-8">Not enough words</p>
      </div>
    );
  }

  return (
    <div className="bg-card/50 rounded-xl p-4 border border-border">
      <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-4">{label}</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center items-center">
        {shuffledWords.map((w, i) => (
          <span
            key={`${w.word}-${i}`}
            className="transition-all hover:scale-110 hover:text-accent cursor-default inline-block"
            style={{
              fontSize: getFontSize(w.count),
              opacity: getOpacity(w.count),
              fontWeight: w.count > maxCount * 0.5 ? '700' : '500',
              color: w.count === maxCount ? 'var(--color-accent)' : 'inherit',
            }}
          >
            {w.word}
          </span>
        ))}
      </div>
    </div>
  );
}
