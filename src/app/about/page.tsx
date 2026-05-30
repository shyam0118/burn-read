import Link from 'next/link';
import { Shield } from 'lucide-react';

function GitHubMark() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <Link
          href="/"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold">About Burn Read</h1>
      </div>

      <section className="space-y-4 text-sm leading-relaxed">
        <p className="text-muted">
          Burn Read is a free, open-source tool that lets you analyze your
          WhatsApp chats with full privacy. Upload your exported chat, get detailed analytics,
          and receive hilarious AI-generated roasts based on your messaging habits.
        </p>

        <h2 className="text-lg font-semibold pt-4">Why I Built This</h2>
        <p className="text-muted">
          WhatsApp groups are chaotic, funny, and full of personality. I wanted a way to
          visualize the patterns, who talks the most, who disappears for weeks, who messages
          at 3am — and turn it into something fun you can share with friends.
        </p>
        <p className="text-muted">
          The AI roast feature was the finishing touch. Instead of just showing numbers, the
          app roasts each person based on their chat behavior in a style you choose.
        </p>

        <h2 className="text-lg font-semibold pt-4">
          <span className="inline-flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Privacy First
          </span>
        </h2>
        <p className="text-muted">
          I designed this to be completely client-side. Your chat data never leaves your
          device. There is no backend server, no database, and no analytics tracking. When you
          generate a roast, only anonymous statistics are sent to the AI API — never actual
          messages or names.
        </p>
        <p className="text-muted">
          Read the full{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            privacy policy
          </Link>{' '}
          for details.
        </p>

        <h2 className="text-lg font-semibold pt-4">Tech Stack</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { name: 'Next.js', desc: 'App Router, TypeScript' },
            { name: 'Tailwind CSS', desc: 'Utility-first styling' },
            { name: 'Chart.js', desc: 'Charts & visualizations' },
            { name: 'D3.js', desc: 'Word cloud rendering' },
            { name: 'html2canvas', desc: 'Shareable card generation' },
            { name: 'Gemini API', desc: 'AI roast generation' },
            { name: 'Vercel', desc: 'Hosting & deployment' },
          ].map((tech) => (
            <div
              key={tech.name}
              className="bg-card rounded-lg p-3 border border-border"
            >
              <p className="font-medium text-xs">{tech.name}</p>
              <p className="text-xs text-muted">{tech.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold pt-4">Open Source</h2>
        <p className="text-muted">
          This project is open source on GitHub. You can inspect the code, contribute, report
          bugs, or fork it to build your own version. There are no hidden servers, no data
          collection, and no secrets.
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium hover:border-muted transition-colors"
        >
          <GitHubMark />
          View on GitHub
        </a>
      </section>
    </div>
  );
}
