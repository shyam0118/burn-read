// Personality tag assignment based on chat statistics

import { ParticipantStats, PersonalityTag } from '@/types/chat';

export function assignPersonalities(stats: ParticipantStats): PersonalityTag[] {
  const tags: PersonalityTag[] = [];

  if (stats.nightOwlScore > 50) {
    tags.push({
      iconName: 'moon',
      label: 'Night Owl',
      description: `Sends ${Math.round(stats.nightOwlScore)}% of messages after 10pm`,
    });
  }

  // Early Bird: >50% messages before 8am
  if (stats.mostActiveHour < 8 && stats.mostActiveHour >= 4) {
    tags.push({
      iconName: 'sunrise',
      label: 'Early Bird',
      description: 'Most active before 8am',
    });
  }

  if (stats.avgMessageLength > 20) {
    tags.push({
      iconName: 'book-open',
      label: 'Novelist',
      description: `Average message is ${Math.round(stats.avgMessageLength)} words long`,
    });
  }

  if (stats.avgMessageLength < 3 && stats.totalMessages > 0) {
    tags.push({
      iconName: 'message-square',
      label: 'One-liner',
      description: 'Keeps it short and sweet',
    });
  }

  if (stats.longestGhostStreak > 7) {
    tags.push({
      iconName: 'ghost',
      label: 'Ghost',
      description: `Disappeared for ${stats.longestGhostStreak} days straight`,
    });
  }

  if (stats.conversationStarterPercent > 40) {
    tags.push({
      iconName: 'rocket',
      label: 'Conversation Starter',
      description: `Starts ${Math.round(stats.conversationStarterPercent)}% of daily conversations`,
    });
  }

  if (stats.messageSharePercent < 5) {
    tags.push({
      iconName: 'eye',
      label: 'Lurker',
      description: 'Quietly reading along',
    });
  }

  if (stats.avgResponseTimeMinutes !== null && stats.avgResponseTimeMinutes < 2) {
    tags.push({
      iconName: 'zap',
      label: 'Speed Replier',
      description: 'Replies in under 2 minutes on average',
    });
  }

  if (stats.avgResponseTimeMinutes !== null && stats.avgResponseTimeMinutes > 120) {
    tags.push({
      iconName: 'clock',
      label: 'Slow Replier',
      description: 'Takes over 2 hours to reply on average',
    });
  }

  // Emoji Addict: >3 emojis per message
  const totalEmojis = stats.topEmojis.reduce((sum, e) => sum + e.count, 0);
  if (stats.totalMessages > 0 && totalEmojis / stats.totalMessages > 3) {
    tags.push({
      iconName: 'smile',
      label: 'Emoji Addict',
      description: 'Uses more than 3 emojis per message on average',
    });
  }

  return tags;
}
