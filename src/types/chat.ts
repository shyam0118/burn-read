// WhatsApp Chat Analyzer — TypeScript types

export interface ParsedMessage {
  date: Date;
  sender: string;
  message: string;
  isSystem: boolean;
}

export interface ParticipantStats {
  name: string;
  totalMessages: number;
  totalWords: number;
  avgMessageLength: number;
  conversationStarterPercent: number;
  mostActiveHour: number;
  avgResponseTimeMinutes: number | null;
  longestGhostStreak: number;
  topWords: { word: string; count: number }[];
  topEmojis: { emoji: string; count: number }[];
  nightOwlScore: number;
  messageSharePercent: number;
}

export interface GroupStats {
  totalMessages: number;
  totalParticipants: number;
  daysActive: number;
  mostDramaticDay: { date: Date; count: number } | null;
  longestStreak: number;
  chatStartDate: Date | null;
  chatEndDate: Date | null;
  chatAgeDays: number;
  mostActiveMonth: { month: string; count: number } | null;
  messagesByHour: number[];
  messagesByDayOfWeek: number[];
  dailyActivity: { date: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
  hourDayHeatmap: number[][]; // 7 days × 24 hours
}

export interface PersonalityTag {
  iconName: string;
  label: string;
  description: string;
}

export type RoastTone = 'savage' | 'friendly' | 'bollywood' | 'cricket' | 'corporate';

export interface RoastResult {
  participantLabel: string; // "Person A" etc.
  realName: string;
  roast: string;
  tone: RoastTone;
}

export interface AnalysisResult {
  participants: ParticipantStats[];
  group: GroupStats;
  personalities: Map<string, PersonalityTag[]>;
}

export interface UploadState {
  status: 'idle' | 'parsing' | 'analyzing' | 'roasting' | 'done';
  fileName: string | null;
  error: string | null;
  result: AnalysisResult | null;
  roasts: RoastResult[] | null;
}
