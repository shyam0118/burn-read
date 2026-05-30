// WhatsApp Chat Parser — runs entirely in the browser
// Supports multiple WhatsApp export date formats, skips system messages,
// handles multi-line messages, and strips Unicode direction characters.

import { ParsedMessage } from '@/types/chat';

// Match WhatsApp message lines in various date formats
// Format 1: "27/05/2026, 10:30 - Sender Name: message"
// Format 2: "5/27/26, 10:30 AM - Sender Name: message"
// Format 3: "2026-05-27, 10:30 - Sender Name: message"
// Format 4: "[27/05/2026, 10:30:00] Sender Name: message" (iOS)
// Format 5: "27/05/2026, 10:30 AM - Sender Name: message"

const MESSAGE_PATTERNS = [
  // DD/MM/YYYY, HH:MM - Sender: message (most common)
  /^(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(.+?):\s*(.+)/,
  // DD/MM/YYYY, HH:MM AM/PM - Sender: message
  /^(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\s*-\s*(.+?):\s*(.+)/,
  // M/D/YY, HH:MM AM/PM - Sender: message (US format)
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?\s*[APap][Mm])\s*-\s*(.+?):\s*(.+)/,
  // YYYY-MM-DD, HH:MM - Sender: message (ISO)
  /^(\d{4}-\d{1,2}-\d{1,2}),\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(.+?):\s*(.+)/,
  // [DD/MM/YYYY, HH:MM:SS] Sender: message (iOS bracket format)
  /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}:\d{2})\]\s*(.+?):\s*(.+)/,
];

// System messages to skip
const SYSTEM_PHRASES = [
  'Messages and calls are end-to-end encrypted',
  'changed the subject to',
  'changed this group',
  'changed the group',
  'added',
  'removed',
  'left',
  'joined using this group',
  'created group',
  'You were added',
  'security code changed',
  'Your security code',
  'changed their phone number',
  'changed the group icon',
  'changed the group description',
  'deleted this message',
  'This message was deleted',
  'message was deleted',
  'changed to disappearing messages',
  'turned off disappearing messages',
  'group invite link was',
  'is now a group admin',
  'is no longer a group admin',
  'pinned a message',
  'started a call',
  'ended a call',
  'missed voice call',
  'missed video call',
  'video call',
  'voice call',
  'group call',
  'live location',
  'sticker',
  'image omitted',
  'video omitted',
  'audio omitted',
  'document omitted',
  'GIF omitted',
  'Contact card',
];

// Unicode direction characters to strip from names
const DIRECTION_CHARS = /[‎‏‪‫‬‭‮⁦⁧⁨⁩؜]/g;

// Emoji regex for extraction
const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{FE0F}]/gu;

function parseDate(dateStr: string, timeStr: string): Date | null {
  const cleanTime = timeStr.replace(/\s*[APap][Mm]/i, '').trim();
  const parts = dateStr.split(/[\/\-]/);

  if (parts.length !== 3) return null;

  let day: number, month: number, year: number;

  if (parts[0].length === 4) {
    // YYYY-MM-DD
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else if (parts[2].length === 4) {
    // DD/MM/YYYY
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
  } else {
    // M/D/YY or D/M/YY — try DD/MM/YY first (more common globally)
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
  }

  const [hours, minutes, seconds] = cleanTime.split(':').map(Number);
  const isPM = /pm/i.test(timeStr);
  const adjustedHours = isPM && hours < 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours;

  const date = new Date(year, month, day, adjustedHours, minutes, seconds || 0);
  return isNaN(date.getTime()) ? null : date;
}

function isSystemMessage(body: string): boolean {
  return SYSTEM_PHRASES.some((phrase) => body.toLowerCase().includes(phrase.toLowerCase()));
}

function stripDirectionChars(text: string): string {
  return text.replace(DIRECTION_CHARS, '').trim();
}

export function extractEmojis(text: string): string[] {
  const matches = text.match(EMOJI_REGEX);
  return matches || [];
}

export function extractWords(text: string): string[] {
  return text
    .replace(EMOJI_REGEX, '')
    .replace(/[^\w\sऀ-ॿ਀-੿઀-૿଀-୿]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.toLowerCase());
}

export function parseChat(fileContent: string): ParsedMessage[] {
  const lines = fileContent.split('\n');
  const messages: ParsedMessage[] = [];
  let currentMessage: ParsedMessage | null = null;

  for (const line of lines) {
    let matched = false;

    for (const pattern of MESSAGE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        // Save previous message before starting a new one
        if (currentMessage && !currentMessage.isSystem) {
          messages.push(currentMessage);
        }

        const dateStr = match[1];
        const timeStr = match[2];
        const sender = stripDirectionChars(match[3]);
        const body = match[4].trim();

        const date = parseDate(dateStr, timeStr);
        if (!date) {
          currentMessage = null;
          break;
        }

        currentMessage = {
          date,
          sender,
          message: body,
          isSystem: isSystemMessage(body),
        };

        matched = true;
        break;
      }
    }

    if (!matched && currentMessage) {
      // Continuation of a multi-line message
      currentMessage.message += '\n' + line;
    }
    // Lines that don't match and don't belong to a multi-line message are ignored
    // (WhatsApp header, encryption notices at top of export, empty lines, etc.)
  }

  // Push the last message
  if (currentMessage && !currentMessage.isSystem) {
    messages.push(currentMessage);
  }

  return messages;
}

export function getParticipantMessages(
  messages: ParsedMessage[],
  participant: string
): ParsedMessage[] {
  return messages.filter((m) => m.sender === participant);
}

export function getUniqueParticipants(messages: ParsedMessage[]): string[] {
  const names = new Set(messages.map((m) => m.sender));
  return Array.from(names);
}
