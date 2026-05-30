// Gemini API integration — sends only stats, never actual messages
// API key is stored in localStorage, never sent to any server

import { ParticipantStats, RoastResult, RoastTone } from '@/types/chat';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ROAST_PROMPTS: Record<RoastTone, string> = {
  savage: `You are a savage but friendly roast comedian. Roast this WhatsApp user based ONLY on their chat statistics. Be brutally honest, sharp, and funny. Use the numbers to make jokes. Keep it under 4 sentences. Do not be mean or offensive — it should feel like a friend roasting a friend. Address the person directly as "you".`,

  friendly: `You are a warm, fun friend playfully teasing another friend. Roast this WhatsApp user based ONLY on their chat statistics. Be light-hearted, funny, and make it feel like a friendly joke among close friends. Keep it under 4 sentences. Address the person directly as "you".`,

  bollywood: `You are a dramatic Bollywood scriptwriter. Roast this WhatsApp user based ONLY on their chat statistics using filmy references, dramatic Hindi dialogues, and Bollywood movie tropes. Mix Hindi and English (Hinglish). Keep it under 4 sentences. Make it dramatic and funny. Address the person directly as "you" or "tum".`,

  cricket: `You are a cricket commentator roasting a player's batting/bowling stats. Roast this WhatsApp user based ONLY on their chat statistics using cricket metaphors and analogies. Talk about strike rate, batting average, dot balls in conversation, etc. Keep it under 4 sentences. Make it funny for cricket fans. Address the person directly as "you".`,

  corporate: `You are giving an employee performance review. Roast this WhatsApp user based ONLY on their chat statistics formatted like a corporate performance review. Use terms like "KPIs", "deliverables", "quarterly results", "needs improvement", "areas of concern", "let's circle back". Keep it under 4 sentences. Make it funny for anyone who has worked in a corporate. Address the person directly as "you".`,
};

function buildStatPrompt(stats: ParticipantStats, label: string): string {
  const mostActivePeriod = `${stats.mostActiveHour}:00`;
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
  tone: RoastTone,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemPrompt = ROAST_PROMPTS[tone];
  const statBlock = buildStatPrompt(stats, label);
  const fullPrompt = `${systemPrompt}\n\n${statBlock}`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text();
}

export async function generateAllRoasts(
  participants: ParticipantStats[],
  tone: RoastTone,
  apiKey: string
): Promise<RoastResult[]> {
  const results: RoastResult[] = [];

  for (let i = 0; i < participants.length; i++) {
    const stats = participants[i];
    const label = `Person ${String.fromCharCode(65 + i)}`; // Person A, B, C...

    try {
      const roast = await generateRoast(stats, label, tone, apiKey);
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
