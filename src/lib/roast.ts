// OpenRouter roast integration — sends only anonymized stats, never actual messages
// Calls the server-side /api/roast proxy so the API key stays private

import { ParticipantStats, RoastResult, RoastTone } from '@/types/chat';

function buildStatBlock(stats: ParticipantStats, label: string): string {
  const hourLabel =
    stats.mostActiveHour >= 12
      ? `${stats.mostActiveHour % 12 || 12}pm`
      : `${stats.mostActiveHour}am`;

  return `### ${label}
- Messages sent: ${stats.totalMessages.toLocaleString()} (${Math.round(stats.messageSharePercent)}% of total chat)
- Avg message length: ${stats.avgMessageLength.toFixed(1)} words
- Most active hour: ${hourLabel}
- Conversation starter: ${Math.round(stats.conversationStarterPercent)}%
- Avg response time: ${stats.avgResponseTimeMinutes !== null ? Math.round(stats.avgResponseTimeMinutes) + ' minutes' : 'N/A'}
- Top words: ${stats.topWords.map((w) => w.word).join(', ') || 'none'}
- Night owl score: ${Math.round(stats.nightOwlScore)}%
- Ghost streak: ${stats.longestGhostStreak} days`;
}

export async function generateBatchedRoasts(
  batch: { stats: ParticipantStats; label: string }[],
  tone: RoastTone,
  turnstileToken?: string
): Promise<Record<string, string>> {
  const statBlocks = batch.map((item) => buildStatBlock(item.stats, item.label)).join('\n\n');

  const response = await fetch('/api/roast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statBlocks, tone, turnstileToken, isBatched: true }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API returned ${response.status}`);
  }

  const data = await response.json();
  return data.roasts; // Expecting { "Person A": "roast text", ... }
}

export async function generateAllRoasts(
  participants: ParticipantStats[],
  tone: RoastTone,
  turnstileToken?: string
): Promise<RoastResult[]> {
  // 1. Sort by activity and limit to top 15 to avoid massive API costs/timeouts
  // Most groups only care about the top participants anyway
  const topParticipants = [...participants]
    .sort((a, b) => b.totalMessages - a.totalMessages)
    .slice(0, 15);

  const results: RoastResult[] = [];
  const BATCH_SIZE = 5;
  
  // 2. Process in batches
  for (let i = 0; i < topParticipants.length; i += BATCH_SIZE) {
    const batchData = topParticipants.slice(i, i + BATCH_SIZE).map((p, index) => ({
      stats: p,
      label: `Person ${String.fromCharCode(65 + i + index)}`,
    }));

    try {
      const batchedRoasts = await generateBatchedRoasts(batchData, tone, turnstileToken);
      
      batchData.forEach((item) => {
        results.push({
          participantLabel: item.label,
          realName: item.stats.name,
          roast: batchedRoasts[item.label] || `AI was speechless about ${item.stats.name}.`,
          tone,
        });
      });
    } catch (error) {
      console.error(`Failed to generate roast batch starting at ${i}:`, error);
      // Fallback for failed batch
      batchData.forEach((item) => {
        results.push({
          participantLabel: item.label,
          realName: item.stats.name,
          roast: `Couldn't roast ${item.stats.name} right now. The AI is probably too intimidated. 😅`,
          tone,
        });
      });
    }
  }

  // Preserve the original order (by activity) which is what results already has
  return results;
}
