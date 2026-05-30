'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  MessageCircle,
  Users,
  Calendar,
  Clock,
  Flame,
  CalendarDays,
  TrendingUp,
  User,
  BarChart3,
  Image,
  Camera,
  Smartphone,
  Clipboard,
  Key,
  ArrowUp,
  Shield,
} from 'lucide-react';
import { parseChat } from '@/lib/parser';
import { analyzeChat } from '@/lib/stats';
import { generateAllRoasts } from '@/lib/roast';
import { AnalysisResult, RoastResult, RoastTone } from '@/types/chat';
import FileUpload from '@/components/FileUpload';
import PrivacyBanner from '@/components/PrivacyBanner';
import StatCard from '@/components/StatCard';
import PersonalityTag from '@/components/PersonalityTag';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';
import HeatmapChart from '@/components/HeatmapChart';
import PieChart from '@/components/PieChart';
import WordCloud from '@/components/WordCloud';
import { RoastPanel } from '@/components/RoastCard';
import Link from 'next/link';

type AppState = 'idle' | 'parsing' | 'done' | 'roasting';

export default function AnalyzePage() {
  const [state, setState] = useState<AppState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [roasts, setRoasts] = useState<RoastResult[] | null>(null);
  const [roastTone, setRoastTone] = useState<RoastTone>('savage');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) setApiKey(stored);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleFile = useCallback((content: string, name: string) => {
    setError(null);
    setState('parsing');
    setFileName(name);

    setTimeout(() => {
      try {
        const messages = parseChat(content);
        if (messages.length === 0) {
          setError(
            'No messages found in this file. Make sure you exported the chat correctly from WhatsApp.'
          );
          setState('idle');
          return;
        }
        const analysis = analyzeChat(messages);
        setResult(analysis);
        setState('done');
      } catch (err) {
        setError(
          `Failed to parse chat: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
        setState('idle');
      }
    }, 100);
  }, []);

  const handleGenerateRoasts = useCallback(async () => {
    if (!result || !apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setState('roasting');
    setRoasts(null);

    try {
      const generated = await generateAllRoasts(
        result.participants,
        roastTone,
        apiKey
      );
      setRoasts(generated);
    } catch (err) {
      console.error('Roast generation failed:', err);
      setError(
        'Failed to generate roasts. Check your API key and try again.'
      );
    } finally {
      setState('done');
    }
  }, [result, apiKey, roastTone]);

  const handleToneChange = useCallback(
    async (tone: RoastTone) => {
      setRoastTone(tone);
      if (!result || !apiKey) return;

      setState('roasting');
      setRoasts(null);
      try {
        const generated = await generateAllRoasts(result.participants, tone, apiKey);
        setRoasts(generated);
      } catch (err) {
        console.error('Roast regeneration failed:', err);
      } finally {
        setState('done');
      }
    },
    [result, apiKey]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Analyze Your Chat</h1>
        <PrivacyBanner />
      </div>

      {/* Upload section */}
      {state === 'idle' && !result && (
        <div className="space-y-4">
          <FileUpload onFile={handleFile} />
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* API Key input */}
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-sm text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <Key className="w-4 h-4" />
              {showApiKeyInput ? 'Hide API Key' : 'Set Gemini API Key'}
            </button>
            {showApiKeyInput && (
              <div className="space-y-2">
                <p className="text-xs text-muted">
                  Your key stays in your browser (localStorage). Never sent to any server.
                  Get one at{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    aistudio.google.com
                  </a>
                </p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key..."
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parsing state */}
      {state === 'parsing' && (
        <div className="text-center py-16 space-y-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted text-sm">Analyzing {fileName}...</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {/* Group overview */}
          <section>
            <h2 className="text-lg font-semibold mb-3 inline-flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              Group Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Total Messages"
                value={result.group.totalMessages.toLocaleString()}
                icon={<MessageCircle className="w-4 h-4" />}
              />
              <StatCard
                label="Participants"
                value={result.group.totalParticipants}
                icon={<Users className="w-4 h-4" />}
              />
              <StatCard
                label="Days Active"
                value={result.group.daysActive}
                icon={<Calendar className="w-4 h-4" />}
              />
              <StatCard
                label="Chat Age"
                value={`${result.group.chatAgeDays}d`}
                subtitle={
                  result.group.chatStartDate
                    ? `Since ${result.group.chatStartDate.toLocaleDateString()}`
                    : undefined
                }
                icon={<Clock className="w-4 h-4" />}
              />
              {result.group.mostDramaticDay && (
                <StatCard
                  label="Most Dramatic Day"
                  value={result.group.mostDramaticDay.count}
                  subtitle={result.group.mostDramaticDay.date.toLocaleDateString()}
                  icon={<Flame className="w-4 h-4" />}
                />
              )}
              {result.group.mostActiveMonth && (
                <StatCard
                  label="Most Active Month"
                  value={result.group.mostActiveMonth.count}
                  subtitle={result.group.mostActiveMonth.month}
                  icon={<CalendarDays className="w-4 h-4" />}
                />
              )}
              <StatCard
                label="Longest Streak"
                value={`${result.group.longestStreak}d`}
                icon={<TrendingUp className="w-4 h-4" />}
              />
            </div>
          </section>

          {/* Charts */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold inline-flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Charts
            </h2>
            <div className="grid lg:grid-cols-2 gap-4">
              <BarChart
                labels={result.participants.map((p) => p.name)}
                values={result.participants.map((p) => p.totalMessages)}
                label="Messages per Person"
                color="#38bdf8"
              />
              <BarChart
                labels={result.participants.map((p) => p.name)}
                values={result.participants.map((p) => p.totalWords)}
                label="Words per Person"
                color="#818cf8"
              />
              <BarChart
                labels={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
                values={result.group.messagesByHour}
                label="Messages by Hour of Day"
                color="#34d399"
                horizontal={false}
              />
              <BarChart
                labels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                values={result.group.messagesByDayOfWeek}
                label="Messages by Day of Week"
                color="#fbbf24"
                horizontal={false}
              />
              <LineChart
                labels={result.group.dailyActivity.map((d) => d.date)}
                values={result.group.dailyActivity.map((d) => d.count)}
                label="Daily Message Activity"
                color="#38bdf8"
              />
              <LineChart
                labels={result.group.monthlyActivity.map((m) => m.month)}
                values={result.group.monthlyActivity.map((m) => m.count)}
                label="Monthly Activity Trend"
                color="#f472b6"
              />
              <HeatmapChart
                data={result.group.hourDayHeatmap}
                label="Activity Heatmap (Day × Hour)"
              />
              <PieChart
                labels={result.participants.map((p) => p.name)}
                values={result.participants.map((p) => p.totalMessages)}
                label="Message Share"
              />
            </div>
          </section>

          {/* Per-person stats */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold inline-flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              Per-Person Stats
            </h2>
            {result.participants.map((p, i) => (
              <div
                key={p.name}
                className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-sm">#{i + 1}</span>
                    <h3 className="font-semibold">{p.name}</h3>
                  </div>
                  <PersonalityTag
                    tags={result.personalities.get(p.name) || []}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <StatCard label="Messages" value={p.totalMessages.toLocaleString()} />
                  <StatCard label="Words" value={p.totalWords.toLocaleString()} />
                  <StatCard
                    label="Avg Length"
                    value={`${p.avgMessageLength.toFixed(1)}w`}
                  />
                  <StatCard
                    label="Starter %"
                    value={`${Math.round(p.conversationStarterPercent)}%`}
                  />
                  <StatCard
                    label="Night Owl"
                    value={`${Math.round(p.nightOwlScore)}%`}
                  />
                  <StatCard
                    label="Active Hour"
                    value={`${p.mostActiveHour}:00`}
                  />
                  <StatCard
                    label="Avg Response"
                    value={
                      p.avgResponseTimeMinutes !== null
                        ? `${Math.round(p.avgResponseTimeMinutes)}m`
                        : 'N/A'
                    }
                  />
                  <StatCard label="Ghost Streak" value={`${p.longestGhostStreak}d`} />
                  <StatCard
                    label="Share"
                    value={`${Math.round(p.messageSharePercent)}%`}
                  />
                </div>

                {/* Top words per person */}
                {p.topWords.length > 0 && (
                  <WordCloud
                    words={p.topWords}
                    label={`${p.name}'s Most Used Words`}
                    width={400}
                    height={200}
                  />
                )}

                {/* Top emojis */}
                {p.topEmojis.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-medium">Top Emojis</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.topEmojis.map((e) => (
                        <span
                          key={e.emoji}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background text-sm"
                        >
                          {e.emoji} <span className="text-xs text-muted">×{e.count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* AI Roast section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent" />
                AI Roast
              </h2>
              {!roasts && state !== 'roasting' && (
                <button
                  onClick={handleGenerateRoasts}
                  className="px-5 py-2.5 rounded-xl bg-accent text-slate-900 font-semibold text-sm hover:bg-accent/90 transition-colors"
                >
                  Generate Roasts
                </button>
              )}
            </div>

            {!apiKey && !roasts && state === 'done' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200 inline-flex items-start gap-2">
                <ArrowUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Set your Gemini API key above to generate roasts. Your key stays in your browser.
              </div>
            )}

            <RoastPanel
              roasts={roasts || []}
              selectedTone={roastTone}
              onToneChange={handleToneChange}
              onRegenerate={handleGenerateRoasts}
              loading={state === 'roasting'}
            />
          </section>

          {/* Share card section */}
          {roasts && roasts.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2">
                <Image className="w-5 h-5 text-accent" />
                Share Your Results
              </h2>
              <p className="text-xs text-muted">
                Download shareable cards for Instagram, WhatsApp, or Twitter.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm hover:border-muted transition-colors">
                  <Camera className="w-4 h-4" />
                  Roast Card (Square)
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm hover:border-muted transition-colors">
                  <Smartphone className="w-4 h-4" />
                  Story Card
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-sm hover:border-muted transition-colors">
                  <BarChart3 className="w-4 h-4" />
                  Stats Card
                </button>
              </div>
            </section>
          )}

          {/* Challenge a friend */}
          {roasts && roasts.length > 0 && (
            <section className="bg-card rounded-2xl p-6 border border-border text-center space-y-4">
              <h2 className="text-lg font-semibold">Challenge a Friend</h2>
              <p className="text-sm text-muted">
                Share this with your WhatsApp group and see who gets the best roast.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const text =
                      'I just got roasted by AI based on my WhatsApp chat. See how you compare → burnread.vercel.app';
                    navigator.clipboard.writeText(text);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-muted transition-colors"
                >
                  <Clipboard className="w-4 h-4" />
                  Copy Share Text
                </button>
              </div>
            </section>
          )}

          {/* Reset */}
          <div className="text-center pt-4 pb-8">
            <button
              onClick={() => {
                setResult(null);
                setRoasts(null);
                setFileName(null);
                setState('idle');
              }}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              ← Upload a different chat
            </button>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      {!result && state === 'idle' && (
        <div className="text-center pt-4">
          <Link
            href="/"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      )}
    </div>
  );
}
