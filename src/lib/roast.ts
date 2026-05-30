// OpenRouter roast integration — sends only anonymized stats, never actual messages
// Calls the server-side /api/roast proxy so the API key stays private

import { ParticipantStats, RoastResult, RoastTone } from '@/types/chat';

function buildStatBlock(stats: ParticipantStats, label: string): string {
  const hourLabel =
    stats.mostActiveHour >= 12
      ? `${stats.mostActiveHour % 12 || 12}pm`
      : `${stats.mostActiveHour}am`;

  return `Stats:
- Messages sent: ${stats.totalMessages.toLocaleString()} (${Math.round(stats.messageSharePercent)}% of total chat)
- Avg message length: ${stats.avgMessageLength.toFixed(1)} words
- Most active hour: ${hourLabel}
- Conversation starter: ${Math.round(stats.conversationStarterPercent)}%
- Avg response time: ${stats.avgResponseTimeMinutes !== null ? Math.round(stats.avgResponseTimeMinutes) + ' minutes' : 'N/A'}
- Top words: ${stats.topWords.map((w) => w.word).join(', ') || 'none'}
- Night owl score: ${Math.round(stats.nightOwlScore)}%
- Ghost streak: ${stats.longestGhostStreak} days`;
}

export async function generateRoast(
  stats: ParticipantStats,
  label: string,
  tone: RoastTone
): Promise<string> {
  const statBlock = buildStatBlock(stats, label);

  const response = await fetch('/api/roast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statBlock, tone }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API returned ${response.status}`);
  }

  const data = await response.json();
  return data.roast;
}

export async function generateAllRoasts(
  participants: ParticipantStats[],
  tone: RoastTone
): Promise<RoastResult[]> {
  const results: RoastResult[] = [];

  for (let i = 0; i < participants.length; i++) {
    const stats = participants[i];
    const label = `Person ${String.fromCharCode(65 + i)}`;

    try {
      const roast = await generateRoast(stats, label, tone);
      results.push({
        participantLabel: label,
        realName: stats.name,
        roast,
        tone,
      });
    } catch (error) {
      console.error(`Failed to generate roast for ${stats.name}:`, error);
      results.push({
        participantLabel: label,
        realName: stats.name,
        roast: `Couldn't roast ${stats.name} right now. The AI is probably too intimidated. 😅`,
        tone,
      });
    }
  }

  return results;
}
