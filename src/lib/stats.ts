// Stats calculation — runs entirely in the browser
// Takes parsed messages and computes all analytics

import {
  ParsedMessage,
  ParticipantStats,
  GroupStats,
  AnalysisResult,
  PersonalityTag,
} from '@/types/chat';
import {
  getUniqueParticipants,
  getParticipantMessages,
  extractEmojis,
  extractWords,
} from './parser';
import { assignPersonalities } from './personalities';

// Day names for display
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function daysBetween(d1: Date, d2: Date): number {
  const ms = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// --- Per-Participant Stats ---

export function calculateParticipantStats(
  messages: ParsedMessage[],
  participant: string,
  allMessages: ParsedMessage[]
): ParticipantStats {
  const msgs = getParticipantMessages(messages, participant);
  const totalMessages = msgs.length;
  const totalWords = msgs.reduce((sum, m) => sum + extractWords(m.message).length, 0);
  const totalLength = msgs.reduce((sum, m) => sum + m.message.length, 0);
  const avgMessageLength = totalMessages > 0 ? totalWords / totalMessages : 0;

  // Message share percent
  const messageSharePercent =
    allMessages.length > 0 ? (totalMessages / allMessages.length) * 100 : 0;

  // Conversation starter %
  const messagesByDay = new Map<string, ParsedMessage[]>();
  for (const m of allMessages) {
    const day = formatDate(m.date);
    if (!messagesByDay.has(day)) messagesByDay.set(day, []);
    messagesByDay.get(day)!.push(m);
  }

  let starterDays = 0;
  let totalDays = 0;
  for (const [, dayMsgs] of messagesByDay) {
    if (dayMsgs.length === 0) continue;
    totalDays++;
    const firstMsg = dayMsgs.reduce((earliest, m) =>
      m.date < earliest.date ? m : earliest
    );
    if (firstMsg.sender === participant) starterDays++;
  }
  const conversationStarterPercent = totalDays > 0 ? (starterDays / totalDays) * 100 : 0;

  // Most active hour
  const hourCounts = new Array(24).fill(0);
  for (const m of msgs) {
    hourCounts[m.date.getHours()]++;
  }
  const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Night owl score (% messages between 10pm and 4am)
  const nightMessages = msgs.filter((m) => {
    const h = m.date.getHours();
    return h >= 22 || h < 4;
  }).length;
  const nightOwlScore = totalMessages > 0 ? (nightMessages / totalMessages) * 100 : 0;

  // Avg response time
  // For each message by participant, find the previous message by someone else
  let totalResponseTime = 0;
  let responseCount = 0;
  for (let i = 1; i < allMessages.length; i++) {
    if (allMessages[i].sender === participant && allMessages[i - 1].sender !== participant) {
      const diff =
        (allMessages[i].date.getTime() - allMessages[i - 1].date.getTime()) / (1000 * 60);
      if (diff < 1440) {
        // Only count responses within 24 hours
        totalResponseTime += diff;
        responseCount++;
      }
    }
  }
  const avgResponseTimeMinutes = responseCount > 0 ? totalResponseTime / responseCount : null;

  // Longest ghost streak
  const sortedMsgs = [...msgs].sort((a, b) => a.date.getTime() - b.date.getTime());
  let longestGhostStreak = 0;
  if (sortedMsgs.length > 0) {
    let currentStreak = 0;
    for (let i = 1; i < sortedMsgs.length; i++) {
      const gap = daysBetween(sortedMsgs[i - 1].date, sortedMsgs[i].date);
      if (gap > 1) {
        currentStreak = Math.max(currentStreak, gap - 1);
        if (currentStreak > longestGhostStreak) {
          longestGhostStreak = currentStreak;
        }
        currentStreak = 0;
      }
    }
  }

  // Top words (exclude common stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
    'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every',
    'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'only', 'own', 'same', 'than', 'too', 'very', 'just', 'that', 'this',
    'it', 'its', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she',
    'him', 'her', 'they', 'them', 'i', 'am', 'if', 'then', 'now', 'also',
    'about', 'up', 'out', 'when', 'where', 'how', 'who', 'what', 'which',
    'there', 'here', 'ye', 'ok', 'okay', 'hmm', 'umm', 'haan', 'nahi',
    'hai', 'main', 'tum', 'hum', 'woh', 'aur', 'kya', 'theek', 'achha',
    'accha', 'yaar', 'bro', 'bhai', 'dude', 'man', 'lol', 'lmao',
  ]);

  const wordCounts = new Map<string, number>();
  for (const m of msgs) {
    for (const word of extractWords(m.message)) {
      if (!stopWords.has(word) && word.length > 1) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
  }
  const topWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // Top emojis
  const emojiCounts = new Map<string, number>();
  for (const m of msgs) {
    for (const emoji of extractEmojis(m.message)) {
      emojiCounts.set(emoji, (emojiCounts.get(emoji) || 0) + 1);
    }
  }
  const topEmojis = Array.from(emojiCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emoji, count]) => ({ emoji, count }));

  return {
    name: participant,
    totalMessages,
    totalWords,
    avgMessageLength,
    conversationStarterPercent,
    mostActiveHour,
    avgResponseTimeMinutes,
    longestGhostStreak,
    topWords,
    topEmojis,
    nightOwlScore,
    messageSharePercent,
  };
}

