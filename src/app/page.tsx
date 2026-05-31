import Link from 'next/link';
import {
  Flame,
  Star,
  Lock,
  Upload,
  BarChart3,
  Tag,
  Image,
  Smartphone,
  Moon,
  LockOpen,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import FAQ from '@/components/FAQ';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-24">
      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Free & Open Source
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          Get Your WhatsApp Chat{' '}
          <span className="text-accent">Roasted by AI</span>
        </h1>
        <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Upload your WhatsApp chat export, see detailed analytics, fun charts,
          and get hilariously roasted by AI based on your messaging stats.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/analyze"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-accent text-slate-900 font-semibold text-sm hover:bg-accent/90 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4" />
            Analyze Your Chat
          </Link>
          <a
            href="https://github.com/shyam0118/burn-read"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 rounded-xl border border-border text-sm font-medium hover:bg-card transition-colors inline-flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4" />
            Star on GitHub
          </a>
        </div>
      </section>

      {/* Privacy badge */}
      <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
        <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-emerald-200 text-xs sm:text-sm">
          <strong>100% Private.</strong> Your chat never leaves your device.
          Everything is processed in your browser. No server, no uploads.
        </p>
      </div>

      {/* How it works */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Upload className="w-8 h-8 text-accent" />,
              title: '1. Export Chat',
              desc: 'Open WhatsApp, go to any chat, tap ⋮ → More → Export Chat → Without Media. Save the .txt file.',
            },
            {
              icon: <BarChart3 className="w-8 h-8 text-accent" />,
              title: '2. Upload & Analyze',
              desc: 'Drop your .txt file here. Your browser parses everything locally, no data is uploaded anywhere.',
            },
            {
              icon: <Flame className="w-8 h-8 text-accent" />,
              title: '3. Get Roasted',
              desc: 'AI generates funny roasts based only on stats (message count, active hours, etc.). Your messages stay private.',
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-card rounded-xl p-6 border border-border text-center space-y-3"
            >
              <div className="flex justify-center">{step.icon}</div>
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: <BarChart3 className="w-4 h-4 text-accent" />, title: 'Detailed Analytics', desc: 'Messages, words, active hours, response times, ghost streaks, and more.' },
            { icon: <TrendingUp className="w-4 h-4 text-accent" />, title: 'Beautiful Charts', desc: 'Bar charts, line graphs, heatmaps, pie charts, and word clouds.' },
            { icon: <Flame className="w-4 h-4 text-accent" />, title: 'AI Roasts', desc: '5 roast styles: Savage, Friendly, Bollywood, Cricket, and Corporate.' },
            { icon: <Tag className="w-4 h-4 text-accent" />, title: 'Personality Tags', desc: 'Night Owl, Ghost, Novelist, Speed Replier, and more — auto-assigned.' },
            { icon: <Image className="w-4 h-4 text-accent" />, title: 'Shareable Cards', desc: 'Download Instagram-ready cards with your stats and roasts.' },
            { icon: <Smartphone className="w-4 h-4 text-accent" />, title: 'Mobile First', desc: 'Works perfectly on phone — where most people export WhatsApp chats from.' },
            { icon: <Moon className="w-4 h-4 text-accent" />, title: 'Dark Mode', desc: 'Beautiful dark theme by default, looks great in screenshots.' },
            { icon: <LockOpen className="w-4 h-4 text-accent" />, title: 'No Login', desc: 'Zero friction. No signup, no account, no data collection.' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-4 border border-border space-y-1.5"
            >
              <div className="flex items-center gap-2">
                {feature.icon}
                <h3 className="font-semibold text-sm">{feature.title}</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="text-center bg-card rounded-2xl p-8 sm:p-12 border border-border">
        <h2 className="text-2xl font-bold mb-2">Ready to get roasted?</h2>
        <p className="text-sm text-muted mb-6">
          Export your WhatsApp chat and drop the file here. Takes 3 seconds.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-accent text-slate-900 font-semibold text-sm hover:bg-accent/90 transition-colors"
        >
          <Flame className="w-4 h-4" />
          Analyze Your Chat Now
        </Link>
      </section>
    </div>
  );
}
