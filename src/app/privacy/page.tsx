import Link from 'next/link';
import { Lock, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <Link
          href="/"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: May 2026</p>
      </div>

      <section className="space-y-4 text-sm leading-relaxed">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-200">
            <strong>TL;DR:</strong> Your WhatsApp chat data never leaves your device. Everything
            is processed in your browser using JavaScript. We cannot see, access, or store your
            messages.
          </p>
        </div>

        <h2 className="text-lg font-semibold pt-4">How It Works</h2>
        <p className="text-muted">
          When you upload a WhatsApp chat <code>.txt</code> file:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-muted">
          <li>
            The file is read by your browser using the FileReader API. It is{' '}
            <strong>never uploaded to any server</strong>.
          </li>
          <li>
            All parsing and analysis happens in JavaScript running in your browser. Messages,
            dates, names, word counts, and all statistics are computed locally.
          </li>
          <li>
            If you choose to generate AI roasts, only anonymous statistics are sent to the
            Gemini API. No message content, no real names (labels like Person A are used), no
            phone numbers, and no dates are transmitted.
          </li>
          <li>
            The API key you provide for Gemini is stored in your browser&apos;s{' '}
            <code>localStorage</code> and is sent directly from your browser to Google&apos;s
            API. It never touches any server we control.
          </li>
        </ol>

        <h2 className="text-lg font-semibold pt-4">What We Never Send Anywhere</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted">
          <li>Actual message content</li>
          <li>Real participant names (we use Person A, Person B, etc.)</li>
          <li>Phone numbers</li>
          <li>Dates or timestamps</li>
          <li>Your chat file</li>
        </ul>

        <h2 className="text-lg font-semibold pt-4">What Is Sent to Gemini API</h2>
        <p className="text-muted">
          Only aggregate statistics per person:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted">
          <li>Message count and word count</li>
          <li>Average message length</li>
          <li>Most active hour</li>
          <li>Conversation starter percentage</li>
          <li>Average response time</li>
          <li>Top 10 most used words (isolated, no context)</li>
          <li>Night owl score</li>
          <li>Ghost streak (days of silence)</li>
        </ul>

        <h2 className="text-lg font-semibold pt-4">Analytics</h2>
        <p className="text-muted">
          We use no cookies and no third-party tracking. If we add privacy-friendly analytics
          (like Plausible), they will be disclosed here and will not track individual users.
        </p>

        <h2 className="text-lg font-semibold pt-4">Open Source</h2>
        <p className="text-muted">
          This entire application is open source. You can inspect the code on GitHub to verify
          exactly how your data is handled. There is no backend server, no database, and no
          data collection.
        </p>

        <h2 className="text-lg font-semibold pt-4">Contact</h2>
        <p className="text-muted">
          If you have questions about privacy, open an issue on our GitHub repository or
          contact the maintainer through the About page.
        </p>
      </section>
    </div>
  );
}