// --- Group Stats ---

export function calculateGroupStats(messages: ParsedMessage[]): GroupStats {
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      totalParticipants: 0,
      daysActive: 0,
      mostDramaticDay: null,
      longestStreak: 0,
      chatStartDate: null,
      chatEndDate: null,
      chatAgeDays: 0,
      mostActiveMonth: null,
      messagesByHour: new Array(24).fill(0),
      messagesByDayOfWeek: new Array(7).fill(0),
      dailyActivity: [],
      monthlyActivity: [],
      hourDayHeatmap: Array.from({ length: 7 }, () => new Array(24).fill(0)),
    };
  }

  const sorted = [...messages].sort((a, b) => a.date.getTime() - b.date.getTime());
  const totalMessages = messages.length;
  const participants = getUniqueParticipants(messages);
  const totalParticipants = participants.length;

  const chatStartDate = sorted[0].date;
  const chatEndDate = sorted[sorted.length - 1].date;
  const chatAgeDays = daysBetween(chatStartDate, chatEndDate);

  // Messages by hour
  const messagesByHour = new Array(24).fill(0);
  for (const m of messages) messagesByHour[m.date.getHours()]++;

  // Messages by day of week
  const messagesByDayOfWeek = new Array(7).fill(0);
  for (const m of messages) messagesByDayOfWeek[m.date.getDay()]++;

  // Daily activity
  const dailyMap = new Map<string, number>();
  for (const m of messages) {
    const day = formatDate(m.date);
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
  }
  const daysActive = dailyMap.size;
  const dailyActivity = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  // Most dramatic day
  let mostDramaticDay: { date: Date; count: number } | null = null;
  for (const [day, count] of dailyMap) {
    if (!mostDramaticDay || count > mostDramaticDay.count) {
      mostDramaticDay = { date: new Date(day), count };
    }
  }

  // Longest streak
  const activeDays = new Set(dailyMap.keys());
  let longestStreak = 0;
  let currentStreak = 0;
  const allDates = Array.from(activeDays).sort();
  for (let i = 1; i < allDates.length; i++) {
    const gap = daysBetween(new Date(allDates[i - 1]), new Date(allDates[i]));
    if (gap <= 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  if (longestStreak === 0 && activeDays.size > 0) longestStreak = 1;

  // Monthly activity
  const monthlyMap = new Map<string, number>();
  for (const m of messages) {
    const month = formatMonth(m.date);
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
  }
  const monthlyActivity = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));

  let mostActiveMonth: { month: string; count: number } | null = null;
  for (const [month, count] of monthlyMap) {
    if (!mostActiveMonth || count > mostActiveMonth.count) {
      mostActiveMonth = { month, count };
    }
  }

  // Hour × Day heatmap (7 days × 24 hours)
  const hourDayHeatmap: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  for (const m of messages) {
    hourDayHeatmap[m.date.getDay()][m.date.getHours()]++;
  }

  return {
    totalMessages,
    totalParticipants,
    daysActive,
    mostDramaticDay,
    longestStreak,
    chatStartDate,
    chatEndDate,
    chatAgeDays,
    mostActiveMonth,
    messagesByHour,
    messagesByDayOfWeek,
    dailyActivity,
    monthlyActivity,
    hourDayHeatmap,
  };
}

// --- Full Analysis ---

export function analyzeChat(messages: ParsedMessage[]): AnalysisResult {
  const participants = getUniqueParticipants(messages);
  const group = calculateGroupStats(messages);

  const participantStats: ParticipantStats[] = participants.map((p) =>
    calculateParticipantStats(messages, p, messages)
  );

  // Sort by message count descending
  participantStats.sort((a, b) => b.totalMessages - a.totalMessages);

  const personalities = new Map<string, PersonalityTag[]>();
  for (const stats of participantStats) {
    personalities.set(stats.name, assignPersonalities(stats));
  }

  return {
    participants: participantStats,
    group,
    personalities,
  };
}
